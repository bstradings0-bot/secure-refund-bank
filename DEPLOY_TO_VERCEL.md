# 🚀 Deploy SecureRefund Bank to Vercel

## Prerequisites

Before you begin, make sure you have:
- ✅ A GitHub account
- ✅ A Vercel account (free at [vercel.com](https://vercel.com))
- ✅ A PostgreSQL database (we'll use Neon - free tier available)
- ✅ Your code ready to push

---

## 📋 Step-by-Step Deployment Guide

### Step 1: Set Up PostgreSQL Database (Neon)

1. **Create Neon Account**
   - Go to [neon.tech](https://neon.tech)
   - Sign up with GitHub or email
   - Click "New Project"

2. **Create Database**
   - Project name: `securebank-production`
   - Region: Choose closest to your users (e.g., `US East - Virginia`)
   - PostgreSQL version: `16` (default)
   - Click "Create Project"

3. **Get Connection String**
   - In your Neon dashboard, click "Connection Details"
   - Copy the connection string (looks like):
     ```
     postgresql://securebank_user:password@ep-xxx.region.provider.neon.tech/securebank_db?sslmode=require
     ```
   - **Save this - you'll need it!**

---

### Step 2: Prepare Your Code

1. **Open PowerShell** in your project folder:
   ```powershell
   cd C:\Users\nashn\OneDrive\Desktop\WEBSITES\BANKING
   ```

2. **Generate Production Secrets**:
   ```powershell
   node scripts/generate-secrets.js
   ```
   
   **Save the output!** You'll need these 4 secrets:
   - JWT_SECRET
   - JWT_REFRESH_SECRET
   - COOKIE_SECRET
   - NEXTAUTH_SECRET

3. **Create .gitignore** (if not exists):
   ```
   # Dependencies
   node_modules/
   .pnpm-store/
   
   # Environment files
   .env
   .env.local
   .env.production
   
   # Build outputs
   .next/
   dist/
   build/
   
   # Database
   packages/database/prisma/migrations/
   
   # IDE
   .vscode/
   .idea/
   
   # OS
   .DS_Store
   Thumbs.db
   
   # Logs
   *.log
   npm-debug.log*
   pnpm-debug.log*
   
   # Testing
   coverage/
   ```

---

### Step 3: Push Code to GitHub

1. **Initialize Git** (if not already):
   ```powershell
   git init
   git add .
   git commit -m "Initial commit - SecureRefund Bank production ready"
   ```

2. **Create GitHub Repository**:
   - Go to [github.com/new](https://github.com/new)
   - Repository name: `securebank` (or your choice)
   - Public or Private (private recommended)
   - Click "Create repository"

3. **Push to GitHub**:
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/securebank.git
   git branch -M main
   git push -u origin main
   ```

   Replace `YOUR_USERNAME` with your GitHub username!

---

### Step 4: Deploy to Vercel

1. **Go to Vercel**:
   - Visit [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your `securebank` repository

2. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `pnpm build`
   - **Output Directory**: `apps/web/.next`
   - **Install Command**: `pnpm install`

3. **Add Environment Variables** (click "Environment Variables"):
   
   **Required Variables:**
   ```
   DATABASE_URL = (Your Neon connection string from Step 1)
   JWT_SECRET = (From Step 2 secrets)
   JWT_REFRESH_SECRET = (From Step 2 secrets)
   COOKIE_SECRET = (From Step 2 secrets)
   NEXTAUTH_SECRET = (From Step 2 secrets)
   NEXT_PUBLIC_API_URL = https://your-api-domain.com (we'll set this later)
   ADMIN_PASSWORD = Choose a strong password for admin
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for build (3-5 minutes)
   - 🎉 Your site is live!

---

### Step 5: Set Up API Server

Since Vercel is serverless, we need to deploy the API separately. **Option A** is recommended:

#### Option A: Deploy API to Railway (Recommended)

1. **Create Railway Account**:
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `securebank` repository

3. **Add PostgreSQL Database**:
   - Click "+ New" → "Database" → "PostgreSQL"
   - Railway creates database automatically
   - Copy the `DATABASE_URL` from Railway

4. **Configure Environment Variables**:
   - Go to your service → Variables
   - Add these variables:
     ```
     DATABASE_URL = (Railway PostgreSQL URL)
     JWT_SECRET = (Same as Vercel)
     JWT_REFRESH_SECRET = (Same as Vercel)
     COOKIE_SECRET = (Same as Vercel)
     NEXTAUTH_SECRET = (Same as Vercel)
     ADMIN_PASSWORD = (Same as Vercel)
     NODE_ENV = production
     PORT = 4000
     CORS_ORIGIN = https://your-vercel-domain.vercel.app
     ```

5. **Deploy**:
   - Railway auto-deploys from GitHub
   - Wait for deployment
   - Copy your Railway domain (e.g., `https://securebank-production.up.railway.app`)

6. **Update Vercel**:
   - Go back to Vercel → Your Project → Settings → Environment Variables
   - Update `NEXT_PUBLIC_API_URL` to your Railway domain
   - Redeploy Vercel project

#### Option B: Use Vercel Serverless Functions (Alternative)

You can refactor the API to use Vercel serverless functions, but this requires code changes. Railway is easier for now.

---

### Step 6: Initialize Database

After deployment, initialize your database:

1. **SSH into Railway** (or use Railway's console):
   - Go to Railway → Your Project → PostgreSQL
   - Click "Connect" → "psql"
   - Or use the Railway CLI

2. **Run Migrations**:
   ```bash
   cd packages/database
   pnpm prisma migrate deploy
   ```

3. **Seed Database**:
   ```bash
   pnpm tsx src/seed-production.ts
   ```

4. **Test Connection**:
   ```bash
   pnpm tsx src/test-connection.ts
   ```

---

### Step 7: Verify Deployment

1. **Test Health Endpoints**:
   ```
   https://your-railway-domain.up.railway.app/api/health
   ```
   
   Should return:
   ```json
   {
     "status": "healthy",
     "database": {
       "status": "connected"
     }
   }
   ```

2. **Test Frontend**:
   - Visit your Vercel URL (e.g., `https://securebank.vercel.app`)
   - Should see the homepage

3. **Test Admin Login**:
   - Go to: `https://your-vercel-domain.vercel.app/admin/login`
   - Email: `admin@securebank.com`
   - Password: (The ADMIN_PASSWORD you set)

4. **Test User Registration**:
   - Go to: `https://your-vercel-domain.vercel.app/register`
   - Create a test account

---

### Step 8: Set Up Custom Domain (Optional)

1. **Buy a Domain** (if you don't have one):
   - Namecheap, GoDaddy, Cloudflare, etc.

2. **Add to Vercel**:
   - Vercel Dashboard → Your Project → Settings → Domains
   - Add your domain (e.g., `securebank.com`)
   - Follow DNS configuration instructions

3. **Add to Railway**:
   - Railway Dashboard → Your Project → Settings → Domains
   - Add your API domain (e.g., `api.securebank.com`)

4. **Update Environment Variables**:
   - Update `NEXT_PUBLIC_API_URL` in Vercel to `https://api.yourdomain.com`
   - Update `CORS_ORIGIN` in Railway to `https://yourdomain.com`

---

## 🔒 Security Checklist

After deployment, complete these security tasks:

- [ ] Change default admin password
- [ ] Enable 2FA for admin account
- [ ] Review CORS settings (only allow your domain)
- [ ] Set up database backups (Railway auto-backups)
- [ ] Enable HTTPS (Vercel/Railway do this automatically)
- [ ] Set up monitoring alerts
- [ ] Rotate secrets every 90 days
- [ ] Review and limit API rate limiting
- [ ] Set up error tracking (Sentry, LogRocket)

---

## 📊 Monitoring

### Vercel Dashboard:
- View deployment logs
- Check function execution times
- Monitor bandwidth usage

### Railway Dashboard:
- View API logs
- Monitor database connections
- Check resource usage

### Database (Neon):
- Monitor query performance
- Check connection count
- View storage usage

---

## 🆘 Troubleshooting

### Build Fails on Vercel:
```bash
# Check build logs in Vercel dashboard
# Common issues:
# - Missing environment variables
# - TypeScript errors (fix locally and push)
# - Memory limits (upgrade Vercel plan)
```

### Database Connection Errors:
```bash
# Verify DATABASE_URL is correct
# Check if SSL is enabled (should be: ?sslmode=require)
# Verify firewall allows connections
```

### API Not Responding:
```bash
# Check Railway deployment logs
# Verify all environment variables are set
# Test health endpoint: /api/health
```

### CORS Errors:
```bash
# Update CORS_ORIGIN in Railway to your Vercel domain
# Format: https://your-domain.vercel.app
```

---

## 📈 Next Steps After Deployment

1. **Set Up Email Service** (for OTP verification):
   - Use Resend, SendGrid, or AWS SES
   - Add SMTP credentials to environment variables

2. **Add Payment Processing**:
   - Stripe for payments
   - Plaid for bank account linking
   - Wise for international transfers

3. **Enable Monitoring**:
   - Sentry for error tracking
   - LogRocket for session replay
   - Uptime monitoring (UptimeRobot, Pingdom)

4. **Set Up CI/CD**:
   - GitHub Actions for automated testing
   - Automatic deployments on push to main

5. **Performance Optimization**:
   - Enable CDN caching
   - Optimize database queries
   - Add Redis for caching (optional)

---

## ✅ Deployment Checklist

**Pre-Deployment:**
- [ ] PostgreSQL database created (Neon)
- [ ] Secrets generated
- [ ] Code pushed to GitHub
- [ ] .gitignore configured

**Vercel (Frontend):**
- [ ] Project imported from GitHub
- [ ] Environment variables set
- [ ] Build successful
- [ ] Site accessible

**Railway (API):**
- [ ] Project created
- [ ] PostgreSQL added
- [ ] Environment variables set
- [ ] API deployed
- [ ] Health endpoint responds

**Database:**
- [ ] Migrations run
- [ ] Database seeded
- [ ] Admin user created
- [ ] Connection tested

**Verification:**
- [ ] Homepage loads
- [ ] Login works
- [ ] Registration works
- [ ] Admin panel accessible
- [ ] API health check passes

---

## 🎉 You're Live!

Your SecureRefund Bank is now deployed and accessible worldwide!

**Frontend**: `https://your-app.vercel.app`
**API**: `https://your-api.up.railway.app`

**Admin Login**: `https://your-app.vercel.app/admin/login`

---

## 💡 Tips

- **Free Tier Limits**: 
  - Vercel: 100GB bandwidth/month
  - Railway: $5 credit/month (enough for small apps)
  - Neon: 0.5GB storage, 100M compute seconds

- **Scaling**: Upgrade plans as your user base grows

- **Backups**: Railway auto-backups daily; Neon has point-in-time recovery

- **Support**: 
  - Vercel: [vercel.com/docs](https://vercel.com/docs)
  - Railway: [docs.railway.app](https://docs.railway.app)
  - Neon: [neon.tech/docs](https://neon.tech/docs)

---

**Questions or issues?** Check the troubleshooting section or refer to the platform documentation above.

Good luck with your fintech platform! 🚀
