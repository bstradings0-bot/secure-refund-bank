#!/bin/bash
# Push Code to GitHub Script
# This will upload your banking app to GitHub

REPO_URL="https://github.com/bstradings0-bot/secure-refund-bank.git"

echo "=================================="
echo "Pushing SecureRefund Bank to GitHub"
echo "=================================="
echo ""

# Navigate to your project
cd /c/Users/nashn/OneDrive/Desktop/WEBSITES/BANKING

echo "Step 1: Initializing Git repository..."
git init

echo ""
echo "Step 2: Adding all files..."
git add .

echo ""
echo "Step 3: Creating first commit..."
git commit -m "Initial commit - SecureRefund Bank v1.0"

echo ""
echo "Step 4: Renaming branch to main..."
git branch -M main

echo ""
echo "Step 5: Connecting to GitHub..."
git remote add origin $REPO_URL

echo ""
echo "Step 6: Pushing to GitHub..."
echo "This may take a few minutes..."
git push -u origin main

echo ""
echo "=================================="
if [ $? -eq 0 ]; then
    echo "SUCCESS! Your code is now on GitHub!"
    echo "Repository: https://github.com/bstradings0-bot/secure-refund-bank"
else
    echo "ERROR: Push failed. Check the error message above."
    echo "You may need to authenticate with GitHub."
fi
echo "=================================="
