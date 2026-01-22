# Deployment Guide

This project is set up to deploy to GitHub Pages automatically.

## How It Works

1. **Landing Page** (`/`) - Static content explaining ADHDAI
2. **Agency** (`/agency`) - Interactive agentic design simulation

## Automatic Deployment

When you push to the `main` branch, GitHub Actions will:
1. Build the React app
2. Deploy it to GitHub Pages

The site will be available at: `https://[your-username].github.io/ADHDAI/`

## Manual Deployment

If you want to deploy manually:

```bash
# Build the app
npm run build

# The dist/ folder contains the built files
# You can deploy this to any static hosting service
```

## Local Development

```bash
npm run dev
```

Visit `http://localhost:5173` to see the landing page, or `http://localhost:5173/agency` for the interactive agency.

## GitHub Pages Configuration

1. Go to your repository Settings → Pages
2. Under "Source", select "GitHub Actions" (not "Deploy from a branch")
3. The workflow will automatically deploy on every push to main

## Base Path

The app uses HashRouter for maximum compatibility with GitHub Pages. The base path is set to `./` (relative), which works for both local development and GitHub Pages deployment.

If you need to change the base path, update `vite.config.ts`:

```typescript
base: './',  // Relative paths work everywhere
```

## Routes

- `/` or `/#/` - Landing page with static content
- `/agency` or `/#/agency` - Interactive agency simulation

HashRouter ensures routes work correctly on GitHub Pages without additional server configuration.
