# 🚀 Vercel Deployment Guide - Stock Analyzer v1

**Last Updated:** November 2025  
**Status:** Production Ready

## Quick Start (5 minutes)

### Prerequisites
- Vercel account (free at https://vercel.com)
- MongoDB Atlas account (free tier available at https://www.mongodb.com/cloud/atlas)
- GitHub, GitLab, or Bitbucket account

### Step 1: Set Up MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account or sign in
3. Click "Create" → "Build a Database" → Choose **Free M0**
4. Select your region (US East recommended for low latency)
5. Create a cluster (takes ~3-5 minutes)
6. Once created, click "Connect"
7. Choose "Drivers" and copy your connection string
8. Replace `<username>:<password>` with your credentials
9. **Copy this string** - you'll need it for Vercel

### Step 2: Deploy to Vercel

#### Option A: Using GitHub (Recommended)

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit: Stock Analyzer"
git remote add origin https://github.com/your-username/stock-analyzer.git
git branch -M main
git push -u origin main
```

2. Go to https://vercel.com/new
3. Select "Import Git Repository"
4. Paste your GitHub repo URL
5. Click "Import"

#### Option B: Using Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

### Step 3: Configure Environment Variables

1. In Vercel dashboard, go to your project → Settings → Environment Variables
2. Add these variables:

| Variable | Value | Example |
|----------|-------|---------|
| `MONGODB_URI` | Your MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/stock-analyzer?retryWrites=true` |
| `NEXT_PUBLIC_API_URL` | Your Vercel deployment URL | `https://stock-analyzer-123.vercel.app` |
| `NODE_ENV` | `production` | `production` |

3. Click "Save"
4. Trigger a redeploy in the Deployments tab

### Step 4: Test Your Deployment

1. Visit your Vercel deployment URL
2. Try analyzing a stock: `AAPL`, `MSFT`, `GOOGL`
3. Check MongoDB Atlas to verify data is being saved

---

## Production Checklist

- [ ] MongoDB URI configured in Vercel
- [ ] NEXT_PUBLIC_API_URL set correctly
- [ ] Stock analysis test completed successfully
- [ ] No console errors in browser DevTools
- [ ] API responses under 1 second (check Vercel Analytics)
- [ ] Custom domain configured (if using one)

## Environment Variables Reference

### Required
- **MONGODB_URI** - MongoDB connection string with credentials
- **NODE_ENV** - Set to `production`

### Optional
- **NEXT_PUBLIC_API_URL** - For client-side API calls (defaults to same domain)

## Monitoring & Debugging

### View Logs
```
vercel logs <project-name>
```

### Check Deployment Status
Visit your Vercel project dashboard → Deployments tab

### Common Issues

**Issue: "MONGODB_URI is not defined"**
- Solution: Add MONGODB_URI to Environment Variables in Vercel dashboard

**Issue: "Cannot fetch stock data"**
- Solution: Yahoo Finance API might be rate-limited; wait 60 seconds and try again

**Issue: Database connection timeout**
- Solution: Check MongoDB Atlas is running and connection string is correct

## Performance Optimization (Already Applied)

✅ **Lean Dependencies** - Removed unused packages (date-fns, lodash)  
✅ **Production Builds** - SWC minification enabled  
✅ **Source Maps Disabled** - Reduces build size  
✅ **API Caching** - 60 second cache on stock data  
✅ **Memory Optimized** - Reduced function memory from 3008MB to 1024MB  
✅ **On-Demand Entries** - Faster dev deployments  

## Scaling Tips

- **Current limits**: 30 second function timeout, 1GB memory per API call
- **For high traffic**: Consider upgrading to Vercel Pro or Enterprise
- **Add Redis**: For distributed caching across functions
- **Database optimization**: Add MongoDB indexes on ticker field

## Cost Breakdown

- **Vercel (Hobby)**: Free for starter projects
- **MongoDB Atlas (M0)**: Free tier - 512MB storage
- **Monthly cost**: $0 (both free tiers)

## Rollback Procedure

If deployment breaks:
1. Go to Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click "⋯" → "Promote to Production"

## Support & Resources

- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.mongodb.com/atlas
- Next.js Docs: https://nextjs.org/docs
- Stock Analyzer Issues: Check GitHub Issues

## Next Steps

1. ✅ Deployment complete
2. 🔄 Set up GitHub Actions for auto-deployment
3. 📊 Add Vercel Analytics
4. 🔐 Enable Vercel Protection (Pro feature)
5. 📈 Consider caching layer (Redis)

---

**Questions?** Check the README.md or reach out!
