// lib/services/financialDataFetcher.ts
// Fetch real financial data from Yahoo Finance API

import axios from 'axios';
import { Cache } from '@/lib/models/Stock';
import connectDB from '@/lib/db';

const CACHE_TTL = 86400; // 24 hours

interface YahooFinanceData {
  currentPrice: number;
  marketCap: number;
  sharesOutstanding: number;
  beta: number;
  totalDebt: number;
  totalCash: number;
  revenue: number;
  operatingIncome: number;
  netIncome: number;
  companyName: string;
}

export class FinancialDataFetcher {
  static async fetchYahooFinance(ticker: string): Promise<YahooFinanceData> {
    try {
      // Check cache first
      const cachedData = await this.getFromCache(`yahoo_${ticker}`);
      if (cachedData) {
        console.log(`Using cached data for ${ticker}`);
        return cachedData;
      }

      // Fetch from Yahoo Finance API
      const response = await axios.get(
        `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}`,
        {
          params: {
            modules:
              'price,summaryDetail,financialData,defaultKeyStatistics,incomeStatementHistory',
          },
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          timeout: 10000,
        }
      );

      if (!response.data.quoteSummary?.result?.length) {
        throw new Error(`No data found for ticker ${ticker}`);
      }

      const result = response.data.quoteSummary.result[0];

      const data: YahooFinanceData = {
        currentPrice: result.price?.regularMarketPrice?.raw || 0,
        marketCap: result.summaryDetail?.marketCap?.raw || 0,
        sharesOutstanding:
          (result.summaryDetail?.marketCap?.raw || 0) /
          (result.price?.regularMarketPrice?.raw || 1),
        beta: result.defaultKeyStatistics?.beta?.raw || 1.0,
        totalDebt: result.financialData?.totalDebt?.raw || 0,
        totalCash: result.financialData?.totalCash?.raw || 0,
        revenue:
          result.incomeStatementHistory?.incomeStatementHistory?.[0]
            ?.totalRevenue?.raw || 0,
        operatingIncome:
          result.incomeStatementHistory?.incomeStatementHistory?.[0]
            ?.operatingIncome?.raw || 0,
        netIncome:
          result.incomeStatementHistory?.incomeStatementHistory?.[0]
            ?.netIncome?.raw || 0,
        companyName: result.price?.longName || ticker,
      };

      // Cache the data
      await this.setCache(`yahoo_${ticker}`, data, CACHE_TTL);

      return data;
    } catch (error) {
      console.error(`Error fetching data for ${ticker}:`, error);
      throw new Error(`Failed to fetch financial data for ${ticker}`);
    }
  }

  static async getDefaultAssumptions(beta: number) {
    const riskFreeRate = 0.045; // 4.5% (US 10Y Treasury)
    const marketRiskPremium = 0.08; // 8%
    const costOfEquity = riskFreeRate + beta * marketRiskPremium;
    const wacc = costOfEquity * 0.7 + 0.05 * 0.3 * 0.75; // Simplified WACC

    return {
      revenueGrowth: 0.10, // 10% default
      terminalGrowth: 0.03, // 3% (GDP growth)
      operatingMargin: 0.15, // 15% default
      taxRate: 0.25, // 25% effective tax
      capexPct: 0.05, // 5% of revenue
      nwcPct: 0.02, // 2% of revenue
      wacc: Math.max(wacc, 0.06), // At least 6%
    };
  }

  private static async getFromCache(key: string) {
    try {
      await connectDB();
      const cached = await Cache.findOne({ key });
      if (cached && cached.expiresAt > new Date()) {
        return cached.data;
      }
      return null;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  }

  private static async setCache(key: string, data: any, ttl: number) {
    try {
      await connectDB();
      const expiresAt = new Date(Date.now() + ttl * 1000);
      await Cache.updateOne(
        { key },
        { key, data, expiresAt },
        { upsert: true }
      );
    } catch (error) {
      console.error('Cache write error:', error);
    }
  }
}
