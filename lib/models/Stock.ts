// lib/models/Stock.ts
// MongoDB schema for stock analysis results

import mongoose from 'mongoose';

const StockAnalysisSchema = new mongoose.Schema({
  ticker: {
    type: String,
    required: true,
    uppercase: true,
    index: true,
  },
  companyName: String,
  currentPrice: Number,
  
  // DCF Analysis Results
  dcfAnalysis: {
    intrinsicValue: Number,
    upside: Number, // percentage
    recommendation: {
      type: String,
      enum: ['STRONG_BUY', 'BUY', 'HOLD', 'WEAK_HOLD', 'SELL'],
    },
    enterpriseValue: Number,
    equityValue: Number,
    pvFcf5Year: Number,
    pvTerminalValue: Number,
  },
  
  // Assumptions Used
  assumptions: {
    revenueGrowth: Number,
    terminalGrowth: Number,
    operatingMargin: Number,
    taxRate: Number,
    capexPct: Number,
    nwcPct: Number,
    wacc: Number,
  },
  
  // Financial Data
  financials: {
    revenueLTM: Number,
    ebitLTM: Number,
    operatingMargin: Number,
    marketCap: Number,
    beta: Number,
  },
  
  // Valuation Multiples
  multiples: {
    peRatio: Number,
    forwardPE: Number,
    pbRatio: Number,
    pegRatio: Number,
  },
  
  // Metadata
  analysisDate: {
    type: Date,
    default: Date.now,
  },
  userId: String, // For future user auth
  isPublic: Boolean,
  views: {
    type: Number,
    default: 0,
  },
  saved: {
    type: Boolean,
    default: false,
  },
});

// Add TTL index for auto-deletion after 30 days if not saved
StockAnalysisSchema.index({ analysisDate: 1 }, { 
  expireAfterSeconds: 2592000,
  partialFilterExpression: { saved: false }
});

export const StockAnalysis = mongoose.models.StockAnalysis || 
  mongoose.model('StockAnalysis', StockAnalysisSchema);

// Cache for API responses
const CacheSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  data: mongoose.Schema.Types.Mixed,
  expiresAt: Date,
}, { timestamps: true });

CacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Cache = mongoose.models.Cache || 
  mongoose.model('Cache', CacheSchema);
