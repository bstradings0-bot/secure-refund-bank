# 🚀 SecureRefund Bank - Production Deployment Guide

## Quick Start

This guide will help you deploy SecureRefund Bank to production with a PostgreSQL database.

---

## 📋 Prerequisites

- Node.js 18+ installed
- pnpm package manager
- Git repository (GitHub/GitLab)
- PostgreSQL database (Neon, Railway, Supabase, or AWS RDS)

---

## Step 1: Choose Your Database Provider

### Recommended: Neon (Free Tier Available)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project named "SecureRefund Bank"
3. Choose region closest to your users
4. Copy the connection string (looks like: `postgresql://user:password@host/dbname?sslmode=require`)

### Alternative Providers:
- **Railway**: [railway.app](https://railway.app) - Full-stack hosting + database
- **Supabase**: [supabase.com](https://supabase.com) - PostgreSQL + auth + storage
- **AWS RDS**: Enterprise-grade, paid

---

## Step 2: Generate Secure Secrets

```bash
# Generate production secrets
node scripts/generate-secrets.js
```

This will output:
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `COOKIE_SECRET`
- `NEXTAUTH_SECRET`

**⚠️ Save these securely - you'll need them in Step 3!**

---

## Step 3: Configure Environment Variables

1. Copy the production template:
   ```bash
   cp apps/api/.env.production.example apps/api/.env.production
   ```

2. Edit `apps/api/.env.production` and fill in:

   **Required:**
   ```env
   DATABASE_URL="postgresql://YOUR_DB_CONNECTION_STRING"
   JWT_SECRET="your-generated-secret"
   JWT_REFRESH_SECRET="your-generated-secret"
   COOKIE_SECRET="your-generated-secret"
   ADMIN_PASSWORD="CHANGE_THIS_TO_STRONG_PASSWORD"
   ```

   **Optional (for email verification):**
   ```env
   SMTP_HOST="smtp.gmail.com"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   ```

---

## Step 4: Setup Database

### For Local Testing:
```bash
# Install dependencies
pnpm install

# Generate Prisma client
cd packages/database
pnpm prisma generate

# Run migrations (creates tables)
pnpm prisma migrate deploy

# Test connection
pnpm tsx src/test-connection.ts

# Seed database (creates admin user)
pnpm tsx src/seed-production.ts
```

### For Production (on hosting platform):
Most platforms (Vercel, Railway, Render) run migrations automatically during deployment.

---

## Step 5: Deploy to Hosting Platform

### Option A: Vercel (Recommended for Next.js)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js

3. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.production`
   - Include `DATABASE_URL` from your PostgreSQL provider

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically
   - You'll get a production URL like: `https://your-app.vercel.app`

### Option B: Railway (Full-Stack)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Connect GitHub

2. **Create PostgreSQL Service**
   - Click "New Project"
   - Add "PostgreSQL" database
   - Copy connection string

3. **Deploy App**
   - Add "GitHub Repo" service
   - Select your repository
   - Railway auto-detects Next.js

4. **Configure Variables**
   - Add all environment variables
   - Use Railway's PostgreSQL URL for `DATABASE_URL`

5. **Deploy**
   - Railway builds and deploys
   - Get your production URL

---

## Step 6: Verify Deployment

### Test Health Endpoints:
```bash
# Check if app is running
curl https://your-domain.com/api/health

# Check database connection
curl https://your-domain.com/api/health/ready

# Simple liveness check
curl https://your-domain.com/api/health/live
```

### Test Login:
1. Visit `https://your-domain.com/admin/login`
2. Login with admin credentials from `.env.production`
3. Verify you can access the admin dashboard

### Test User Registration:
1. Visit `https://your-domain.com/register`
2. Create a test user account
3. Verify email verification works (if enabled)

---

## Step 7: Post-Deployment Tasks

### Database Monitoring:
- **Neon**: Check dashboard for query performance and connection count
- **Railway**: Monitor database metrics in project dashboard
- **Supabase**: View API and database analytics

### Security Checklist:
- [ ] Change default admin password
- [ ] Enable 2FA for admin account
- [ ] Review CORS settings (only allow your domain)
- [ ] Set up SSL/TLS (most platforms do this automatically)
- [ ] Configure firewall rules (if using AWS/VPS)
- [ ] Enable database backups
- [ ] Set up monitoring alerts

### Performance Optimization:
- [ ] Enable CDN for static assets
- [ ] Configure database connection pooling
- [ ] Set up caching for frequently accessed data
- [ ] Monitor slow queries and add indexes if needed

---

## 🔧 Troubleshooting

### Database Connection Fails:
```bash
# Test connection locally
cd packages/database
pnpm tsx src/test-connection.ts
```

**Common Issues:**
- `P1001`: Can't reach database server → Check DATABASE_URL and firewall
- `P1003`: Database doesn't exist → Create database or fix URL
- SSL errors → Add `?sslmode=require` to DATABASE_URL

### App Crashes on Deployment:
- Check deployment logs in Vercel/Railway dashboard
- Verify all environment variables are set
- Ensure `DATABASE_URL` is correct
- Check if migrations ran successfully

### Health Check Fails:
```bash
# Check health endpoint
curl https://your-domain.com/api/health
```

**Response should be:**
```json
{
  "status": "healthy",
  "database": {
    "status": "connected"
  }
}
```

---

## 📊 Monitoring & Maintenance

### Daily:
- Check error logs
- Monitor database connections
- Review failed login attempts

### Weekly:
- Check database size and growth
- Review slow queries
- Update dependencies if needed

### Monthly:
- Rotate secrets (JWT, cookies)
- Review and update security settings
- Backup database (if not automated)

---

## 🆘 Support

### Documentation:
- [Neon Docs](https://neon.tech/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Prisma Docs](https://www.prisma.io/docs)

### Common Commands:
```bash
# Generate secrets
node scripts/generate-secrets.js

# Test database
pnpm tsx packages/database/src/test-connection.ts

# Seed database
pnpm tsx packages/database/src/seed-production.ts

# Run migrations
pnpm prisma migrate deploy

# Generate Prisma client
pnpm prisma generate
```

---

## ✅ Deployment Checklist

**Pre-Deployment:**
- [ ] PostgreSQL database created
- [ ] DATABASE_URL configured
- [ ] Secrets generated and configured
- [ ] Admin password changed from default
- [ ] CORS origin set to production domain
- [ ] Email service configured (optional)
- [ ] All environment variables set

**Deployment:**
- [ ] Code pushed to GitHub
- [ ] Project imported to hosting platform
- [ ] Environment variables added to platform
- [ ] Build succeeds
- [ ] Database migrations run
- [ ] Database seeded

**Post-Deployment:**
- [ ] Health check passes
- [ ] Admin login works
- [ ] User registration works
- [ ] Email verification works (if enabled)
- [ ] Database backups configured
- [ ] Monitoring set up
- [ ] SSL certificate active

---

## 🎉 You're Live!

Your SecureRefund Bank is now running in production with:
- ✅ PostgreSQL database with indexes
- ✅ Secure authentication (JWT)
- ✅ Health monitoring endpoints
- ✅ Production-ready configuration
- ✅ Admin dashboard
- ✅ User registration and login

**Next Steps:**
- Connect real payment processors (Stripe, Plaid, Wise)
- Set up custom domain
- Configure email service for OTP
- Enable KYC verification
- Set up monitoring and alerts

Good luck with your fintech platform! 🚀
