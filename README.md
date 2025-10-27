# Online Bookstore — Frontend-only (Client-side JSON)

This repository is a complete frontend-only implementation of the "Online Bookstore" assignment.
It follows the PDF you uploaded and the changes you requested:
- No SQL or backend — all data persisted as JSON in the browser `localStorage`.
- Dynamic client-side application (create/read/update/delete books, signup/login, cart, checkout).
- Built with Vite + React + Tailwind for a modern developer experience.

## What's included
- `index.html`, `src/App.jsx` (main single-file component), `src/main.jsx`, `src/styles.css`.
- Tailwind + PostCSS config for styling.
- `package.json` with scripts to run dev server, build, and preview.
- CI workflow example in `.github/workflows/ci.yml` (lint + build).

## Run locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start dev server:
   ```bash
   npm run dev
   ```
3. Open the displayed URL (usually http://localhost:5173).

Data persists in your browser localStorage under keys:
- `ob_books_v1` (books JSON)
- `ob_users_v1` (users JSON)
- `ob_current_user_v1` (logged-in user)
- `ob_cart_v1` (cart contents)

This is a client-side demo only — no backend, no SQL.

## Files matching the uploaded assignment PDF
The app implements the functionality required by your assignment PDF (catalog CRUD, user actions, health/verification via UI, CI config). If you need additional deliverables from the PDF (screenshots, demonstration checklist, or a report), tell me and I will generate them and include them in the archive.

