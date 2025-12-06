# Deployment troubleshooting

## Error: `main.tsx` served with MIME type `application/octet-stream`
This error means the host is serving the **source repo** (e.g., `index.html` plus `src/main.tsx`) instead of the compiled Vite bundle in `dist/`. Browsers refuse to execute the raw TypeScript file, so you must deploy the build output instead of the repository tree.

### Fix on GitHub Pages
1. In **Settings → Pages**, set **Source** to **GitHub Actions**.
2. Re-run the included **Deploy game to GitHub Pages** workflow (or push to `main`). It builds the app and uploads `dist/` as the Pages artifact.
3. After the deploy finishes, hard-refresh the site (or open the latest workflow logs) to confirm assets are loading from `/assets/…` instead of `/src/…`.

If you see the error again, verify that:
- The workflow succeeded and shows an uploaded Pages artifact.
- The Pages environment URL points to a deployment that lists hashed JS files under `/assets/` (the `dist` bundle). If the URL browses the repo contents, Pages is still serving the raw repository.

### Fix on Render Static Sites
Render behaves the same way: it must host the built `dist/` directory.
1. In Render, create a **Static Site** or edit your existing one.
2. **Build command:** `pnpm install --frozen-lockfile && pnpm run build`
3. **Publish directory:** `dist`
4. Ensure the environment variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_APP_ID` are set.
5. Redeploy. Confirm the published site serves `/assets/index-*.js` instead of `/src/main.tsx`.

### Local check before deploying
To confirm the bundle is generated correctly, run the build locally and open the output:
```bash
pnpm install
pnpm run build
npx serve dist  # or any static server
```
Open the served URL and verify that network requests load `/assets/index-*.js` without MIME errors.
