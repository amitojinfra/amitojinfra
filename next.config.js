/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for GitHub Pages
  output: 'export',
  
  // Add trailing slash to URLs for better compatibility with static hosting
  trailingSlash: true,
  
  // Skip server-side image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Set base path for GitHub Pages (repository name)
  // Update this to match your repository name if different
  basePath: process.env.NODE_ENV === 'production' ? '/amitojinfra' : '',
  
  // Asset prefix for GitHub Pages
  assetPrefix: process.env.NODE_ENV === 'production' ? '/amitojinfra/' : '',
  
  // Environment variables
  env: {
    CUSTOM_KEY: 'amitojinfra-app',
  },
  
  // Enable React strict mode
  reactStrictMode: true,
  
  // Configure ESLint
  eslint: {
    dirs: ['pages', 'components', 'lib', 'src'],
  },
}

module.exports = nextConfig