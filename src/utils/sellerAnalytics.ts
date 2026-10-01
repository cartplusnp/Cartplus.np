import { Order, Product, SellerProfile } from '../types';

export interface DailySalesDataPoint {
  date: string;       // e.g. "Sep 18"
  fullDate: string;   // e.g. "2026-09-18"
  sales: number;      // Revenue in Rs.
  orders: number;     // Number of orders
  units: number;      // Units sold
  aov: number;        // Average Order Value in Rs.
}

export interface ProductPerformance {
  id: string;
  name: string;
  sku: string;
  category: string;
  thumbnail: string;
  price: number;
  stock: number;
  rating: number;
  unitsSold: number;
  revenue: number;
  percentageOfSales: number;
}

export interface CategorySalesShare {
  name: string;
  value: number; // Revenue in Rs.
  percentage: number;
  orderCount: number;
  color: string;
}

export interface SellerAnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  totalUnitsSold: number;
  averageOrderValue: number;
  revenueGrowthPct: number;
  ordersGrowthPct: number;
  dailyData: DailySalesDataPoint[];
  topProducts: ProductPerformance[];
  categoryBreakdown: CategorySalesShare[];
}

const CATEGORY_COLORS: Record<string, string> = {
  'Electronics': '#3b82f6',
  'Mobile & Accessories': '#8b5cf6',
  'Home & Kitchen': '#f59e0b',
  "Men's Fashion": '#10b981',
  "Women's Fashion": '#ec4899',
  'Beauty & Personal Care': '#06b6d4',
  'Sports & Outdoors': '#14b8a6',
  'Books & Stationery': '#6366f1',
  'Groceries & Daily Essentials': '#84cc16',
};

const DEFAULT_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#06b6d4'];

/**
 * Computes analytics data for a given seller across a selected time period (7, 14, or 30 days).
 */
export function getSellerAnalytics(
  seller: SellerProfile,
  sellerProducts: Product[],
  allOrders: Order[],
  days: 7 | 14 | 30 = 14
): SellerAnalyticsSummary {
  const today = new Date();

  // Filter orders relevant to this seller
  const sellerProductIds = new Set(sellerProducts.map((p) => p.id));
  
  // Real orders placed by customers that contain seller's products
  const sellerOrders = allOrders.filter((order) => {
    return order.items.some((item) => sellerProductIds.has(item.product_id));
  });

  const dailyPoints: DailySalesDataPoint[] = [];

  // Generate date points backwards from today
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const fullDate = `${year}-${month}-${day}`;
    
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    const dateLabel = i === 0 ? 'Today' : `${monthName} ${d.getDate()}`;

    // Check real orders matching this date
    const realOrdersOnDate = sellerOrders.filter((ord) => {
      const ordDate = ord.created_at ? ord.created_at.slice(0, 10) : '';
      return ordDate === fullDate;
    });

    let daySales = 0;
    let dayOrders = 0;
    let dayUnits = 0;

    if (realOrdersOnDate.length > 0) {
      realOrdersOnDate.forEach((ord) => {
        let orderHasSellerItems = false;
        ord.items.forEach((it) => {
          if (sellerProductIds.has(it.product_id)) {
            daySales += (it.price || 0) * (it.quantity || 1);
            dayUnits += it.quantity || 1;
            orderHasSellerItems = true;
          }
        });
        if (orderHasSellerItems) {
          dayOrders += 1;
        }
      });
    }

    const aov = dayOrders > 0 ? Math.round(daySales / dayOrders) : 0;

    dailyPoints.push({
      date: dateLabel,
      fullDate,
      sales: daySales,
      orders: dayOrders,
      units: dayUnits,
      aov,
    });
  }

  // Calculate totals for the selected period
  const totalRevenue = dailyPoints.reduce((acc, pt) => acc + pt.sales, 0);
  const totalOrders = dailyPoints.reduce((acc, pt) => acc + pt.orders, 0);
  const totalUnitsSold = dailyPoints.reduce((acc, pt) => acc + pt.units, 0);
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Compute period-over-period growth estimates
  const half = Math.floor(dailyPoints.length / 2);
  const firstHalfSales = dailyPoints.slice(0, half).reduce((acc, pt) => acc + pt.sales, 0);
  const secondHalfSales = dailyPoints.slice(half).reduce((acc, pt) => acc + pt.sales, 0);
  const revenueGrowthPct = firstHalfSales > 0 
    ? Math.round(((secondHalfSales - firstHalfSales) / firstHalfSales) * 100) 
    : 0;

  const firstHalfOrders = dailyPoints.slice(0, half).reduce((acc, pt) => acc + pt.orders, 0);
  const secondHalfOrders = dailyPoints.slice(half).reduce((acc, pt) => acc + pt.orders, 0);
  const ordersGrowthPct = firstHalfOrders > 0
    ? Math.round(((secondHalfOrders - firstHalfOrders) / firstHalfOrders) * 100)
    : 0;

  // Build top-performing products
  // First tally any live units sold from sellerOrders
  const liveUnitsByProductId: Record<string, number> = {};
  sellerOrders.forEach((ord) => {
    ord.items.forEach((item) => {
      if (sellerProductIds.has(item.product_id)) {
        liveUnitsByProductId[item.product_id] = (liveUnitsByProductId[item.product_id] || 0) + item.quantity;
      }
    });
  });

  const topProducts: ProductPerformance[] = sellerProducts.map((p) => {
    const unitsSold = liveUnitsByProductId[p.id] || 0;
    const revenue = unitsSold * p.price;

    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      thumbnail: p.thumbnail || (p.images && p.images[0]) || '',
      price: p.price,
      stock: p.stock,
      rating: p.rating,
      unitsSold,
      revenue,
      percentageOfSales: 0, // will compute after sorting
    };
  });

  // Sort descending by revenue
  topProducts.sort((a, b) => b.revenue - a.revenue);

  // Compute percentages
  const totalTopProductRevenue = topProducts.reduce((acc, p) => acc + p.revenue, 0) || 1;
  topProducts.forEach((p) => {
    p.percentageOfSales = Math.round((p.revenue / totalTopProductRevenue) * 100);
  });

  // Build category distribution
  const categoryTotals: Record<string, { revenue: number; count: number }> = {};
  topProducts.forEach((p) => {
    if (!categoryTotals[p.category]) {
      categoryTotals[p.category] = { revenue: 0, count: 0 };
    }
    categoryTotals[p.category].revenue += p.revenue;
    categoryTotals[p.category].count += p.unitsSold;
  });

  const categoryBreakdown: CategorySalesShare[] = Object.entries(categoryTotals).map(
    ([categoryName, data], index) => {
      const percentage = Math.round((data.revenue / totalTopProductRevenue) * 100);
      const color = CATEGORY_COLORS[categoryName] || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
      return {
        name: categoryName,
        value: data.revenue,
        percentage,
        orderCount: data.count,
        color,
      };
    }
  );

  categoryBreakdown.sort((a, b) => b.value - a.value);

  return {
    totalRevenue,
    totalOrders,
    totalUnitsSold,
    averageOrderValue,
    revenueGrowthPct,
    ordersGrowthPct,
    dailyData: dailyPoints,
    topProducts,
    categoryBreakdown,
  };
}
