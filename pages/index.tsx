// pages/index.tsx
// Main application page

import React, { useState, useRef } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { TrendingUp, TrendingDown, AlertCircle, Save, Download } from 'lucide-react';

export default function Home() {
  const [ticker, setTicker] = useState('AAPL');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState('');
  const [customAssumptions, setCustomAssumptions] = useState(false);
  const [assumptions, setAssumptions] = useState({
    revenueGrowth: 0.1,
    terminalGrowth: 0.03,
    operatingMargin: 0.15,
    taxRate: 0.25,
    capexPct: 0.05,
    nwcPct: 0.02,
    wacc: 0.08,
  });

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/analyze', {
        ticker: ticker.toUpperCase(),
        customAssumptions: customAssumptions ? assumptions : undefined,
      });

      setAnalysis(response.data.data);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          'Error analyzing stock. Please check the ticker.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'strong_buy':
        return 'from-green-600 to-emerald-600';
      case 'buy':
        return 'from-green-500 to-emerald-500';
      case 'hold':
        return 'from-yellow-500 to-amber-500';
      case 'weak_hold':
        return 'from-yellow-400 to-amber-400';
      case 'sell':
        return 'from-red-600 to-orange-600';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const downloadPDF = () => {
    if (!analysis) return;
    // Placeholder for PDF download functionality
    alert('PDF export coming soon!');
  };

  const saveAnalysis = async () => {
    if (!analysis) return;
    try {
      await axios.post('/api/analyses', {
        analysisId: analysis.analysisId,
      });
      alert('Analysis saved!');
    } catch (error) {
      alert('Failed to save analysis');
    }
  };

  return (
    <>
      <Head>
        <title>Stock Intrinsic Value Analyzer</title>
        <meta
          name="description"
          content="DCF-based stock valuation and analysis"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              Stock Intrinsic Value Analyzer
            </h1>
            <p className="text-slate-300 text-lg">
              DCF-based valuation & investment recommendations
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <form onSubmit={handleAnalyze} className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  placeholder="Enter stock ticker (e.g., AAPL, MSFT)"
                  maxLength="5"
                  className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg font-semibold"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
                >
                  {loading ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>

              {/* Custom Assumptions Toggle */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customAssumptions}
                    onChange={(e) => setCustomAssumptions(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-700">
                    Use custom assumptions
                  </span>
                </label>
              </div>

              {/* Custom Assumptions */}
              {customAssumptions && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
                  {Object.entries(assumptions).map(([key, value]) => (
                    <div key={key}>
                      <label className="text-xs text-slate-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={value}
                        onChange={(e) =>
                          setAssumptions({
                            ...assumptions,
                            [key]: parseFloat(e.target.value),
                          })
                        }
                        className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-300 text-red-800 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Results */}
          {analysis && (
            <div className="space-y-6">
              {/* Main Signal Card */}
              <div
                className={`bg-gradient-to-r ${getSignalColor(
                  analysis.valuation.signal
                )} rounded-lg shadow-2xl p-8 text-white`}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-4xl font-bold">
                      {analysis.ticker}
                    </h2>
                    <p className="text-xl opacity-90">
                      {analysis.companyName}
                    </p>
                  </div>
                  <div className="text-5xl">
                    {analysis.valuation.upside > 0 ? '📈' : '📉'}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-sm opacity-80 uppercase tracking-wider mb-1">
                      Intrinsic Value
                    </p>
                    <p className="text-3xl font-bold">
                      ${analysis.valuation.intrinsicValue.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80 uppercase tracking-wider mb-1">
                      Current Price
                    </p>
                    <p className="text-3xl font-bold">
                      ${analysis.currentPrice.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm opacity-80 uppercase tracking-wider mb-1">
                      Upside/Downside
                    </p>
                    <p className="text-3xl font-bold">
                      {analysis.valuation.upside > 0 ? '+' : ''}
                      {analysis.valuation.upside}%
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-6 border-t border-white border-opacity-30">
                  <button
                    onClick={saveAnalysis}
                    className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={downloadPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  <div className="flex-1" />
                  <p className="text-2xl font-bold">
                    {analysis.valuation.recommendation}
                  </p>
                </div>
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Info */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">
                    📊 Company Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-600">Market Cap</span>
                      <span className="font-semibold">
                        ${(analysis.financials.marketCap / 1000).toFixed(1)}B
                      </span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-600">Beta</span>
                      <span className="font-semibold">
                        {analysis.financials.beta.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between pb-2 border-b border-slate-200">
                      <span className="text-slate-600">Operating Margin</span>
                      <span className="font-semibold">
                        {(analysis.assumptions.operatingMargin * 100).toFixed(
                          1
                        )}
                        %
                      </span>
                    </div>
                  </div>
                </div>

                {/* DCF Breakdown */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">
                    💰 DCF Valuation
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between bg-blue-50 p-2 rounded">
                      <span className="text-slate-600">
                        PV of FCF (5-Yr)
                      </span>
                      <span className="font-semibold">
                        ${(analysis.dcf.pvFcf5Year / 1000).toFixed(1)}B
                      </span>
                    </div>
                    <div className="flex justify-between bg-green-50 p-2 rounded">
                      <span className="text-slate-600">
                        PV Terminal Value
                      </span>
                      <span className="font-semibold">
                        ${(analysis.dcf.pvTerminalValue / 1000).toFixed(1)}B
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-amber-50 border-l-4 border-amber-600 rounded-lg p-4 text-sm text-amber-900">
                <p className="font-semibold mb-1">⚠️ Disclaimer</p>
                <p>
                  This analysis is educational only. Past performance ≠ future
                  results. Consult a financial advisor before investing.
                </p>
              </div>
            </div>
          )}

          {!analysis && !loading && (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-slate-600 text-lg font-semibold">
                Enter a stock ticker to analyze its intrinsic value
              </p>
              <p className="text-slate-500 text-sm mt-2">
                Try: AAPL, MSFT, GOOGL, AMZN, TSLA
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
