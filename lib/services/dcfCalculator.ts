// lib/services/dcfCalculator.ts
// Core DCF valuation logic

export interface DCFAssumptions {
  revenueGrowth: number;
  terminalGrowth: number;
  operatingMargin: number;
  taxRate: number;
  capexPct: number;
  nwcPct: number;
  wacc: number;
}

export interface FinancialData {
  revenueLTM: number;
  sharesOutstanding: number;
  debt: number;
  cash: number;
}

export interface DCFResult {
  intrinsicValue: number;
  enterpriseValue: number;
  equityValue: number;
  pvFcf5Year: number;
  pvTerminalValue: number;
  fcfProjections: number[];
  terminalValue: number;
}

export class DCFCalculator {
  static calculate(
    financials: FinancialData,
    assumptions: DCFAssumptions
  ): DCFResult {
    // Step 1: Project FCF for 5 years
    const fcfProjections: number[] = [];
    let projectedRevenue = financials.revenueLTM;

    for (let year = 1; year <= 5; year++) {
      projectedRevenue *= (1 + assumptions.revenueGrowth);
      const ebit = projectedRevenue * assumptions.operatingMargin;
      const nopat = ebit * (1 - assumptions.taxRate);
      const da = projectedRevenue * 0.03; // 3% depreciation
      const capex = projectedRevenue * assumptions.capexPct;
      const nwcChange = projectedRevenue * assumptions.nwcPct;
      const fcf = nopat + da - capex - nwcChange;
      fcfProjections.push(fcf);
    }

    // Step 2: Calculate Terminal Value
    const terminalFCF =
      fcfProjections[4] * (1 + assumptions.terminalGrowth);
    const terminalValue =
      terminalFCF / (assumptions.wacc - assumptions.terminalGrowth);

    // Step 3: Calculate Present Values
    let pvFcf5Year = 0;
    for (let i = 0; i < 5; i++) {
      const discountFactor = 1 / Math.pow(1 + assumptions.wacc, i + 1);
      pvFcf5Year += fcfProjections[i] * discountFactor;
    }

    const discountFactorTerminal =
      1 / Math.pow(1 + assumptions.wacc, 5);
    const pvTerminalValue = terminalValue * discountFactorTerminal;

    // Step 4: Calculate Enterprise Value
    const enterpriseValue = pvFcf5Year + pvTerminalValue;

    // Step 5: Calculate Equity Value
    const equityValue =
      enterpriseValue - financials.debt + financials.cash;

    // Step 6: Calculate Intrinsic Value per Share
    const intrinsicValue =
      (equityValue * 1000000) / (financials.sharesOutstanding * 1000000);

    return {
      intrinsicValue: Math.round(intrinsicValue * 100) / 100,
      enterpriseValue: Math.round(enterpriseValue),
      equityValue: Math.round(equityValue),
      pvFcf5Year: Math.round(pvFcf5Year),
      pvTerminalValue: Math.round(pvTerminalValue),
      fcfProjections: fcfProjections.map((fcf) => Math.round(fcf)),
      terminalValue: Math.round(terminalValue),
    };
  }

  static getRecommendation(
    intrinsicValue: number,
    currentPrice: number
  ): string {
    const upside = (intrinsicValue - currentPrice) / currentPrice;

    if (upside >= 0.3) return 'STRONG_BUY';
    if (upside >= 0.15) return 'BUY';
    if (upside >= -0.1) return 'HOLD';
    if (upside < -0.25) return 'SELL';
    return 'WEAK_HOLD';
  }

  static getUpside(intrinsicValue: number, currentPrice: number): number {
    return Math.round(
      ((intrinsicValue - currentPrice) / currentPrice) * 1000
    ) / 10;
  }
}
