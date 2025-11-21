# GitHub Pages Deployment Guide

This guide provides multiple ways to deploy your Next.js application to GitHub Pages without requiring external authentication.

## 🚀 Deployment Options

### Option 1: Automatic Deployment (Recommended)

**GitHub Actions automatically deploys when you push to the main branch.**

#### Setup Steps:

1. **Enable GitHub Pages in Repository Settings:**
   - Go to your repository on GitHub
   - Navigate to `Settings` → `Pages`
   - Under "Source", select `GitHub Actions`
   - Save the settings

2. **Push your code to the main branch:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

3. **Automatic deployment will start:**
   - Check the `Actions` tab in your repository
   - The deployment workflow will run automatically
   - Your site will be available at: `https://amitojinfra.github.io/amitojinfra`

### Option 2: Manual Deployment

**Build locally and upload files manually.**

#### For Linux/Mac:
```bash
# Run the deployment script
./scripts/deploy.sh

# Or run commands manually:
npm run export
cp public/.nojekyll out/
```

#### For Windows:
```cmd
# Run the deployment script
scripts\deploy.bat

# Or run commands manually:
npm run export
copy public\.nojekyll out\
```

#### Upload to GitHub:

1. **Create gh-pages branch:**
   ```bash
   git checkout --orphan gh-pages
   git rm -rf .
   ```

2. **Copy built files:**
   - Copy all contents from the `out/` folder to the root of gh-pages branch
   
3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

4. **Configure GitHub Pages:**
   - Go to `Settings` → `Pages`
   - Select `Deploy from a branch`
   - Choose `gh-pages` branch and `/ (root)` folder

### Option 3: Using GitHub CLI (if available)

```bash
# Build the application
npm run export

# Create and push to gh-pages branch
gh repo create amitojinfra --public
git add .
git commit -m "Initial commit"
git push origin main
```

## 🔧 Configuration Details

### Repository Settings

1. **Pages Configuration:**
   - Source: `GitHub Actions` (for automatic) or `Deploy from a branch` (for manual)
   - Branch: `gh-pages` (for manual deployment)
   - Folder: `/ (root)`

2. **Required Files:**
   - `.nojekyll` - Prevents Jekyll processing
   - `out/` directory - Contains built static files
   - GitHub Actions workflow - Handles automatic deployment

### Environment Variables

The following are automatically configured:
- `NODE_ENV=production` during build
- `basePath=/amitojinfra` for proper asset paths
- `assetPrefix=/amitojinfra/` for resource loading

## 🛠️ Build Commands

- `npm run dev` - Development server
- `npm run export` - Build static files
- `npm run build:github` - Build and prepare for GitHub Pages
- `./scripts/deploy.sh` - Full deployment script (Linux/Mac)
- `scripts\deploy.bat` - Full deployment script (Windows)

## 🌐 Access Your Site

After deployment, your site will be available at:
**https://amitojinfra.github.io/amitojinfra**

## 🔍 Troubleshooting

### Common Issues:

1. **404 errors on page refresh:**
   - Ensure `.nojekyll` file is present
   - Check that `trailingSlash: true` is in `next.config.js`

2. **CSS/JS not loading:**
   - Verify `basePath` and `assetPrefix` in `next.config.js`
   - Ensure they match your repository name

3. **GitHub Actions failing:**
   - Check that Pages is enabled in repository settings
   - Verify the workflow has proper permissions
   - Check the Actions tab for error details

4. **Build failures:**
   - Run `npm run lint` to check for errors
   - Ensure all dependencies are installed with `npm install`

### Verification Steps:

1. **Check build output:**
   ```bash
   npm run export
   ls -la out/
   ```

2. **Verify .nojekyll file:**
   ```bash
   ls -la out/.nojekyll
   ```

3. **Test locally:**
   ```bash
   cd out
   python -m http.server 8000
   # Open http://localhost:8000
   ```

## 📝 Notes

- Static export means no server-side features (API routes, SSR)
- All pages are pre-generated at build time
- Contact form uses client-side JavaScript only
- Images are unoptimized for static hosting compatibility

## 🆘 Support

If you encounter issues:

1. Check the GitHub Actions logs in the `Actions` tab
2. Verify repository settings in `Settings` → `Pages`
3. Ensure all files are committed and pushed
4. Check that the repository is public (required for free GitHub Pages)

---

Choose the deployment option that works best for your workflow!