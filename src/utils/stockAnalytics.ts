
// Stock analytics utility functions for generating mock data and calculations

export interface StockData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma20?: number;
  ma50?: number;
  rsi?: number;
  macd?: number;
  macdSignal?: number;
  upperBB?: number;
  lowerBB?: number;
  portfolio?: number;
  benchmark?: number;
  prediction?: number;
}

export const generateMockStockData = (symbol: string, days: number = 252): StockData[] => {
  const data: StockData[] = [];
  const basePrice = getBasePriceForSymbol(symbol);
  let currentPrice = basePrice;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Generate realistic price movements
    const volatility = 0.02;
    const drift = 0.0002;
    const randomChange = (Math.random() - 0.5) * volatility;
    currentPrice = currentPrice * (1 + drift + randomChange);
    
    const high = currentPrice * (1 + Math.random() * 0.02);
    const low = currentPrice * (1 - Math.random() * 0.02);
    const open = low + Math.random() * (high - low);
    const close = low + Math.random() * (high - low);
    const volume = Math.floor(Math.random() * 10000000) + 1000000;

    data.push({
      date: date.toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      volume
    });
  }

  return calculateTechnicalIndicators(data);
};

const getBasePriceForSymbol = (symbol: string): number => {
  const basePrices: Record<string, number> = {
    'TSLA': 250,
    'AAPL': 180,
    'GOOGL': 140,
    'MSFT': 350,
    'AMZN': 145,
    'NVDA': 450,
    'META': 280,
    'BTC-USD': 45000,
    'CUSTOM': 100,
    'FORECAST': 250
  };
  return basePrices[symbol] || 100;
};

export const calculateTechnicalIndicators = (data: StockData[]): StockData[] => {
  const result = [...data];
  
  // Calculate Moving Averages
  for (let i = 0; i < result.length; i++) {
    // 20-day MA
    if (i >= 19) {
      const sum20 = result.slice(i - 19, i + 1).reduce((sum, item) => sum + item.close, 0);
      result[i].ma20 = sum20 / 20;
    }
    
    // 50-day MA
    if (i >= 49) {
      const sum50 = result.slice(i - 49, i + 1).reduce((sum, item) => sum + item.close, 0);
      result[i].ma50 = sum50 / 50;
    }
    
    // RSI Calculation (simplified)
    if (i >= 14) {
      const gains = [];
      const losses = [];
      
      for (let j = i - 13; j <= i; j++) {
        const change = result[j].close - result[j - 1].close;
        if (change > 0) gains.push(change);
        else losses.push(Math.abs(change));
      }
      
      const avgGain = gains.reduce((sum, gain) => sum + gain, 0) / 14;
      const avgLoss = losses.reduce((sum, loss) => sum + loss, 0) / 14;
      const rs = avgGain / (avgLoss || 1);
      result[i].rsi = 100 - (100 / (1 + rs));
    }
    
    // MACD Calculation (simplified)
    if (i >= 26) {
      const ema12 = calculateEMA(result.slice(0, i + 1), 12);
      const ema26 = calculateEMA(result.slice(0, i + 1), 26);
      result[i].macd = ema12 - ema26;
      
      if (i >= 34) {
        const macdValues = result.slice(i - 8, i + 1).map(item => item.macd || 0);
        result[i].macdSignal = macdValues.reduce((sum, val) => sum + val, 0) / 9;
      }
    }
    
    // Bollinger Bands
    if (i >= 19) {
      const period = 20;
      const slice = result.slice(i - period + 1, i + 1);
      const sma = slice.reduce((sum, item) => sum + item.close, 0) / period;
      const variance = slice.reduce((sum, item) => sum + Math.pow(item.close - sma, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      
      result[i].upperBB = sma + (2 * stdDev);
      result[i].lowerBB = sma - (2 * stdDev);
    }
    
    // Portfolio and benchmark simulation
    result[i].portfolio = result[i].close * (1 + Math.random() * 0.1);
    result[i].benchmark = result[i].close * (1 + Math.random() * 0.05);
    
    // Prediction (for forecast tab)
    if (Math.random() > 0.5) {
      result[i].prediction = result[i].close * (1 + (Math.random() - 0.5) * 0.1);
    }
  }
  
  return result;
};

const calculateEMA = (data: StockData[], period: number): number => {
  const multiplier = 2 / (period + 1);
  let ema = data[0].close;
  
  for (let i = 1; i < data.length; i++) {
    ema = (data[i].close * multiplier) + (ema * (1 - multiplier));
  }
  
  return ema;
};

export const generateOptionPricingData = () => {
  return {
    callPrice: 12.45,
    putPrice: 8.92,
    impliedVolatility: 0.25,
    delta: 0.65,
    gamma: 0.03,
    theta: -0.12,
    vega: 0.18,
    rho: 0.08
  };
};

export const generateVolatilitySurface = () => {
  const strikes = [80, 90, 100, 110, 120];
  const expirations = [30, 60, 90, 180, 365];
  const surface = [];
  
  for (const expiration of expirations) {
    for (const strike of strikes) {
      surface.push({
        strike,
        expiration,
        volatility: 0.15 + Math.random() * 0.3
      });
    }
  }
  
  return surface;
};

export const backtestStrategy = (data: StockData[]) => {
  let capital = 10000;
  let shares = 0;
  const results = [];
  
  for (let i = 50; i < data.length; i++) {
    const current = data[i];
    const prev = data[i - 1];
    
    // Simple moving average crossover strategy
    if (current.ma20 && current.ma50 && prev.ma20 && prev.ma50) {
      // Buy signal
      if (current.ma20 > current.ma50 && prev.ma20 <= prev.ma50 && capital > 0) {
        shares = Math.floor(capital / current.close);
        capital = capital - (shares * current.close);
      }
      // Sell signal
      else if (current.ma20 < current.ma50 && prev.ma20 >= prev.ma50 && shares > 0) {
        capital = capital + (shares * current.close);
        shares = 0;
      }
    }
    
    const totalValue = capital + (shares * current.close);
    results.push({
      date: current.date,
      value: totalValue,
      return: ((totalValue - 10000) / 10000) * 100
    });
  }
  
  return results;
};

export const calculatePortfolioMetrics = (data: StockData[]) => {
  const returns = data.slice(1).map((item, i) => 
    (item.close - data[i].close) / data[i].close
  );
  
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance * 252); // Annualized
  
  const sortedReturns = [...returns].sort((a, b) => a - b);
  const var95 = sortedReturns[Math.floor(sortedReturns.length * 0.05)];
  const var99 = sortedReturns[Math.floor(sortedReturns.length * 0.01)];
  
  const riskFreeRate = 0.02;
  const sharpeRatio = (avgReturn * 252 - riskFreeRate) / volatility;
  
  return {
    avgReturn: avgReturn * 252,
    volatility,
    var95,
    var99,
    sharpeRatio,
    maxDrawdown: calculateMaxDrawdown(data)
  };
};

const calculateMaxDrawdown = (data: StockData[]): number => {
  let maxDrawdown = 0;
  let peak = data[0].close;
  
  for (const item of data) {
    if (item.close > peak) {
      peak = item.close;
    }
    const drawdown = (peak - item.close) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  
  return maxDrawdown;
};
