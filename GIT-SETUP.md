# 📦 Git Installation & GitHub Setup Guide

## Quick Overview
This guide will help you install Git and create a GitHub account in under 5 minutes.

---

## Part 1: Install Git (2 minutes)

### Download Git:
1. Open your browser
2. Go to: **https://git-scm.com/download/win**
3. Click **"Click here to download"** (the 64-bit version)
4. Wait for the download to complete

### Install Git:
1. **Run the installer** (Git-2.xx.x-64-bit.exe)
2. **Accept the license** → Click "Next"
3. **Choose installation location** → Leave default → Click "Next"
4. **Select components** → Keep all defaults → Click "Next"
5. **Start Menu folder** → Click "Next"
6. **Choose default editor** → Select "Use Visual Studio Code" (if you have it) or "Use Nano" → Click "Next"
7. **Adjust PATH** → Select **"Git from the command line and also from 3rd-party software"** → Click "Next"
8. **HTTPS backend** → Select **"Use the OpenSSL library"** → Click "Next"
9. **Line ending conversions** → Select **"Checkout Windows-style, commit Unix-style"** → Click "Next"
10. **Terminal emulator** → Select **"Use Windows' default console window"** → Click "Next"
11. **Default behavior for `git pull`** → Select **"Default (fast-forward or merge)"** → Click "Next"
12. **Credential helper** → Select **"Git Credential Manager"** → Click "Next"
13. **Extra options** → Keep defaults → Click "Next"
14. **Experimental options** → Uncheck everything → Click "Install"
15. **Wait for installation** (takes 1-2 minutes)
16. **Click "Finish"**

### Verify Installation:
1. **Close this terminal** (PowerShell)
2. **Open a NEW PowerShell window**
3. Type: `git --version`
4. You should see: `git version 2.xx.x`

✅ **Git is installed!**

---

## Part 2: Create GitHub Account (2 minutes)

### Sign Up:
1. Open your browser
2. Go to: **https://github.com/signup**
3. **Enter your email address**
4. **Create a password** (use a strong password)
5. **Choose a username** (this will be your GitHub profile name)
6. **Verify you're human** (complete the puzzle/captcha)
7. **Enter the verification code** sent to your email
8. **Complete the signup**

### Optional: Personalize Your Profile
- Add a profile picture
- Add your name
- You can skip this for now

✅ **GitHub account created!**

---

## Part 3: Configure Git (30 seconds)

After Git is installed, run these commands in PowerShell:

```powershell
# Set your Git username (use your GitHub username)
git config --global user.name "Your Name"

# Set your Git email (use the same email as your GitHub account)
git config --global user.email "your-email@example.com"
```

**Example:**
```powershell
git config --global user.name "John Doe"
git config --global user.email "john.doe@email.com"
```

---

## What's Next?

Once Git is installed and GitHub account is created, come back here and tell me:

**"Git installed, GitHub ready"**

Then I'll:
1. ✅ Initialize your Git repository
2. ✅ Push your banking app code to GitHub
3. ✅ Connect GitHub to Vercel
4. ✅ Deploy your app to production!

---

## Troubleshooting

### Git command not found?
- Make sure you **closed and reopened** PowerShell after installation
- Try running PowerShell as Administrator

### Can't download Git?
- Try this direct link: https://github.com/git-for-windows/git/releases/latest
- Download the `.exe` file (not .7z or .zip)

### GitHub signup issues?
- Make sure your email is valid (you'll need to verify it)
- Username must be unique (try adding numbers if yours is taken)

---

**Ready? Start with Part 1 and let me know when you're done!** 🚀
