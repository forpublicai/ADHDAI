/**
 * APIErrorBanner — Displays user-friendly notifications for OpenAI API errors.
 * 
 * Subscribes to the global `onAPIError` event bus from openaiClient.ts.
 * Shows a dismissible banner with actionable guidance.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { onAPIError, ClassifiedError } from '../services/openaiClient';

const DISMISS_AFTER_MS = 15_000; // auto-dismiss after 15s for retriable errors

const APIErrorBanner: React.FC = () => {
  const [error, setError] = useState<ClassifiedError | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsub = onAPIError((err) => {
      setError(err);
      setVisible(true);

      // Auto-dismiss retriable errors after a delay
      if (err.retryable) {
        const timeout = setTimeout(() => setVisible(false), DISMISS_AFTER_MS);
        return () => clearTimeout(timeout);
      }
    });
    return unsub;
  }, []);

  const dismiss = useCallback(() => setVisible(false), []);

  if (!visible || !error) return null;

  const isQuota = error.kind === 'quota_exceeded';
  const isAuth = error.kind === 'auth_error';

  return (
    <div style={styles.overlay}>
      <div style={{
        ...styles.banner,
        borderLeftColor: isQuota || isAuth ? '#c41e3a' : '#D4A574',
      }}>
        <div style={styles.header}>
          <span style={styles.icon}>{isQuota ? '⚠' : isAuth ? '🔑' : '⏳'}</span>
          <span style={styles.title}>
            {isQuota
              ? 'API Quota Exceeded'
              : isAuth
                ? 'API Key Error'
                : error.kind === 'rate_limited'
                  ? 'Rate Limited — Retrying'
                  : 'API Error'}
          </span>
          <button onClick={dismiss} style={styles.closeBtn} aria-label="Dismiss">
            &times;
          </button>
        </div>

        <p style={styles.message}>{error.userMessage}</p>

        {isQuota && (
          <div style={styles.actions}>
            <a
              href="https://platform.openai.com/account/billing"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.link}
            >
              Check OpenAI Billing →
            </a>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.linkSecondary}
            >
              Manage API Keys
            </a>
          </div>
        )}

        {isAuth && (
          <p style={styles.hint}>
            Ensure your <code style={styles.code}>.env</code> file contains a valid{' '}
            <code style={styles.code}>VITE_OPENAI_API_KEY</code>. After updating, rebuild or restart the app.
          </p>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 16,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 99999,
    width: '100%',
    maxWidth: 560,
    padding: '0 16px',
    pointerEvents: 'none',
  },
  banner: {
    pointerEvents: 'auto',
    background: '#1a1a1a',
    borderLeft: '4px solid #c41e3a',
    borderRadius: 6,
    padding: '16px 20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: '#e0e0e0',
    animation: 'slideDown 0.3s ease-out',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  icon: {
    fontSize: 18,
  },
  title: {
    fontWeight: 600,
    fontSize: 14,
    letterSpacing: '0.02em',
    flex: 1,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    fontSize: 20,
    cursor: 'pointer',
    lineHeight: 1,
    padding: '0 4px',
  },
  message: {
    fontSize: 13,
    lineHeight: 1.5,
    color: '#bbb',
    margin: 0,
  },
  actions: {
    marginTop: 12,
    display: 'flex',
    gap: 16,
  },
  link: {
    fontSize: 12,
    fontWeight: 600,
    color: '#c41e3a',
    textDecoration: 'none',
  },
  linkSecondary: {
    fontSize: 12,
    color: '#888',
    textDecoration: 'none',
  },
  hint: {
    marginTop: 10,
    fontSize: 12,
    color: '#888',
    lineHeight: 1.5,
  },
  code: {
    background: '#2a2a2a',
    padding: '1px 5px',
    borderRadius: 3,
    fontSize: 11,
    fontFamily: "'JetBrains Mono', monospace",
  },
};

export default APIErrorBanner;
