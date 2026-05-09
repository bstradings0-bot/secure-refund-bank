# 🚀 Deploy SecureRefund Bank to Vercel - SIMPLE GUIDE

## What You'll Need (5 minutes to set up):

1. ✅ Vercel account (we'll create it)
2. ✅ PostgreSQL database on Neon (free, 2 minutes)
3. ✅ That's it!

---

## STEP 1: Login to Vercel

Run this command:

```powershell
vercel login
```

This will open your browser. Choose:
- **"Continue with Email"** or **"Continue with GitHub"**
- Complete the login
- Come back to terminal

---

## STEP 2: Deploy to Vercel

Run this command:

```powershell
vercel
```

**Answer the prompts:**
- `Set up and deploy "~/WEBSITES/BANKING"?` → **Yes**
- `Which scope do you want to deploy to?` → **Choose your account** (press Enter)
- `Link to existing project?` → **No** (press Enter)
- `What's your project's name?` → **secure-refund-bank** (press Enter)
- `In which directory is your code located?` → **./apps/web** (type this and press Enter)
- `Want to override the settings?` → **No** (press Enter)

**Wait for deployment to complete...**

You'll see a URL like: `https://secure-refund-bank-xxx.vercel.app`

---

## STEP 3: Create PostgreSQL Database on Neon (FREE)

1. **Go to**: https://neon.tech
2. **Click**: "Sign Up" (use email or GitHub)
3. **Click**: "Create a New Project"
4. **Enter**:
   - Project name: `SecureRefund Bank`
   - Region: Choose closest to you (e.g., `US East`)
5. **Click**: "Create Project"
6. **Copy the Connection String** - it looks like:
   ```
   postgresql://user:password@ep-xxx.region.provider.neon.tech/securebank_db?sslmode=require
   ```
   **Keep this safe!**

---

## STEP 4: Generate Production Secrets

Run this command:

```powershell
node scripts/generate-secrets.js
```

**Copy ALL the secrets it shows you** - you'll need them in Step 5.

---

## STEP 5: Add Environment Variables to Vercel

1. **Go to**: https://vercel.com/dashboard
2. **Click** on your `secure-refund-bank` project
3. **Click**: Settings → Environment Variables
4. **Add these variables** (click "Add New" for each):

| Name | Value |
|------|-------|
| `DATABASE_URL` | Paste the Neon connection string from Step 3 |
| `JWT_SECRET` | Paste from generate-secrets.js output |
| `JWT_REFRESH_SECRET` | Paste from generate-secrets.js output |
| `COOKIE_SECRET` | Paste from generate-secrets.js output |
| `NEXTAUTH_SECRET` | Paste from generate-secrets.js output |
| `NODE_ENV` | `production` |

**Important**: For each variable, select **ALL three environments** (Production, Preview, Development)

---

## STEP 6: Redeploy with Environment Variables

Run this command:

```powershell
vercel --prod
```

This will redeploy your site with all the environment variables.

---

## STEP 7: Run Database Migration

Run these commands:

```powershell
# Create .env file with your database URL
# Replace the URL below with YOUR Neon connection string
echo 'DATABASE_URL=postgresql://user:password@host/database?sslmode=require' > .env.production

# Run migration
cd packages/database
pnpm prisma migrate deploy

# Go back to root
cd ../..
```

**Replace** `postgresql://user:password@host/database?sslmode=require` with your actual Neon connection string.

---

## STEP 8: Create Admin User

Run this command to create the admin account:

```powershell
cd packages/database
pnpm tsx src/seed-production.ts
cd ../..
```

This creates:
- **Email**: `admin@securebank.com`
- **Password**: `Admin123!`

---

## STEP 9: Test Your Live Site

1. **Visit your site**: `https://secure-refund-bank-xxx.vercel.app` (replace with your actual URL)
2. **Test health check**: `https://your-domain.vercel.app/api/health`
3. **Login as admin**: `https://your-domain.vercel.app/admin/login`
   - Email: `admin@securebank.com`
   - Password: `Admin123!`

---

## 🎉 You're Live!

Your banking app is now deployed to production!

### Your URLs:
- **Homepage**: `https://your-project.vercel.app`
- **Admin Panel**: `https://your-project.vercel.app/admin`
- **API Health**: `https://your-project.vercel.app/api/health`

---

## 🔒 Security Checklist

After deployment:

1. ✅ **Change admin password** (login → admin settings)
2. ✅ **Verify database is connected** (check /api/health)
3. ✅ **Test user registration** (try creating a new account)
4. ✅ **Test login functionality** (login as regular user)
5. ✅ **HTTPS is enabled** (Vercel does this automatically)

---

## 🔄 How to Update Your Site Later

When you make changes to your code:

```powershell
# Deploy to production
vercel --prod
```

That's it! Vercel handles the rest.

---

## 💰 Cost

- **Vercel**: FREE (unlimited deployments, 100GB bandwidth/month)
- **Neon**: FREE (0.5 GB storage, perfect for starting)
- **Total**: **$0/month** to start!

---

## 🆘 Troubleshooting

### Build Failed?
```powershell
# Test build locally first
pnpm build
```

### Database Connection Error?
- Check DATABASE_URL is correct
- Make sure SSL mode is `require`
- Verify Neon database is active

### Can't Login?
- Check all environment variables are set in Vercel
- Redeploy: `vercel --prod`
- Check logs: `vercel logs`

### Site Not Loading?
- Wait 2-3 minutes for deployment to complete
- Check Vercel dashboard for deployment status
- Visit: `vercel.com/dashboard`

---

## Need Help?

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Neon Dashboard**: https://neon.tech
- **Full Documentation**: VERCEL-DEPLOY.md

---

**Ready to deploy? Start with STEP 1 and follow along!**
