#!/bin/bash
# Git Configuration Script
# Run this file in Git Bash

echo "Configuring Git..."

git config --global user.name "jonsandile"
git config --global user.email "maggilake8@gmail.com"

echo ""
echo "Git configured successfully!"
echo ""
echo "Verifying configuration:"
git config --global user.name
git config --global user.email
