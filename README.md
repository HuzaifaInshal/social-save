# Social Save

Next.js + TypeScript app for organizing saved social posts into nested collections with Firebase Auth and Firestore.

## Features

- Google-only sign-in with Firebase Authentication
- Recursive collections with collection-to-collection moves
- Post CRUD plus bulk import, move, and delete
- Collection bulk move/delete with confirmation flow
- Light and dark mode
- Landing page and authenticated dashboard

## Setup

1. Copy `.env.example` to `.env.local`.
2. Fill in your Firebase web app credentials.
3. Install dependencies with `pnpm install`.
4. Run the app with `pnpm dev`.

## Firebase

- Deploy [firestore.rules](/home/huzaifa/huzaifa/social-save/firestore.rules) to protect user data by `ownerId`.
- Deploy [firestore.indexes.json](/home/huzaifa/huzaifa/social-save/firestore.indexes.json) for the owner-and-title queries used by the dashboard.
