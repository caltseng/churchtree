# Hosting plan (Azure)

This historical proposal predates the current GitHub Pages setup. See the [current deployment guide](../docs/deployment.md) for the active hosting and build workflow.

## Goal
Host the ChurchTree static site on Azure using existing Azure credits with a repeatable deployment flow.

## Repository
- GitHub repo: https://github.com/caltseng/churchtree

## Current site shape
- Static HTML entry point: `index.html`
- Data bundle generated into `data/data.js`
- Local build step: `powershell -ExecutionPolicy Bypass -File scripts/build-data-js.ps1`
- For now, `data/data.js` can remain committed to reduce moving parts. Generating it in CI is an aspirational goal.

## Recommended hosting option: Azure Static Web Apps (SWA)
Best fit for static content with GitHub integration and auto‑deploy on push.

### One‑time setup
1) Ensure the repo is pushed to GitHub (already at the URL above).
2) In Azure Portal → **Static Web Apps** → **Create**.
3) Source: GitHub; select repo + branch.
4) Build configuration:
   - App location: `/`
   - Output location: `/`
   - API location: *(blank)*
5) Create the resource. This will generate a GitHub Actions workflow.

### Build step in CI (aspirational)
Add a build step to run the PowerShell data bundle script before deployment, once ready to remove the committed `data/data.js`.

Example (GitHub Actions):
- Use `windows-latest` or ensure PowerShell is available.
- Run `scripts/build-data-js.ps1`.

### Deploy
- Push to the configured branch.
- GitHub Actions deploys to the SWA environment.

### Validate
- Open the SWA default URL and confirm the graph renders.
- Verify `data/data.js` is present in the deployed site.

## Alternative option: Azure Storage Static Website
Simpler if CI/CD is not needed, but manual upload is required.

### One‑time setup
1) Create a Storage Account.
2) Enable **Static website**.
3) Upload `index.html` and `data/data.js` to the `$web` container.

### Deploy
- Run the build script locally.
- Upload updated files to `$web` after each change.

## Optional enhancements
- Custom domain + TLS via SWA custom domains.
- Azure Front Door or CDN for caching/global performance.

## Ownership and updates
- Data updates require re‑running `scripts/build-data-js.ps1` before deploy.
- CI should be the source of truth for generating `data/data.js`.
