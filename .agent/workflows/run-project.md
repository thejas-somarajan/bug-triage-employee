---
description: Steps to successfully run the Employee Management Dashboard project
---

# How to Run the Employee Management Dashboard Project

This guide provides step-by-step instructions to set up and run the Employee Management Dashboard project on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

1. **Node.js** (version 18.x or higher recommended)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **npm** (comes with Node.js) or **pnpm** (optional)
   - Verify npm: `npm --version`
   - To install pnpm: `npm install -g pnpm`

3. **Git** (optional, for version control)
   - Download from: https://git-scm.com/

## Project Setup Steps

### Step 1: Navigate to the Project Directory

Open your terminal/command prompt and navigate to the project folder:

```bash
cd "e:\College Projects\Employee Management Dashboard"
```

### Step 2: Install Dependencies

Install all required packages using npm:

```bash
npm install
```

**Alternative (if using pnpm):**
```bash
pnpm install
```

> **Note:** This will install all dependencies listed in `package.json`, including Next.js, React, Radix UI components, Tailwind CSS, and other libraries.

### Step 3: Start the Development Server

Run the development server:

```bash
npm run dev
```

**Alternative (if using pnpm):**
```bash
pnpm dev
```

### Step 4: Access the Application

Once the server starts successfully, you should see output similar to:

```
▲ Next.js 16.0.10
- Local:        http://localhost:3000
- Ready in X.Xs
```

Open your web browser and navigate to:
```
http://localhost:3000
```

## Available Scripts

The project includes the following npm scripts:

- **`npm run dev`** - Starts the development server (hot-reload enabled)
- **`npm run build`** - Creates an optimized production build
- **`npm run start`** - Runs the production build (must run `npm run build` first)
- **`npm run lint`** - Runs ESLint to check code quality

## Project Structure Overview

```
Employee Management Dashboard/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable React components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
├── public/                # Static assets
├── styles/                # Additional styles
├── package.json           # Project dependencies
├── next.config.mjs        # Next.js configuration
└── tsconfig.json          # TypeScript configuration
```

## Technology Stack

This project is built with:

- **Next.js 16.0.10** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS 4.1.9** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Recharts** - Charting library
- **React Hook Form** - Form management
- **Zod** - Schema validation

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, you can:
1. Stop the process using port 3000
2. Or run on a different port: `npm run dev -- -p 3001`

### Module Not Found Errors

If you encounter module errors:
```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

### Build Errors

The project has TypeScript build errors ignored (`ignoreBuildErrors: true` in `next.config.mjs`). If you want to see TypeScript errors during development, check your IDE's TypeScript output.

### Clear Next.js Cache

If you experience unexpected behavior:
```bash
# Delete .next folder
rm -rf .next

# Restart dev server
npm run dev
```

## Production Deployment

To create a production build:

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

The production server will run on `http://localhost:3000` by default.

## Additional Notes

- The project uses **Next.js App Router** (not Pages Router)
- Images are set to `unoptimized: true` in the config
- TypeScript strict mode is enabled
- The project includes Vercel Analytics integration
- Dark mode support is available via `next-themes`

## Need Help?

If you encounter any issues:
1. Check that all prerequisites are installed correctly
2. Ensure you're in the correct directory
3. Try deleting `node_modules` and reinstalling
4. Check the terminal for specific error messages
5. Verify your Node.js version is compatible (18.x or higher)

---

**Happy Coding! 🚀**
