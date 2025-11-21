@echo off
REM GitHub Pages Deployment Script for Windows
REM This script builds the Next.js app and prepares it for GitHub Pages deployment

echo 🚀 Starting GitHub Pages build process...

REM Clean previous build
if exist "out" (
    echo 🧹 Cleaning previous build...
    rmdir /s /q out
)

REM Build the application
echo 🔨 Building Next.js application...
call npm run export

REM Check if build was successful
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    exit /b 1
)

REM Copy .nojekyll file to prevent Jekyll processing
echo 📝 Copying .nojekyll file...
copy public\.nojekyll out\

REM Create CNAME file if needed (uncomment and modify for custom domain)
REM echo yourdomain.com > out\CNAME

echo ✅ Build complete!
echo.
echo 📁 Static files are ready in the 'out/' directory
echo.
echo 🌐 To deploy to GitHub Pages:
echo    1. Go to your GitHub repository
echo    2. Navigate to Settings → Pages
echo    3. Select 'Deploy from a branch'
echo    4. Choose 'gh-pages' branch and '/ (root)' folder
echo    5. Upload the contents of the 'out/' folder to the gh-pages branch
echo.
echo    OR use the GitHub Actions workflow for automated deployment
echo.