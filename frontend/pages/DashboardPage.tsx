import React, { useEffect, useState } from 'react';
import { ShoppingBag, TrendingUp, Users, Grid3x3, IndianRupee, Package, Clock, Star } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import backend from '~backend/client';
import StatCard from '../components/StatCard';
import PageHeader from '../components/PageHeader';
import { formatCurrency } from '../lib/format';

const PIE_COLORS = ['#f97316', '#6366f1', '#22c55e', '#06b6d4', '#a855f7'];

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    backend.reports.dashboard().then(d => { setMetrics(d); setLoading(false); }).catch(console.error);
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader title="Dashboard" subtitle="Welcome back! Here's what's happening today." />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(metrics?.today_revenue ?? 0)}
          subtitle="Today's earnings"
          icon={<IndianRupee size={22} />}
          color="orange"
        />
        <StatCard
          title="Today's Orders"
          value={String(metrics?.today_orders ?? 0)}
          subtitle="Orders placed today"
          icon={<ShoppingBag size={22} />}
          color="blue"
        />
        <StatCard
          title="Active Tables"
          value={String(metrics?.active_tables ?? 0)}
          subtitle="Currently occupied"
          icon={<Grid3x3 size={22} />}
          color="green"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(metrics?.total_revenue ?? 0)}
          subtitle={`Avg: ${formatCurrency(metrics?.avg_order_value ?? 0)}`}
          icon={<TrendingUp size={22} />}
          color="purple"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        {/* Revenue Trend */}
        <div className="xl:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={metrics?.sales_trend ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
              <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} dot={{ fill: '#f97316', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Breakdown */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Payment Methods</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={metrics?.payment_breakdown ?? []}
                dataKey="total"
                nameKey="method"
                cx="50%" cy="50%"
                outerRadius={80}
                label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {(metrics?.payment_breakdown ?? []).map((_: any, i: number) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
            </PieChart>
          </ResponsiveContainer>
          {(!metrics?.payment_breakdown || metrics.payment_breakdown.length === 0) && (
            <p className="text-center text-sm text-gray-400 mt-4">No payment data yet</p>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Top Products */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Products by Revenue</h3>
          {(metrics?.top_products ?? []).length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={metrics.top_products}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No sales data yet</div>
          )}
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Categories</h3>
          <div className="space-y-3">
            {(metrics?.top_categories ?? []).map((cat: any, i: number) => (
              <div key={cat.name} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">{cat.name}</span>
                    <span className="text-gray-500">{formatCurrency(cat.revenue)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (cat.revenue / ((metrics?.top_categories?.[0]?.revenue ?? 1) || 1)) * 100)}%`,
                        backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            {(!metrics?.top_categories || metrics.top_categories.length === 0) && (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No category data yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
