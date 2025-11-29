---
description: Deploy the application to Vercel
---

# Deploy to Vercel

This workflow guides you through deploying the edu-admin-panel application to Vercel.

## Prerequisites

Before deploying, ensure you have:
1. A Vercel account (sign up at https://vercel.com)
2. Your Supabase credentials ready (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY)
3. Your database connection string (DATABASE_URL)
4. All code committed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### Option A: Deploy via Vercel Dashboard (Recommended for First Time)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Go to Vercel Dashboard**
   - Visit https://vercel.com/new
   - Sign in with your GitHub account
   - Click "Import Project"

3. **Import your repository**
   - Select your `edu-admin-panel` repository
   - Click "Import"

4. **Configure Project**
   - Framework Preset: Next.js (should be auto-detected)
   - Root Directory: `./` (leave as default)
   - Build Command: `next build` (default)
   - Output Directory: `.next` (default)

5. **Set Environment Variables**
   
   Click "Environment Variables" and add the following:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   DATABASE_URL=<your-database-url>
   ```
   
   > Make sure to set these for all environments (Production, Preview, Development)

6. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://<project-name>.vercel.app`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI globally**
   ```bash
   npm install -g vercel
   ```

2. **Navigate to project directory**
   ```bash
   cd "c:\Users\skies\My project\edu-admin-panel"
   ```

// turbo
3. **Login to Vercel**
   ```bash
   vercel login
   ```

4. **Deploy to Vercel**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N** (for first deployment) or **Y** (if already exists)
   - What's your project's name? **edu-admin-panel** (or your preferred name)
   - In which directory is your code located? **./**
   - Want to override the settings? **N**

5. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add DATABASE_URL
   ```
   
   For each command, paste the value when prompted and select the environments (production, preview, development)

6. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Post-Deployment Steps

1. **Run Database Migrations**
   
   Since Vercel doesn't run database migrations automatically, you need to:
   - Ensure your DATABASE_URL points to your production database (e.g., Supabase Postgres)
   - Run migrations locally or set up a GitHub Action:
   ```bash
   npx prisma migrate deploy
   ```

2. **Verify Deployment**
   - Visit your deployed URL
   - Test the authentication flow (login/signup)
   - Verify database connections are working
   - Check that environment variables are properly set

3. **Configure Custom Domain (Optional)**
   - Go to your project settings in Vercel Dashboard
   - Navigate to "Domains"
   - Add your custom domain

## Continuous Deployment

Once set up via GitHub import, Vercel will automatically:
- Deploy every push to your main branch to production
- Create preview deployments for pull requests
- Show build logs and deployment status

## Troubleshooting

### Build Errors

If you encounter build errors:
1. Check the build logs in Vercel Dashboard
2. Ensure all environment variables are set correctly
3. Verify that `prisma generate` runs during build (via `postinstall` script)
4. Check that all dependencies are in `package.json` (not just devDependencies)

### Runtime Errors

If the app deploys but has runtime errors:
1. Check the Function Logs in Vercel Dashboard
2. Verify DATABASE_URL is accessible from Vercel
3. Ensure Supabase environment variables are correct
4. Check that your Supabase project allows connections from Vercel's IP ranges

### Environment Variables Not Working

1. Go to Project Settings → Environment Variables
2. Ensure variables are set for the correct environments
3. Redeploy the project after adding/updating variables
