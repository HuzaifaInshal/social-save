# Social Save Workspace

Social Save is a workspace for organizing saved social media posts (Instagram, Facebook Reels, YouTube, TikTok) into recursive collections.

This repository is structured as a monorepo containing both the web application and the browser extension.

## Directory Structure

```
social-save/
├── web/              # Next.js web application
├── chrome-extension/ # Chrome extension for saving posts directly from browser
└── screenshots/      # Application screenshots and assets
```

![Social Save Dashboard Mockup](./screenshots/dashboard.png)

## Subprojects

### [Web Application](./web/README.md)
A Next.js + TypeScript dashboard for managing saved collections, rendering rich platform previews, and managing collections.

### [Chrome Extension](./chrome-extension/README.md)
A browser extension to easily clip and save posts directly from social platform websites into your Social Save collections.
