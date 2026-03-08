# Sharing the GMC Dashboard via GitHub

Share the web dashboard with third parties by publishing it on **GitHub Pages** from your GitHub account.

---

## 1. Push the repo to GitHub

If you haven’t already:

```bash
cd /Users/dnigga/Documents/Active_Projects/GMC
git init
git add .
git commit -m "GMC Dashboard + GitHub Pages deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/GMC.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username. Repo name can be `GMC` or anything you prefer (the share URL will use it).

---

## 2. Enable GitHub Pages (one-time)

1. Open your repo on GitHub: **https://github.com/YOUR_USERNAME/GMC**
2. Go to **Settings** → **Pages** (left sidebar).
3. Under **Build and deployment**:
   - **Source:** choose **GitHub Actions**.
4. Save. You don’t need to create a workflow; the repo already has `.github/workflows/deploy-pages.yml`.

---

## 3. Deploy

- **Automatic:** Every push to `main` (or `master`) runs the workflow and deploys the latest build.
- **Manual:** **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**.

After the workflow finishes, the site is live.

---

## 4. Share the URL with third parties

Your dashboard will be at:

**https://YOUR_USERNAME.github.io/REPO_NAME/**

Examples:

- Repo `GMC` → **https://dnigga.github.io/GMC/**
- Repo `gmc-dashboard` → **https://dnigga.github.io/gmc-dashboard/**

Send that link to anyone who should view the dashboard. No login is required unless you restrict the repo (and Pages) to private and use another way to restrict access.

---

## 5. Optional: private repo

- **Public repo:** Page is public; anyone with the link can open it.
- **Private repo:** GitHub Pages for private repos is available on paid plans (e.g. GitHub Pro). The workflow and URL behave the same; only who can open the site changes.

---

## Summary

| Step | Action |
|------|--------|
| 1 | Push repo to GitHub |
| 2 | Settings → Pages → Source: **GitHub Actions** |
| 3 | Push to `main` or run “Deploy to GitHub Pages” workflow |
| 4 | Share **https://YOUR_USERNAME.github.io/REPO_NAME/** |

The workflow builds the Vite app with the correct base path and deploys the `dist/` output to GitHub Pages.
