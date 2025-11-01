// pages/api/analyze.ts
// Main API endpoint for stock analysis

import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import { FinancialDataFetcher } from '@/lib/services/financialDataFetcher';
import { DCFCalculator } from '@/lib/services/dcfCalculator';
import { StockAnalysis } from '@/lib/models/Stock';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ticker, customAssumptions } = req.body;

  // Validate input
  if (!ticker || typeof ticker !== 'string') {
    return res.status(400).json({ error: 'Invalid ticker' });
  }

  try {
    // Connect to database
    await connectDB();

    // Fetch financial data from Yahoo Finance
    const financialData =
      await FinancialDataFetcher.fetchYahooFinance(ticker.toUpperCase());

    // Get default assumptions (or use custom)
    let assumptions = await FinancialDataFetcher.getDefaultAssumptions(
      financialData.beta
    );

    if (customAssumptions) {
      assumptions = { ...assumptions, ...customAssumptions };
    }

    // Calculate DCF
    const dcfResult = DCFCalculator.calculate(
      {
        revenueLTM: financialData.revenue / 1000000,
        sharesOutstanding: financialData.sharesOutstanding,
        debt: financialData.totalDebt / 1000000,
        cash: financialData.totalCash / 1000000,
      },
      assumptions
    );

    // Get recommendation
    const recommendation = DCFCalculator.getRecommendation(
      dcfResult.intrinsicValue,
      financialData.currentPrice
    );
    const upside = DCFCalculator.getUpside(
      dcfResult.intrinsicValue,
      financialData.currentPrice
    );

    // Save analysis to database
    const analysis = new StockAnalysis({
      ticker: ticker.toUpperCase(),
      companyName: financialData.companyName,
      currentPrice: financialData.currentPrice,
      dcfAnalysis: {
        intrinsicValue: dcfResult.intrinsicValue,
        upside,
        recommendation,
        enterpriseValue: dcfResult.enterpriseValue,
        equityValue: dcfResult.equityValue,
        pvFcf5Year: dcfResult.pvFcf5Year,
        pvTerminalValue: dcfResult.pvTerminalValue,
      },
      assumptions,
      financials: {
        revenueLTM: financialData.revenue / 1000000,
        ebitLTM:
          financialData.operatingIncome / 1000000,
        operatingMargin: assumptions.operatingMargin,
        marketCap: financialData.marketCap / 1000000,
        beta: financialData.beta,
      },
    });

    await analysis.save();

    // Return result
    res.status(200).json({
      success: true,
      data: {
        ticker: ticker.toUpperCase(),
        companyName: financialData.companyName,
        currentPrice: financialData.currentPrice,
        valuation: {
          intrinsicValue: dcfResult.intrinsicValue,
          upside,
          recommendation,
          signal: recommendation.replace(/_/g, '_').toLowerCase(),
        },
        dcf: {
          enterpriseValue: dcfResult.enterpriseValue,
          equityValue: dcfResult.equityValue,
          pvFcf5Year: dcfResult.pvFcf5Year,
          pvTerminalValue: dcfResult.pvTerminalValue,
          terminalValue: dcfResult.terminalValue,
          fcfProjections: dcfResult.fcfProjections,
        },
        assumptions,
        financials: {
          revenueLTM: financialData.revenue / 1000000,
          operatingMargin: assumptions.operatingMargin,
          beta: financialData.beta,
          marketCap: financialData.marketCap / 1000000,
        },
      },
      analysisId: analysis._id,
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error:
        error.message ||
        'Failed to analyze stock. Please check the ticker and try again.',
    });
  }
}
