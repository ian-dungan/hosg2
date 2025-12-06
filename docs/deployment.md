# Deployment Guide

This project is a static React + Vite frontend that talks directly to Supabase. You can host the build on GitHub Pages while keeping Supabase for data and (optionally) mirror the static build to Render.

## 1) Prepare Supabase
1. Create a Supabase project and grab the **Project URL** and **anon key** (Project Settings → API).
2. Apply the schema in `supabase/migrations/00001_create_game_tables.sql` to seed the tables. You can run it in the Supabase SQL editor.
3. (Optional) Create a service role key for future admin scripts, but keep using the anon key for the public client in this app.

## 2) Configure GitHub Pages deployment (recommended)
The repository now contains `.github/workflows/deploy.yml`, which builds the site and publishes the `dist/` artifact to GitHub Pages.

1. In your GitHub repository settings:
   - Go to **Pages** and set **Source** to **GitHub Actions**.
2. Add repository secrets (Settings → Secrets and variables → Actions → New repository secret):
   - `VITE_SUPABASE_URL` → your Supabase project URL.
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon key.
   - `VITE_APP_ID` → the app id used by the hosted build (optional, but the workflow expects it).
3. Push to `main` (or trigger **Run workflow** manually). The action will:
   - Install dependencies via pnpm.
   - Build with `vite build --base=./` for GitHub Pages-friendly relative assets.
   - Deploy the artifact with `actions/deploy-pages`.
4. Your site will be available at the Pages URL shown after the deploy step. Because the router now uses a hash history, direct refreshes will work without extra rewrites.

### If you still see `main.tsx` MIME errors on Pages
That error means Pages is serving the raw repository (so `/src/main.tsx` is shipped as TypeScript) instead of the built `dist/` artifact. Double-check that **Pages → Source** is set to **GitHub Actions** and that the latest workflow run succeeded. If you prefer manual hosting (e.g., without Actions), run `pnpm run build` locally and upload the contents of `dist/` to your hosting provider; do **not** point the host directly at the repository root.

## 3) Optional: mirror the static build on Render
If you prefer Render for hosting (e.g., as a fallback or to test before promoting to Pages):

1. In Render, create a **Static Site** pointing to this repository.
2. Build command: `pnpm install --frozen-lockfile && pnpm run build`
3. Publish directory: `dist`
4. Environment variables: add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_APP_ID`.
5. Save and deploy. Render will serve the same static bundle that works on Pages.

## 4) Local smoke test
```bash
pnpm install
pnpm run dev -- --host 127.0.0.1
```
Visit the shown localhost URL and confirm the Supabase-backed flows work before pushing.
