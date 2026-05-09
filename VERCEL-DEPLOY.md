# 🚀 Vercel Deployment Guide - SecureRefund Bank

## Quick Overview

We're deploying to **Vercel** - the best platform for Next.js applications.

---

## 📋 Prerequisites Checklist

Before deploying, make sure you have:

- [ ] **Git installed** - Download from [git-scm.com](https://git-scm.com/download/win)
- [ ] **GitHub account** - Sign up at [github.com](https://github.com)
- [ ] **Vercel account** - Sign up at [vercel.com](https://vercel.com) (can use GitHub login)
- [ ] **PostgreSQL database** - We'll use Neon (free tier)

---

## Step-by-Step Deployment

### Step 1: Install Git (if not already installed)

1. Download Git from: https://git-scm.com/download/win
2. Run the installer (use default settings)
3. Restart PowerShell after installation
4. Verify installation:
   ```powershell
   git --version
   ```

### Step 2: Initialize Git Repository

```powershell
# Navigate to your project
cd c:\Users\nashn\OneDrive\Desktop\WEBSITES\BANKING

# Initialize Git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit - SecureRefund Bank v1.0"
```

### Step 3: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `secure-refund-bank`
3. Make it **Private** (for security)
4. Click "Create repository"
5. Copy the repository URL (looks like: `https://github.com/YOUR_USERNAME/secure-refund-bank.git`)

### Step 4: Push Code to GitHub

```powershell
# Add GitHub as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/secure-refund-bank.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 5: Create PostgreSQL Database on Neon

1. Go to https://neon.tech
2. Click "Sign Up" (use GitHub login for easiest setup)
3. Click "Create a New Project"
4. Project name: `SecureRefund Bank`
5. Choose region closest to your users (e.g., `US East - Virginia`)
6. Click "Create Project"
7. Copy the **Connection String** (looks like):
   ```
   postgresql://securebank_user:password@ep-xxx.region.provider.neon.tech/securebank_db?sslmode=require
   ```

### Step 6: Generate Production Secrets

Run this command to generate secure secrets:

```powershell
cd c:\Users\nashn\OneDrive\Desktop\WEBSITES\BANKING
node scripts/generate-secrets.js
```

Copy all the generated secrets - you'll need them for Vercel.

### Step 7: Deploy to Vercel

#### Option A: Using Vercel CLI (Recommended)

```powershell
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd c:\Users\nashn\OneDrive\Desktop\WEBSITES\BANKING
vercel
```

The CLI will ask you questions:
- Set up and deploy? **Yes**
- Which scope? **Choose your account**
- Link to existing project? **No**
- Project name: **secure-refund-bank**
- Directory: **./apps/web** (just press Enter for default)
- Override settings? **No**

#### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `secure-refund-bank` repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `cd ../.. && pnpm build` (leave default)
   - **Output Directory**: `.next` (leave default)
5. Click "Deploy"

### Step 8: Add Environment Variables to Vercel

Go to your Vercel project → Settings → Environment Variables

Add these variables (use the ones you generated in Step 6):

```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=your-generated-jwt-secret
JWT_REFRESH_SECRET=your-generated-refresh-secret
COOKIE_SECRET=your-generated-cookie-secret
NEXTAUTH_SECRET=your-generated-nextauth-secret
NODE_ENV=production
CORS_ORIGIN=https://your-vercel-domain.vercel.app
```

**Important**: Add these to **Production**, **Preview**, and **Development** environments.

### Step 9: Redeploy with Environment Variables

After adding environment variables, trigger a new deployment:

```powershell
vercel --prod
```

Or in Vercel dashboard: Deployments → ... → Redeploy

### Step 10: Run Database Migration

After deployment, run the database migration:

```powershell
# Connect to your deployed API
vercel env pull .env.production

# Run migration (you'll need to set DATABASE_URL in your local .env first)
cd packages/database
pnpm prisma migrate deploy
```

Or run it through Vercel:
```powershell
vercel deploy --prod
```

### Step 11: Seed Production Database

```powershell
# Run the production seed script
cd packages/database
pnpm tsx src/seed-production.ts
```

This creates the admin user with credentials:
- Email: `admin@securebank.com`
- Password: `Admin123!` (or your custom ADMIN_PASSWORD)

### Step 12: Verify Deployment

1. Visit your deployed site: `https://your-project.vercel.app`
2. Test health check: `https://your-project.vercel.app/api/health`
3. Login as admin: `https://your-project.vercel.app/admin/login`

---

## 🔒 Security Checklist

After deployment:

- [ ] Change admin password from default
- [ ] Verify all environment variables are set
- [ ] Check database is connected (visit /api/health)
- [ ] Test user registration
- [ ] Test login functionality
- [ ] Verify SSL/HTTPS is working (Vercel handles this automatically)
- [ ] Set up custom domain (optional)

---

## 🌐 Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `securebank.com`)
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic)

---

## 📊 Monitoring Your Deployment

### Vercel Dashboard
- Visit https://vercel.com/dashboard
- View deployments, analytics, and logs

### Database Health
- Visit: `https://your-domain.vercel.app/api/health`
- Check database connection and stats

### Neon Dashboard
- Visit https://neon.tech
- Monitor database queries, connections, storage

---

## 🔄 Updating Your Site

After making changes:

```powershell
# Commit changes
git add .
git commit -m "Your update message"
git push origin main

# Vercel will automatically redeploy!
```

---

## 💰 Cost Estimates

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| **Vercel** | Unlimited deployments, 100GB bandwidth | $20/month (Pro) |
| **Neon** | 0.5 GB storage, 100M compute | $19/month (10 GB) |
| **Total** | **FREE** | ~$39/month |

---

## 🆘 Troubleshooting

### Build Fails
```powershell
# Test build locally first
pnpm build
```

### Database Connection Error
- Verify DATABASE_URL is correct
- Check SSL mode is set to `require`
- Ensure IP is allowed in Neon settings

### Environment Variables Not Working
- Redeploy after adding variables
- Check variables are set for correct environment (Production)

### API Routes Not Working
- Check CORS_ORIGIN matches your Vercel domain
- Verify all environment variables are set

---

## Need Help?

1. Check Vercel logs: Dashboard → Your Project → Logs
2. Check Neon dashboard for database errors
3. Visit /api/health endpoint for system status

---

## Quick Commands Reference

```powershell
# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# Pull environment variables
vercel env pull

# Run database migration
cd packages/database
pnpm prisma migrate deploy

# Seed database
pnpm tsx src/seed-production.ts

# Test database connection
pnpm tsx src/test-connection.ts
```

---

**Ready to deploy? Start with Step 1 and follow along!**
