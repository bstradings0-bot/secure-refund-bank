# SecureRefund Bank - Automated Vercel Deployment Script
# This script guides you through the deployment process

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🚀 SecureRefund Bank - Vercel Deployment" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Git
Write-Host "📦 Step 1: Checking Git installation..." -ForegroundColor Yellow
try {
    $gitVersion = git --version 2>&1
    Write-Host "✅ Git found: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host "After installation, restart this script." -ForegroundColor Yellow
    pause
    exit
}

# Step 2: Check if Git repo exists
Write-Host ""
Write-Host "📦 Step 2: Checking Git repository..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "✅ Git repository found" -ForegroundColor Green
} else {
    Write-Host "⚠️  No Git repository found. Initializing..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit - SecureRefund Bank v1.0"
    Write-Host "✅ Git repository initialized and files committed" -ForegroundColor Green
}

# Step 3: Check for GitHub remote
Write-Host ""
Write-Host "📦 Step 3: Checking GitHub remote..." -ForegroundColor Yellow
$remotes = git remote 2>&1
if ($remotes -contains "origin") {
    $remoteUrl = git remote get-url origin
    Write-Host "✅ GitHub remote found: $remoteUrl" -ForegroundColor Green
} else {
    Write-Host "❌ No GitHub remote found." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please do the following:" -ForegroundColor Yellow
    Write-Host "1. Create a repository at https://github.com/new" -ForegroundColor Yellow
    Write-Host "2. Run: git remote add origin YOUR_REPOSITORY_URL" -ForegroundColor Yellow
    Write-Host "3. Run: git push -u origin main" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Have you set up GitHub remote? (y/n)"
    if ($continue -ne "y") {
        exit
    }
}

# Step 4: Check Vercel CLI
Write-Host ""
Write-Host "📦 Step 4: Checking Vercel CLI..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version 2>&1
    Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Vercel CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g vercel
    Write-Host "✅ Vercel CLI installed" -ForegroundColor Green
}

# Step 5: Generate Secrets
Write-Host ""
Write-Host "🔐 Step 5: Generating production secrets..." -ForegroundColor Yellow
if (Test-Path "scripts/generate-secrets.js") {
    node scripts/generate-secrets.js
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Copy these secrets - you'll need them for Vercel!" -ForegroundColor Red
    pause
} else {
    Write-Host "❌ Secret generation script not found" -ForegroundColor Red
}

# Step 6: Vercel Login
Write-Host ""
Write-Host "📦 Step 6: Logging into Vercel..." -ForegroundColor Yellow
Write-Host "This will open your browser to login to Vercel..." -ForegroundColor Yellow
vercel login
Write-Host "✅ Logged into Vercel" -ForegroundColor Green

# Step 7: Deploy
Write-Host ""
Write-Host "🚀 Step 7: Deploying to Vercel..." -ForegroundColor Yellow
Write-Host ""
Write-Host "The deployment will now start. Follow the prompts:" -ForegroundColor Cyan
Write-Host "- Set up and deploy? Yes" -ForegroundColor White
Write-Host "- Project name: secure-refund-bank (or your choice)" -ForegroundColor White
Write-Host "- Directory: ./apps/web" -ForegroundColor White
Write-Host ""
pause

vercel

# Step 8: Environment Variables
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📝 Step 8: Add Environment Variables" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "After deployment, add these variables in Vercel Dashboard:" -ForegroundColor Yellow
Write-Host "  Settings → Environment Variables" -ForegroundColor White
Write-Host ""
Write-Host "Required variables:" -ForegroundColor Green
Write-Host "  - DATABASE_URL (from Neon)" -ForegroundColor White
Write-Host "  - JWT_SECRET (generated above)" -ForegroundColor White
Write-Host "  - JWT_REFRESH_SECRET (generated above)" -ForegroundColor White
Write-Host "  - COOKIE_SECRET (generated above)" -ForegroundColor White
Write-Host "  - NEXTAUTH_SECRET (generated above)" -ForegroundColor White
Write-Host "  - NODE_ENV=production" -ForegroundColor White
Write-Host ""
Write-Host "After adding variables, redeploy:" -ForegroundColor Yellow
Write-Host "  vercel --prod" -ForegroundColor White
Write-Host ""

# Step 9: Database Migration
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 Step 9: Database Migration" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Have you created a PostgreSQL database on Neon?" -ForegroundColor Yellow
$hasDb = Read-Host "(y/n)"

if ($hasDb -eq "y") {
    $dbUrl = Read-Host "Enter your DATABASE_URL from Neon"
    
    # Create temporary .env
    $envContent = "DATABASE_URL=$dbUrl"
    Set-Content -Path ".env.production" -Value $envContent
    
    Write-Host ""
    Write-Host "Running database migration..." -ForegroundColor Yellow
    Set-Location packages/database
    pnpm prisma migrate deploy
    Set-Location ../..
    
    Write-Host ""
    Write-Host "✅ Database migration complete!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Please create a database on Neon:" -ForegroundColor Yellow
    Write-Host "  1. Go to https://neon.tech" -ForegroundColor White
    Write-Host "  2. Sign up and create a project" -ForegroundColor White
    Write-Host "  3. Copy the connection string" -ForegroundColor White
    Write-Host "  4. Run: pnpm prisma migrate deploy" -ForegroundColor White
    Write-Host ""
}

# Final Summary
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎉 Deployment Complete!" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your site is now deployed to Vercel!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Visit your Vercel dashboard to see your deployment" -ForegroundColor White
Write-Host "  2. Add environment variables if you haven't" -ForegroundColor White
Write-Host "  3. Test your deployed site" -ForegroundColor White
Write-Host "  4. Set up a custom domain (optional)" -ForegroundColor White
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Yellow
Write-Host "  vercel --prod          # Deploy to production" -ForegroundColor White
Write-Host "  vercel logs            # View deployment logs" -ForegroundColor White
Write-Host "  vercel env pull        # Pull environment variables" -ForegroundColor White
Write-Host ""
Write-Host "Documentation: VERCEL-DEPLOY.md" -ForegroundColor Cyan
Write-Host ""

pause
