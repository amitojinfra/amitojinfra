# Firebase Authentication Setup Guide

This guide will help you configure Firebase authentication for your Next.js application.

## 📋 Prerequisites

- A Google account
- Access to [Firebase Console](https://console.firebase.google.com/)

## 🚀 Setup Steps

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `amitojinfra-app` (or your preferred name)
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Click on **Google**
5. Toggle **Enable**
6. Set the project support email
7. Click **Save**

### Step 3: Configure Web App

1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click the web icon `</>`
4. Enter app nickname: `amitojinfra-web`
5. Check **Also set up Firebase Hosting** (optional)
6. Click **Register app**
7. **Copy the config object** - you'll need these values!

### Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Firebase config values:
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-actual-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-actual-app-id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-actual-measurement-id
   ```

### Step 5: Configure Authorized Domains (Important!)

1. In Firebase Console, go to **Authentication** → **Settings** → **Authorized domains**
2. Add your domains:
   - `localhost` (for development)
   - `amitojinfra.github.io` (for GitHub Pages)
   - Any custom domain you plan to use

### Step 6: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/auth`
3. Click "Sign in with Google"
4. Complete the authentication flow

## 🔧 Configuration Files

The Firebase authentication is configured in these files:

- `lib/firebase/config.js` - Firebase configuration
- `lib/firebase/firebase.js` - Firebase app initialization
- `lib/firebase/auth.js` - Authentication service methods
- `contexts/AuthContext.js` - React context for auth state
- `components/auth/` - Authentication components

## 🌐 GitHub Pages Configuration

For GitHub Pages deployment, ensure:

1. **Authorized domains** include `amitojinfra.github.io`
2. **Environment variables** are properly set in production
3. **Static export** is enabled (already configured)

### Adding Environment Variables to GitHub Actions

If using GitHub Actions for deployment, add secrets:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Add each environment variable as a repository secret:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - etc.

## 🔐 Security Best Practices

1. **API Key**: Firebase API keys are safe to expose in client-side code
2. **Domain Restrictions**: Use authorized domains to restrict usage
3. **Security Rules**: Configure Firestore/Storage security rules if used
4. **Environment Variables**: Use `.env.local` for development secrets

## 🚨 Troubleshooting

### Common Issues:

1. **"Firebase: Error (auth/unauthorized-domain)"**
   - Add your domain to authorized domains in Firebase Console

2. **Configuration not found**
   - Check that `.env.local` exists and has correct values
   - Restart development server after adding environment variables

3. **Google Sign-in popup blocked**
   - Allow popups in browser settings
   - Try using `signInWithRedirect` instead of `signInWithPopup`

4. **Development vs Production**
   - Ensure production domain is added to authorized domains
   - Check that environment variables are set in production

## 📱 Features Included

- ✅ Google Sign-in with popup
- ✅ User profile display
- ✅ Authentication state management
- ✅ Protected routes
- ✅ Sign out functionality
- ✅ Loading states and error handling
- ✅ Responsive design

## 🔄 Next Steps

After setup, you can:

1. **Add more providers**: Facebook, Twitter, GitHub, etc.
2. **Customize UI**: Modify authentication components
3. **Add user roles**: Implement role-based access
4. **Database integration**: Connect Firestore for user data
5. **Email verification**: Enable email verification flow

## 📞 Support

If you need help:

1. Check the [Firebase Documentation](https://firebase.google.com/docs/auth)
2. Review the troubleshooting section above
3. Check browser console for error messages
4. Verify Firebase project configuration

---

**Important**: Keep your `.env.local` file secure and never commit it to version control!