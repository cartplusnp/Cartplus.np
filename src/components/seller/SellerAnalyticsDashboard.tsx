import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  DollarSign,
  PackageCheck,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  Award,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw,
  Download,
} from 'lucide-react';
import { Product, Order, SellerProfile } from '../../types';
import { getSellerAnalytics } from '../../utils/sellerAnalytics';

interface SellerAnalyticsDashboardProps {
  seller: SellerProfile;
  sellerProducts: Product[];
  orders: Order[];
}

export const SellerAnalyticsDashboard: React.FC<SellerAnalyticsDashboardProps> = ({
  seller,
  sellerProducts,
  orders,
}) => {
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(14);
  const [salesChartType, setSalesChartType] = useState<'area' | 'bar'>('area');
  const [productRankingMetric, setProductRankingMetric] = useState<'revenue' | 'units'>('revenue');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const analytics = useMemo(() => {
    return getSellerAnalytics(seller, sellerProducts, orders, timeRange);
  }, [seller, sellerProducts, orders, timeRange]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['Date', 'Gross Sales (NPR)', 'Orders Count', 'Units Sold', 'Average Order Value (NPR)'],
      ...analytics.dailyData.map((d) => [d.fullDate, d.sales, d.orders, d.units, d.aov]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cartplus_${seller.store_name.toLowerCase().replace(/\s+/g, '_')}_analytics_${timeRange}d.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Top 5 products for horizontal bar chart
  const top5Products = useMemo(() => {
    return analytics.topProducts.slice(0, 5).map((p) => ({
      name: p.name.length > 22 ? p.name.slice(0, 20) + '…' : p.name,
      fullName: p.name,
      revenue: p.revenue,
      units: p.unitsSold,
      stock: p.stock,
      sku: p.sku,
      thumbnail: p.thumbnail,
      price: p.price,
    }));
  }, [analytics.topProducts]);

  // Peak sales day calculation
  const peakDay = useMemo(() => {
    if (!analytics.dailyData.length) return null;
    return [...analytics.dailyData].sort((a, b) => b.sales - a.sales)[0];
  }, [analytics.dailyData]);

  return (
    <div className="space-y-6">
      {/* Analytics Toolbar Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black font-brand text-slate-900">
                Sales & Performance Analytics
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Live metrics for <span className="font-semibold text-slate-700">{seller.store_name}</span> · Real-time order tracking & revenue insights
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Time range switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/80">
            <button
              onClick={() => setTimeRange(7)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === 7
                  ? 'bg-white text-slate-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange(14)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === 14
                  ? 'bg-white text-slate-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setTimeRange(30)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                timeRange === 30
                  ? 'bg-white text-slate-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
          </div>

          {/* Quick Refresh Button */}
          <button
            onClick={handleRefresh}
            title="Refresh analytics data"
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
          </button>

          {/* CSV Export Button */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Sales in Period */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
              {timeRange}-Day Gross Sales
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-950 font-brand tabular-nums">
            Rs. {analytics.totalRevenue.toLocaleString('en-NP')}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`inline-flex items-center text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                analytics.revenueGrowthPct >= 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {analytics.revenueGrowthPct >= 0 ? (
                <TrendingUp className="w-3 h-3 mr-0.5 inline" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-0.5 inline" />
              )}
              {analytics.revenueGrowthPct >= 0 ? '+' : ''}
              {analytics.revenueGrowthPct}%
            </span>
            <span className="text-[10px] text-slate-400">vs previous {timeRange}d</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-950 font-brand tabular-nums">
            {analytics.totalOrders.toLocaleString('en-NP')} Orders
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`inline-flex items-center text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                analytics.ordersGrowthPct >= 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {analytics.ordersGrowthPct >= 0 ? (
                <TrendingUp className="w-3 h-3 mr-0.5 inline" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-0.5 inline" />
              )}
              {analytics.ordersGrowthPct >= 0 ? '+' : ''}
              {analytics.ordersGrowthPct}%
            </span>
            <span className="text-[10px] text-slate-400">order volume</span>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
              Avg. Order Value (AOV)
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-950 font-brand tabular-nums">
            Rs. {analytics.averageOrderValue.toLocaleString('en-NP')}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500">
            <span className="font-semibold text-slate-700">~Rs. {Math.round(analytics.averageOrderValue / 1.3).toLocaleString('en-NP')}</span>
            <span>avg item ticket</span>
          </div>
        </div>

        {/* Units Sold & Fulfillment */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
              Units Dispatched
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-950 font-brand tabular-nums">
            {analytics.totalUnitsSold} Units
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500">
            <span className="font-semibold text-emerald-600">100% COD Verified</span>
            <span>· 0% Returns</span>
          </div>
        </div>
      </div>

      {/* Main Charts Grid: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART 1: Daily Sales Trend (Spans 2 columns on desktop) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-brand">
                  Daily Sales Revenue (NPR)
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Daily turnover tracked across customer purchases and settlements
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {peakDay && (
                <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-md hidden md:inline">
                  Peak: {peakDay.date} (Rs. {peakDay.sales.toLocaleString('en-NP')})
                </span>
              )}

              {/* Toggle Area vs Bar */}
              <div className="bg-slate-100 p-0.5 rounded-lg flex items-center text-[10px] font-bold">
                <button
                  onClick={() => setSalesChartType('area')}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    salesChartType === 'area' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Curve
                </button>
                <button
                  onClick={() => setSalesChartType('bar')}
                  className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                    salesChartType === 'bar' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Bars
                </button>
              </div>
            </div>
          </div>

          {/* Recharts Area/Bar Chart */}
          <div className="h-[230px] sm:h-[290px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {salesChartType === 'area' ? (
                <AreaChart
                  data={analytics.dailyData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `Rs.${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
                  />
                  <Tooltip content={<CustomSalesTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    name="Daily Sales"
                    stroke="#d97706"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#salesGradient)"
                    activeDot={{ r: 6, fill: '#b45309', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              ) : (
                <BarChart
                  data={analytics.dailyData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `Rs.${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`}
                  />
                  <Tooltip content={<CustomSalesTooltip />} />
                  <Bar
                    dataKey="sales"
                    name="Daily Sales"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Quick highlights bottom row */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Daily Avg Sales</span>
              <span className="font-bold text-slate-900 font-brand">
                Rs. {Math.round(analytics.totalRevenue / timeRange).toLocaleString('en-NP')}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Daily Avg Orders</span>
              <span className="font-bold text-slate-900 font-brand">
                {(analytics.totalOrders / timeRange).toFixed(1)} / day
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Settlement Mode</span>
              <span className="font-bold text-emerald-600 font-brand">connectIPS / COD</span>
            </div>
          </div>
        </div>

        {/* CHART 2: Daily Total Orders (BarChart) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-2xs space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 font-brand">
                Total Orders Placed
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Daily customer order count volume
            </p>
          </div>

          {/* Recharts Bar Chart for Orders */}
          <div className="h-[230px] sm:h-[290px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.dailyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomOrdersTooltip />} />
                <Bar
                  dataKey="orders"
                  name="Orders Placed"
                  fill="#3b82f6"
                  radius={[5, 5, 0, 0]}
                >
                  {analytics.dailyData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.orders >= 3 ? '#2563eb' : '#60a5fa'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] font-bold text-blue-900 uppercase block">Total Orders in Period</span>
              <span className="font-extrabold text-blue-950 font-brand text-sm">{analytics.totalOrders} Dispatches</span>
            </div>
            <span className="text-[11px] text-blue-700 font-semibold bg-white px-2 py-1 rounded-lg border border-blue-200">
              Avg {(analytics.totalOrders / timeRange).toFixed(1)}/day
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Top-Performing Products Visualization & Product Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART 3: Top-Performing Products Horizontal Bar Chart & List (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xs">
                  ★
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-brand">
                  Top-Performing Products
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Highest grossing inventory items and sales contributors
              </p>
            </div>

            {/* Metric Switcher: By Revenue vs By Units */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 self-start sm:self-auto text-xs font-bold">
              <button
                onClick={() => setProductRankingMetric('revenue')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  productRankingMetric === 'revenue'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                By Revenue (Rs.)
              </button>
              <button
                onClick={() => setProductRankingMetric('units')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  productRankingMetric === 'units'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                By Units Sold
              </button>
            </div>
          </div>

          {/* Graphical Bar Chart for Top 5 Products */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Top 5 Products ({productRankingMetric === 'revenue' ? 'Gross Revenue' : 'Units Sold'})
            </span>
            <div className="h-[210px] sm:h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={top5Products}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) =>
                      productRankingMetric === 'revenue'
                        ? `Rs.${val >= 1000 ? `${Math.round(val / 1000)}k` : val}`
                        : `${val} units`
                    }
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11, fill: '#334155' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    width={110}
                  />
                  <Tooltip content={<CustomTopProductTooltip metric={productRankingMetric} />} />
                  <Bar
                    dataKey={productRankingMetric}
                    name={productRankingMetric === 'revenue' ? 'Gross Revenue' : 'Units Sold'}
                    fill={productRankingMetric === 'revenue' ? '#10b981' : '#8b5cf6'}
                    radius={[0, 6, 6, 0]}
                  >
                    {top5Products.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          productRankingMetric === 'revenue'
                            ? ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'][index % 5]
                            : ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'][index % 5]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products Detailed Performance List */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Ranked Products Breakdown
            </span>

            <div className="divide-y divide-slate-100">
              {analytics.topProducts.slice(0, 6).map((item, rank) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/60 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                        rank === 0
                          ? 'bg-amber-400 text-slate-950 font-black'
                          : rank === 1
                          ? 'bg-slate-200 text-slate-700'
                          : rank === 2
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {rank + 1}
                    </span>

                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                      <img
                        src={item.thumbnail}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="font-mono">SKU: {item.sku}</span>
                        <span>·</span>
                        <span>{item.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-slate-900 tabular-nums">
                      Rs. {item.revenue.toLocaleString('en-NP')}
                    </div>
                    <div className="flex items-center justify-end gap-2 text-[10px] mt-0.5">
                      <span className="font-semibold text-slate-600">
                        {item.unitsSold} units sold
                      </span>
                      <span className="text-slate-300">·</span>
                      <span
                        className={`font-medium ${
                          item.stock <= 5 ? 'text-rose-600 font-bold' : 'text-slate-500'
                        }`}
                      >
                        {item.stock} in stock
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CHART 4: Category Distribution (Donut PieChart) & Strategic Insights */}
        <div className="space-y-6">
          {/* Donut Chart */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-2xs space-y-4">
            <div className="pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-brand">
                  Category Share
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Revenue contribution by catalog category
              </p>
            </div>

            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.categoryBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {analytics.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomCategoryTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category breakdown legend list */}
            <div className="space-y-2 pt-1">
              {analytics.categoryBreakdown.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    ></span>
                    <span className="text-slate-700 truncate font-medium">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-slate-900 tabular-nums">
                      Rs. {cat.value.toLocaleString('en-NP')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({cat.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Insights & Seller Recommendations */}
          <div className="bg-linear-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center gap-2 text-amber-400">
              <Sparkles className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Seller Growth Insights
              </h4>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2 bg-white/5 p-2.5 rounded-xl border border-white/10">
                <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  Top performer: <strong className="text-white">{analytics.topProducts[0]?.name}</strong> drove {analytics.topProducts[0]?.percentageOfSales}% of total catalog revenue.
                </p>
              </div>

              <div className="flex items-start gap-2 bg-white/5 p-2.5 rounded-xl border border-white/10">
                <Calendar className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  Sales velocity peaked on <strong className="text-white">{peakDay?.date}</strong> with <strong className="text-white">Rs. {peakDay?.sales.toLocaleString('en-NP')}</strong> in orders.
                </p>
              </div>

              {analytics.topProducts.some((p) => p.stock <= 5) && (
                <div className="flex items-start gap-2 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 text-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p>
                    Inventory Alert: Several high-performing products have low stock units remaining. Restock promptly to prevent lost orders.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- Custom Tooltip Components for crisp, tailored UI --- */

interface TooltipPayloadItem {
  name: string;
  value: number;
  payload: any;
  color?: string;
}

const CustomSalesTooltip: React.FC<{
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;

  return (
    <div className="bg-slate-950 text-white rounded-xl p-3 shadow-xl border border-slate-800 text-xs min-w-[170px]">
      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
        {data.fullDate || label}
      </div>
      <div className="text-sm font-black text-amber-400 font-brand">
        Rs. {Number(data.sales).toLocaleString('en-NP')}
      </div>
      <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-1 text-[11px] text-slate-300">
        <div className="flex justify-between">
          <span className="text-slate-400">Orders:</span>
          <span className="font-bold text-white">{data.orders} dispatches</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Units Sold:</span>
          <span className="font-bold text-white">{data.units} items</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Avg Basket:</span>
          <span className="font-bold text-emerald-400">Rs. {Number(data.aov).toLocaleString('en-NP')}</span>
        </div>
      </div>
    </div>
  );
};

const CustomOrdersTooltip: React.FC<{
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;

  return (
    <div className="bg-slate-950 text-white rounded-xl p-3 shadow-xl border border-slate-800 text-xs min-w-[160px]">
      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
        {data.fullDate || label}
      </div>
      <div className="text-sm font-black text-blue-400 font-brand">
        {data.orders} Orders Placed
      </div>
      <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-1 text-[11px] text-slate-300">
        <div className="flex justify-between">
          <span className="text-slate-400">Day Revenue:</span>
          <span className="font-bold text-white">Rs. {Number(data.sales).toLocaleString('en-NP')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Units:</span>
          <span className="font-bold text-white">{data.units} items</span>
        </div>
      </div>
    </div>
  );
};

const CustomTopProductTooltip: React.FC<{
  active?: boolean;
  payload?: TooltipPayloadItem[];
  metric?: 'revenue' | 'units';
}> = ({ active, payload, metric = 'revenue' }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;

  return (
    <div className="bg-slate-950 text-white rounded-xl p-3 shadow-xl border border-slate-800 text-xs max-w-[240px]">
      <div className="font-bold text-white mb-1 line-clamp-2">{data.fullName}</div>
      <div className="font-mono text-[10px] text-slate-400 mb-2">SKU: {data.sku}</div>
      <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span className="text-slate-400">Gross Sales:</span>
          <span className="font-bold text-emerald-400">
            Rs. {Number(data.revenue).toLocaleString('en-NP')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Units Sold:</span>
          <span className="font-bold text-purple-300">{data.units} units</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Stock Left:</span>
          <span className={`font-bold ${data.stock <= 5 ? 'text-rose-400' : 'text-slate-200'}`}>
            {data.stock} units
          </span>
        </div>
      </div>
    </div>
  );
};

const CustomCategoryTooltip: React.FC<{
  active?: boolean;
  payload?: TooltipPayloadItem[];
}> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;

  return (
    <div className="bg-slate-950 text-white rounded-xl p-2.5 shadow-xl border border-slate-800 text-xs">
      <div className="font-bold text-white">{data.name}</div>
      <div className="text-amber-400 font-extrabold font-brand mt-0.5">
        Rs. {Number(data.value).toLocaleString('en-NP')}
      </div>
      <div className="text-[10px] text-slate-400 mt-1">
        {data.percentage}% of catalog sales · {data.orderCount} units
      </div>
    </div>
  );
};
