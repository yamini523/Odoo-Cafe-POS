import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, ShoppingBag, IndianRupee, Package } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Button } from '@/components/ui/button';
import { getAuthenticatedBackend } from '../lib/auth';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';

const COLORS = ['#f97316', '#6366f1', '#22c55e', '#06b6d4', '#a855f7'];

function formatCurrency(v: number) { return `₹${Number(v).toFixed(0)}`; }

export default function ReportsPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [filter, setFilter] = useState('week');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const api = getAuthenticatedBackend();
      const res = await api.reports.dashboard();
      setMetrics(res);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  if (loading) return (
    <div className="p-6 flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent" />
    </div>
  );

  const salesTrend = metrics?.sales_trend ?? [];
  const topProducts = metrics?.top_products ?? [];
  const topCategories = metrics?.top_categories ?? [];
  const paymentBreakdown = metrics?.payment_breakdown ?? [];

  return (
    <div className="p-6">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Business performance insights"
        icon={<BarChart3 className="w-6 h-6" />}
      />

      <div className="flex gap-2 mb-6">
        {['today', 'week', 'month'].map(f => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)}
            className={filter === f ? 'bg-orange-500 hover:bg-orange-600' : ''}
          >
            {f === 'today' ? 'Today' : f === 'week' ? 'This Week' : 'This Month'}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(metrics?.total_revenue ?? 0)}
          icon={<IndianRupee className="w-5 h-5" />}
          color="orange"
          subtitle="All time"
        />
        <StatCard
          title="Total Orders"
          value={String(metrics?.total_orders ?? 0)}
          icon={<ShoppingBag className="w-5 h-5" />}
          color="blue"
          subtitle="All time"
        />
        <StatCard
          title="Today Revenue"
          value={formatCurrency(metrics?.today_revenue ?? 0)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
          subtitle="Today"
        />
        <StatCard
          title="Avg Order Value"
          value={formatCurrency(metrics?.avg_order_value ?? 0)}
          icon={<Package className="w-5 h-5" />}
          color="purple"
          subtitle="Per order"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Revenue Trend (Last 7 Days)</h3>
          {salesTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={(v: any) => [`₹${Number(v).toFixed(0)}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={2.5} dot={{ fill: '#f97316', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center text-gray-400">No data yet</div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Top Products</h3>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={(v: any) => [`₹${Number(v).toFixed(0)}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-56 flex items-center justify-center text-gray-400">No data yet</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Payment Methods</h3>
          {paymentBreakdown.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="60%" height={180}>
                <PieChart>
                  <Pie data={paymentBreakdown} cx="50%" cy="50%" outerRadius={70} dataKey="total" nameKey="method">
                    {paymentBreakdown.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => `₹${Number(v).toFixed(0)}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {paymentBreakdown.map((p: any, i: number) => (
                  <div key={p.method} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="capitalize text-gray-700 flex-1">{p.method}</span>
                    <span className="font-semibold">₹{Number(p.total).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">No payment data yet</div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Top Categories</h3>
          {topCategories.length > 0 ? (
            <div className="space-y-3">
              {topCategories.map((cat: any, i: number) => {
                const max = topCategories[0]?.revenue || 1;
                const pct = (cat.revenue / max) * 100;
                return (
                  <div key={cat.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 font-medium">{cat.name}</span>
                      <span className="font-semibold text-gray-800">₹{Number(cat.revenue).toFixed(0)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400">No category data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
