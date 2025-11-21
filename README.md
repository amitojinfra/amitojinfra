# AmitojInfra - Next.js Application

A modern Next.js application optimized for GitHub Pages deployment with multiple pages and static content generation.



## 🚀 Features

- ✅ **Static Site Generation**: Optimized for GitHub Pages hosting
- ✅ **Multiple Pages**: Home, Dashboard, Employee Management, and Attendance System
- ✅ **Firebase Authentication**: Google sign-in integration
- ✅ **Protected Routes**: Authentication-based access control
- ✅ **Responsive Design**: Mobile-first responsive layout
- ✅ **SEO Optimized**: Meta tags and proper page structure
- ✅ **Modern UI**: Clean and professional design
- ✅ **Automated Deployment**: GitHub Actions for CI/CD
- ✅ **Performance Optimized**: Static export for fast loading

## 📁 Project Structure

```
amitojinfra/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment
├── components/
│   ├── auth/                   # Authentication components
│   ├── layout/                 # Layout components
│   └── shared/                 # Shared/reusable components
├── contexts/
│   └── AuthContext.js          # Firebase auth context
├── lib/
│   └── firebase/               # Firebase configuration and services
├── pages/
│   ├── _app.js                 # Next.js app configuration
│   ├── index.js                # Home page
│   ├── employees.js            # Employee management page
│   ├── attendance/             # Attendance management pages
│   ├── auth.js                 # Authentication page
│   └── dashboard.js            # Protected dashboard page
├── public/
│   ├── .nojekyll               # GitHub Pages configuration
│   └── favicon.svg             # Site favicon
├── styles/
│   └── globals.css             # Global styles
├── .gitignore                  # Git ignore rules
├── next.config.js              # Next.js configuration
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/amitojinfra/amitojinfra.git
   cd amitojinfra
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Configure Firebase (Required for Authentication)**
   - Visit `http://localhost:3000/firebase-setup` after starting the dev server
   - Or follow the setup guide at `http://localhost:3000/firebase-setup-guide`
   - Configuration is stored in your browser's localStorage

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build the application
- `npm run start` - Start production server
- `npm run export` - Generate static files for deployment
- `npm run build:github` - Build and prepare for GitHub Pages
- `./scripts/deploy.sh` - Deploy script (Linux/Mac)
- `scripts\deploy.bat` - Deploy script (Windows)
- `npm run lint` - Run linting
- `npm run lint:fix` - Fix linting issues

## 🚀 Deployment to GitHub Pages

### Automatic Deployment (Recommended)

The repository includes GitHub Actions workflow for automatic deployment:

1. **Enable GitHub Pages:**
   - Go to repository **Settings** → **Pages**
   - Source: **GitHub Actions**
   - Save settings

2. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin main
   ```

3. **Site is live** at `https://amitojinfra.github.io/amitojinfra`

### Manual Deployment

For manual deployment without authentication:

#### Linux/Mac:
```bash
./scripts/deploy.sh
```

#### Windows:
```cmd
scripts\deploy.bat
```

#### Or manually:
```bash
npm run build:github
# Upload contents of 'out/' folder to gh-pages branch
```

### Detailed Instructions

See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive deployment guide with multiple options and troubleshooting.

## 🔧 Configuration

### Next.js Configuration

The `next.config.js` file is configured for GitHub Pages:

- **Static Export**: `output: 'export'`
- **Base Path**: `/amitojinfra` (repository name)
- **Trailing Slash**: Enabled for compatibility
- **Image Optimization**: Disabled for static export

### GitHub Pages Specific Settings

- `.nojekyll` file prevents Jekyll processing
- Asset prefix configured for proper resource loading
- Base path matches repository name

## 📄 Pages Overview

### Home Page (`/`)
- Welcome section with company introduction
- Feature cards highlighting services
- Call-to-action buttons

### Employee Management (`/employees`) - Protected
- Employee listing and management
- Add/edit employee information
- Employee profile management
- Search and filter capabilities

### Attendance System (`/attendance`) - Protected
- Attendance tracking and management
- Bulk attendance marking
- Attendance reports and analytics
- Real-time attendance monitoring

### Authentication Page (`/auth`)
- Google sign-in integration
- User profile display
- Authentication status management

### Dashboard Page (`/dashboard`) - Protected
- User profile information
- Account statistics
- Quick action buttons
- Recent activity feed
- Personalized content

## 🔐 Firebase Authentication

The application includes full Firebase authentication with:

- **Google Sign-in**: Secure OAuth integration
- **User Context**: Global authentication state management
- **Protected Routes**: Authentication-based access control
- **User Profile**: Display user information and avatar
- **Session Management**: Persistent login state

### Setup Required:
1. Create Firebase project
2. Enable Google authentication  
3. Configure via web interface (`/firebase-setup`)
4. Add authorized domains

**See `/firebase-setup-guide` page for detailed setup instructions.**

### Dynamic Configuration:
- ✅ **No environment files needed** - configure via web UI
- ✅ **localStorage based** - configuration stored in browser
- ✅ **User-friendly setup** - guided configuration process
- ✅ **Secure** - only required API Key and App ID needed

## 🎨 Styling

- **Global Styles**: Located in `styles/globals.css`
- **Responsive Design**: Mobile-first approach
- **CSS Grid**: For layout and card arrangements
- **CSS Variables**: For consistent theming
- **No External Dependencies**: Pure CSS implementation

## 🔍 SEO & Performance

- **Meta Tags**: Proper title and description for each page
- **Semantic HTML**: Proper heading hierarchy
- **Performance**: Static generation for fast loading
- **Mobile Friendly**: Responsive design
- **Lighthouse Score**: Optimized for good scores

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:

- **GitHub**: https://github.com/amitojinfra/amitojinfra
- **Issues**: [GitHub Issues](https://github.com/amitojinfra/amitojinfra/issues)
- **Documentation**: This README file

## 🔄 Next Steps

After setup, you can:

1. **Customize Content**: Update pages with your actual content
2. **Add More Pages**: Create additional pages as needed
3. **Enhance Styling**: Modify CSS or add CSS framework
4. **Add Features**: Implement additional functionality
5. **Connect Forms**: Integrate with form handling services
6. **Add Analytics**: Implement Google Analytics or similar
7. **SEO Enhancement**: Add sitemap and structured data

---

Built with ❤️ using [Next.js](https://nextjs.org/) and deployed on [GitHub Pages](https://pages.github.com/)