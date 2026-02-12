/**
 * Shared OpenAI Client & Error Handling
 * 
 * Centralizes:
 * - Client creation
 * - Error classification (quota exhaustion vs rate-limit vs other)
 * - Model cascade with smart early-bailout
 * - Retry with exponential backoff for rate-limit errors
 * - User-facing error events for UI notification
 */

import OpenAI from 'openai';

// ─── Error Classification ────────────────────────────────────────────────────

export type OpenAIErrorKind =
  | 'quota_exceeded'   // 429 — billing / plan limit (not retriable)
  | 'rate_limited'     // 429 — too many requests (retriable after delay)
  | 'auth_error'       // 401 — bad key
  | 'server_error'     // 5xx — transient
  | 'network_error'    // fetch failed
  | 'unknown';

export interface ClassifiedError {
  kind: OpenAIErrorKind;
  message: string;
  retryable: boolean;
  userMessage: string;  // safe to show in UI
}

/**
 * Classify an error thrown by the OpenAI SDK into an actionable category.
 */
export function classifyError(error: unknown): ClassifiedError {
  const raw = error instanceof Error ? error.message : String(error);

  // OpenAI SDK attaches status & code on APIError instances
  const status = (error as Record<string, unknown>)?.status as number | undefined;
  const code   = (error as Record<string, unknown>)?.code   as string | undefined;
  const type   = (error as Record<string, unknown>)?.type   as string | undefined;

  // ── Quota / billing exhaustion ──────────────────────────────────────────
  if (
    status === 429 &&
    (raw.includes('quota') ||
     raw.includes('billing') ||
     raw.includes('plan') ||
     code === 'insufficient_quota' ||
     type === 'insufficient_quota')
  ) {
    return {
      kind: 'quota_exceeded',
      message: raw,
      retryable: false,
      userMessage:
        'OpenAI API quota exceeded. Please check your plan and billing at platform.openai.com, or add a new API key.',
    };
  }

  // ── Rate limit (retriable after short delay) ───────────────────────────
  if (status === 429) {
    return {
      kind: 'rate_limited',
      message: raw,
      retryable: true,
      userMessage:
        'API rate limit reached — retrying automatically. If this persists, try again in a minute.',
    };
  }

  // ── Auth / key errors ──────────────────────────────────────────────────
  if (status === 401 || status === 403 || code === 'invalid_api_key') {
    return {
      kind: 'auth_error',
      message: raw,
      retryable: false,
      userMessage:
        'Invalid OpenAI API key. Please check your .env file and ensure VITE_OPENAI_API_KEY is correct.',
    };
  }

  // ── Server errors (retriable) ──────────────────────────────────────────
  if (status && status >= 500) {
    return {
      kind: 'server_error',
      message: raw,
      retryable: true,
      userMessage: 'OpenAI servers are temporarily unavailable. Retrying...',
    };
  }

  // ── Network errors ─────────────────────────────────────────────────────
  if (
    raw.includes('fetch') ||
    raw.includes('network') ||
    raw.includes('ECONNREFUSED') ||
    raw.includes('Failed to fetch')
  ) {
    return {
      kind: 'network_error',
      message: raw,
      retryable: true,
      userMessage: 'Network error — please check your internet connection.',
    };
  }

  return {
    kind: 'unknown',
    message: raw,
    retryable: false,
    userMessage: `API error: ${raw.slice(0, 120)}`,
  };
}

// ─── Event bus for UI notifications ──────────────────────────────────────────

export type APIErrorListener = (err: ClassifiedError) => void;

const listeners = new Set<APIErrorListener>();

/** Subscribe to API errors (for toast / banner display). Returns unsubscribe fn. */
export function onAPIError(listener: APIErrorListener): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function emitAPIError(err: ClassifiedError) {
  listeners.forEach(fn => {
    try { fn(err); } catch { /* swallow listener errors */ }
  });
}

// ─── Client factories ────────────────────────────────────────────────────────

let _chatClient: OpenAI | null = null;
let _imageClient: OpenAI | null = null;

export function getChatClient(): OpenAI {
  if (_chatClient) return _chatClient;
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    const err: ClassifiedError = {
      kind: 'auth_error',
      message: 'VITE_OPENAI_API_KEY is not set',
      retryable: false,
      userMessage: 'OpenAI API key is missing. Add VITE_OPENAI_API_KEY to your .env file.',
    };
    emitAPIError(err);
    throw new Error(err.userMessage);
  }
  _chatClient = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  return _chatClient;
}

export function getImageClient(): OpenAI {
  if (_imageClient) return _imageClient;
  const apiKey = import.meta.env.VITE_OPENAI_IMAGE_API_KEY;
  if (!apiKey) {
    const err: ClassifiedError = {
      kind: 'auth_error',
      message: 'VITE_OPENAI_IMAGE_API_KEY is not set',
      retryable: false,
      userMessage: 'OpenAI Image API key is missing. Add VITE_OPENAI_IMAGE_API_KEY to your .env file.',
    };
    emitAPIError(err);
    throw new Error(err.userMessage);
  }
  _imageClient = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  return _imageClient;
}

/** Reset cached clients (e.g. if user changes key at runtime) */
export function resetClients() {
  _chatClient = null;
  _imageClient = null;
}

// ─── Model cascade with smart error handling ─────────────────────────────────

const CHAT_MODELS = ['gpt-4o', 'gpt-4o-mini'] as const;

const MAX_RETRIES_RATE_LIMIT = 3;
const INITIAL_BACKOFF_MS = 2000;

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Call OpenAI chat completions with model cascade and smart error handling.
 *
 * - Quota errors → emit event & throw immediately (no cascade)
 * - Auth errors  → emit event & throw immediately
 * - Rate limits  → retry with exponential backoff up to MAX_RETRIES
 * - Server errors → retry once then cascade
 */
export async function chatWithCascade(
  params: Omit<OpenAI.ChatCompletionCreateParamsNonStreaming, 'model'>,
  tag = 'OpenAI',
): Promise<string> {
  const openai = getChatClient();
  const errors: string[] = [];

  for (const model of CHAT_MODELS) {
    let retries = 0;

    while (true) {
      try {
        const response = await openai.chat.completions.create({ model, ...params });
        const content = response.choices[0]?.message?.content?.trim();
        if (content) return content;
        // Empty response — try next model
        errors.push(`${model}: empty response`);
        break;
      } catch (error: unknown) {
        const classified = classifyError(error);

        // ── Non-retriable errors → bail immediately ──
        if (classified.kind === 'quota_exceeded' || classified.kind === 'auth_error') {
          console.error(`[${tag}] ${classified.kind}: ${classified.message}`);
          emitAPIError(classified);
          throw new Error(classified.userMessage);
        }

        // ── Retriable → backoff then retry or cascade ──
        if (classified.retryable && retries < MAX_RETRIES_RATE_LIMIT) {
          const delay = INITIAL_BACKOFF_MS * Math.pow(2, retries);
          console.warn(`[${tag}] ${model} ${classified.kind}, retry ${retries + 1}/${MAX_RETRIES_RATE_LIMIT} in ${delay}ms`);
          await sleep(delay);
          retries++;
          continue;
        }

        // ── Exhausted retries or non-retriable for this model → cascade ──
        const errMsg = classified.message;
        console.warn(`[${tag}] ${model} failed: ${errMsg}`);
        errors.push(`${model}: ${errMsg}`);
        break;
      }
    }
  }

  // All models failed
  const allFailedErr: ClassifiedError = {
    kind: 'unknown',
    message: errors.join('\n'),
    retryable: false,
    userMessage: `All AI models failed. ${errors[0]?.includes('quota') ? 'Your OpenAI quota may be exceeded — check platform.openai.com.' : 'Please try again in a moment.'}`,
  };
  emitAPIError(allFailedErr);
  throw new Error(`[${tag}] All models failed:\n${errors.join('\n')}`);
}

/**
 * Single model call (no cascade) with retry logic.
 * Useful for CanvasWorkspace's inline calls.
 */
export async function chatSingle(
  model: string,
  params: Omit<OpenAI.ChatCompletionCreateParamsNonStreaming, 'model'>,
  tag = 'OpenAI',
): Promise<string> {
  const openai = getChatClient();
  let retries = 0;

  while (true) {
    try {
      const response = await openai.chat.completions.create({ model, ...params });
      const content = response.choices[0]?.message?.content?.trim();
      if (content) return content;
      throw new Error('Empty response from API');
    } catch (error: unknown) {
      const classified = classifyError(error);

      if (classified.kind === 'quota_exceeded' || classified.kind === 'auth_error') {
        emitAPIError(classified);
        throw new Error(classified.userMessage);
      }

      if (classified.retryable && retries < MAX_RETRIES_RATE_LIMIT) {
        const delay = INITIAL_BACKOFF_MS * Math.pow(2, retries);
        console.warn(`[${tag}] ${model} ${classified.kind}, retry ${retries + 1}/${MAX_RETRIES_RATE_LIMIT} in ${delay}ms`);
        await sleep(delay);
        retries++;
        continue;
      }

      emitAPIError(classified);
      throw new Error(`[${tag}] ${model} failed: ${classified.userMessage}`);
    }
  }
}
