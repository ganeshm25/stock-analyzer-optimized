// pages/api/analyses.ts
// API endpoint for managing saved analyses

import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/db';
import { StockAnalysis } from '@/lib/models/Stock';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await connectDB();

    if (req.method === 'GET') {
      // Get analysis history (limited to last 50)
      const analyses = await StockAnalysis.find()
        .sort({ analysisDate: -1 })
        .limit(50)
        .select(
          'ticker companyName currentPrice dcfAnalysis.intrinsicValue dcfAnalysis.recommendation analysisDate'
        );

      return res.status(200).json({ analyses });
    }

    if (req.method === 'POST') {
      const { analysisId } = req.body;

      // Mark analysis as saved
      const analysis = await StockAnalysis.findByIdAndUpdate(
        analysisId,
        { saved: true },
        { new: true }
      );

      return res.status(200).json({ success: true, analysis });
    }

    if (req.method === 'DELETE') {
      const { analysisId } = req.query;

      // Delete analysis
      await StockAnalysis.findByIdAndDelete(analysisId);

      return res.status(200).json({ success: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Analyses API error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
}
