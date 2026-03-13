# Sharing the GMC Dashboard via GitHub

Share the web dashboard with third parties by publishing it on **GitHub Pages** from your GitHub account.

**This repo:** `AUTOGIO/GMC` → share URL: **https://autogio.github.io/GMC/**

---

## 1. Push the repo to GitHub (if needed)

If the repo is not yet on GitHub or you need to push:

```bash
cd /Users/eduardogiovannini/dev/products/GMC
git add .
git commit -m "GMC Dashboard + GitHub Pages deploy"  # if you have changes
git push -u origin main
```

Remote is already set to `https://github.com/AUTOGIO/GMC.git`.

---

## 2. Enable GitHub Pages (one-time)

1. Open **https://github.com/AUTOGIO/GMC**
2. Go to **Settings** → **Pages** (left sidebar).
3. Under **Build and deployment**:
   - **Source:** choose **GitHub Actions**.
4. Save. The repo already has `.github/workflows/deploy-pages.yml`.

---

## 3. Deploy

- **Automatic:** Every push to `main` runs the workflow and deploys the latest build.
- **Manual:** **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**.

After the workflow finishes, the site is live.

---

## 4. Share the URL with third parties

**Dashboard URL:** **https://autogio.github.io/GMC/**

Send that link to anyone who should view the dashboard. No login is required for a public repo.

---

## 5. Optional: private repo

- **Public repo:** Page is public; anyone with the link can open it.
- **Private repo:** GitHub Pages for private repos requires a paid plan (e.g. GitHub Pro). The workflow and URL behave the same.

---

## Summary

| Step | Action |
|------|--------|
| 1 | Push to `main` (or ensure repo is on GitHub) |
| 2 | Settings → Pages → Source: **GitHub Actions** |
| 3 | Push to `main` or run “Deploy to GitHub Pages” workflow |
| 4 | Share **https://autogio.github.io/GMC/** |

The workflow builds the Vite app with base path `/GMC/` and deploys `dist/` to GitHub Pages.
