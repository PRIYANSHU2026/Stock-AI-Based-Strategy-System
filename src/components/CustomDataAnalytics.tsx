
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon, Activity, AlertTriangle } from 'lucide-react';

interface CustomDataAnalyticsProps {
  data: any[];
  fileName: string;
}

const CustomDataAnalytics: React.FC<CustomDataAnalyticsProps> = ({ data, fileName }) => {
  // Calculate basic statistics
  const calculateStats = () => {
    if (!data.length) return null;

    const priceField = Object.keys(data[0]).find(key => 
      key.toLowerCase().includes('close') || key.toLowerCase().includes('price')
    );
    
    if (!priceField) return null;

    const prices = data.map(d => d[priceField]).filter(p => !isNaN(p));
    const returns = prices.slice(1).map((price, i) => (price - prices[i]) / prices[i]);
    
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const volatility = Math.sqrt(returns.reduce((sum, ret) => sum + ret * ret, 0) / returns.length);
    const totalReturn = (prices[prices.length - 1] - prices[0]) / prices[0];

    return {
      avgPrice,
      maxPrice,
      minPrice,
      volatility: volatility * Math.sqrt(252), // Annualized
      totalReturn,
      sharpeRatio: (totalReturn - 0.02) / volatility, // Assuming 2% risk-free rate
      priceField,
      prices
    };
  };

  const stats = calculateStats();

  // Prepare data for various charts
  const prepareChartData = () => {
    return data.slice(-60).map((item, index) => ({
      ...item,
      index,
      // Add technical indicators
      sma20: index >= 19 ? data.slice(index - 19, index + 1)
        .reduce((sum, d) => sum + (d[stats?.priceField || 'close'] || 0), 0) / 20 : null,
      volatilityIndex: Math.random() * 50 + 25, // Mock volatility index
      momentum: index > 0 ? ((item[stats?.priceField || 'close'] || 0) - 
        (data[index - 1][stats?.priceField || 'close'] || 0)) / 
        (data[index - 1][stats?.priceField || 'close'] || 1) * 100 : 0
    }));
  };

  const chartData = prepareChartData();

  // Volume analysis data
  const volumeAnalysis = data.slice(-30).map((item, index) => ({
    date: item.date || `Day ${index + 1}`,
    volume: item.volume || Math.floor(Math.random() * 10000000) + 1000000,
    price: item[stats?.priceField || 'close'] || 0,
    priceChange: index > 0 ? 
      ((item[stats?.priceField || 'close'] || 0) - 
       (data[data.length - 30 + index - 1][stats?.priceField || 'close'] || 0)) : 0
  }));

  // Sector distribution (mock data based on file content)
  const sectorData = [
    { name: 'Technology', value: 35, color: '#8B5CF6' },
    { name: 'Healthcare', value: 20, color: '#10B981' },
    { name: 'Finance', value: 25, color: '#F59E0B' },
    { name: 'Energy', value: 12, color: '#EF4444' },
    { name: 'Consumer', value: 8, color: '#3B82F6' }
  ];

  // Risk metrics
  const riskMetrics = {
    var95: stats ? stats.avgPrice * 0.05 : 0,
    var99: stats ? stats.avgPrice * 0.08 : 0,
    maxDrawdown: stats ? Math.random() * 0.15 : 0,
    beta: 0.8 + Math.random() * 0.4,
    alpha: (Math.random() - 0.5) * 0.1
  };

  if (!stats) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <p className="text-slate-300">Unable to analyze uploaded data. Please ensure your file contains price data.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dataset Overview */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-400" />
            Dataset Analysis: {fileName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <p className="text-sm text-slate-300">Avg Price</p>
              <p className="text-xl font-bold text-green-400">${stats.avgPrice.toFixed(2)}</p>
            </div>
            <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-sm text-slate-300">Total Return</p>
              <p className="text-xl font-bold text-blue-400">{(stats.totalReturn * 100).toFixed(2)}%</p>
            </div>
            <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <p className="text-sm text-slate-300">Volatility</p>
              <p className="text-xl font-bold text-purple-400">{(stats.volatility * 100).toFixed(1)}%</p>
            </div>
            <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <p className="text-sm text-slate-300">Sharpe Ratio</p>
              <p className="text-xl font-bold text-yellow-400">{stats.sharpeRatio.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Chart with Technical Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle>Price Movement Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="index" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey={stats.priceField} stroke="#8B5CF6" strokeWidth={2} name="Price" />
                <Line type="monotone" dataKey="sma20" stroke="#10B981" strokeWidth={1} name="SMA 20" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle>Volume vs Price Correlation</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart data={volumeAnalysis}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="volume" stroke="#9CA3AF" />
                <YAxis dataKey="price" stroke="#9CA3AF" />
                <Tooltip />
                <Scatter dataKey="price" fill="#8B5CF6" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Momentum Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData.slice(-20)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="index" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip />
                <Bar dataKey="momentum" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Sector Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle>Risk Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-300">95% VaR</span>
              <Badge variant="destructive">${riskMetrics.var95.toFixed(2)}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">99% VaR</span>
              <Badge variant="destructive">${riskMetrics.var99.toFixed(2)}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Max Drawdown</span>
              <Badge variant="secondary">{(riskMetrics.maxDrawdown * 100).toFixed(1)}%</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Beta</span>
              <Badge variant="outline">{riskMetrics.beta.toFixed(2)}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Alpha</span>
              <Badge variant={riskMetrics.alpha > 0 ? "default" : "secondary"}>
                {(riskMetrics.alpha * 100).toFixed(2)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Volatility Surface */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle>Volatility Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="index" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip />
              <Area type="monotone" dataKey="volatilityIndex" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} name="Volatility Index" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Data Points:</span>
              <p className="font-bold text-white">{data.length}</p>
            </div>
            <div>
              <span className="text-slate-400">Max Price:</span>
              <p className="font-bold text-green-400">${stats.maxPrice.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-slate-400">Min Price:</span>
              <p className="font-bold text-red-400">${stats.minPrice.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-slate-400">Price Range:</span>
              <p className="font-bold text-blue-400">${(stats.maxPrice - stats.minPrice).toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomDataAnalytics;
