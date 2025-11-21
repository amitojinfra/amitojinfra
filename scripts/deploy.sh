#!/bin/bash

# GitHub Pages Deployment Script
# This script builds the Next.js app and prepares it for GitHub Pages deployment

echo "🚀 Starting GitHub Pages build process..."

# Clean previous build
if [ -d "out" ]; then
    echo "🧹 Cleaning previous build..."
    rm -rf out
fi

# Build the application
echo "🔨 Building Next.js application..."
npm run export

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Copy .nojekyll file to prevent Jekyll processing
echo "📝 Copying .nojekyll file..."
cp public/.nojekyll out/

# Create CNAME file if needed (uncomment and modify for custom domain)
# echo "yourdomain.com" > out/CNAME

echo "✅ Build complete!"
echo ""
echo "📁 Static files are ready in the 'out/' directory"
echo ""
echo "🌐 To deploy to GitHub Pages:"
echo "   1. Go to your GitHub repository"
echo "   2. Navigate to Settings → Pages"
echo "   3. Select 'Deploy from a branch'"
echo "   4. Choose 'gh-pages' branch and '/ (root)' folder"
echo "   5. Upload the contents of the 'out/' folder to the gh-pages branch"
echo ""
echo "   OR use the GitHub Actions workflow for automated deployment"
echo ""