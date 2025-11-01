#!/bin/bash

# Stock Analyzer - Quick Deployment Script
# Makes deploying to Vercel super easy!

set -e

echo "🚀 Stock Analyzer - Vercel Deployment Helper"
echo "=============================================="
echo ""

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 20+: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js detected: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js."
    exit 1
fi

echo "✅ npm detected: $(npm --version)"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "⚠️  Git not found. You'll need Git to deploy to Vercel."
    echo "   Install from: https://git-scm.com"
    echo ""
fi

# Option 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install
echo "✅ Dependencies installed!"
echo ""

# Option 2: Test locally
echo "💻 Step 2: Test locally?"
read -p "Do you want to test the app locally first? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📝 First, create .env.local with your MongoDB URI:"
    echo ""
    if [ ! -f .env.local ]; then
        cp .env.example .env.local
        echo "   cp .env.example .env.local"
        echo "   # Then edit .env.local and add your MONGODB_URI"
        echo ""
        echo "   1. Get MongoDB URI from: https://www.mongodb.com/cloud/atlas"
        echo "   2. Edit .env.local with your connection string"
        echo "   3. Then run: npm run dev"
        echo ""
        echo "✅ .env.local created! Now edit it with your MongoDB URI."
    else
        echo "ℹ️  .env.local already exists"
    fi
    echo ""
    read -p "Ready to run 'npm run dev'? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run dev
        exit 0
    fi
fi

echo ""
echo "🌐 Step 3: Deploy to Vercel"
echo "============================"
echo ""
echo "You have two options:"
echo ""
echo "Option A: Deploy with Vercel CLI (recommended)"
echo "  1. npm install -g vercel"
echo "  2. vercel login"
echo "  3. vercel"
echo ""
echo "Option B: Deploy with GitHub (easiest)"
echo "  1. Push your code to GitHub"
echo "  2. Go to https://vercel.com/new"
echo "  3. Import your GitHub repository"
echo "  4. Add MONGODB_URI environment variable"
echo "  5. Click Deploy"
echo ""

read -p "Install Vercel CLI now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm install -g vercel
    echo "✅ Vercel CLI installed!"
    echo ""
    read -p "Login to Vercel now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        vercel login
        echo ""
        read -p "Deploy to Vercel now? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            vercel
            echo ""
            echo "✅ Deployment started!"
            echo "   1. Follow the CLI prompts"
            echo "   2. Add MONGODB_URI when prompted"
            echo "   3. Wait for deployment to complete"
        fi
    fi
else
    echo "ℹ️  Manual deployment instructions:"
    echo ""
    echo "With Vercel CLI:"
    echo "  npm install -g vercel"
    echo "  vercel login"
    echo "  vercel"
    echo ""
    echo "With GitHub + Vercel Web:"
    echo "  1. git push to GitHub"
    echo "  2. https://vercel.com/new"
    echo "  3. Import your repo"
fi

echo ""
echo "📚 Need help?"
echo "  - Read DEPLOYMENT_GUIDE.md for detailed instructions"
echo "  - Read README.md for app overview"
echo "  - Read OPTIMIZATION_REPORT.md for what changed"
echo ""
echo "🎉 All set! Happy deploying!"
