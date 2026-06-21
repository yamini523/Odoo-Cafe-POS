import React, { useState, useEffect, useCallback } from 'react';
import { Clock, ChefHat, CheckCircle, RefreshCw } from 'lucide-react';
import backend from '~backend/client';
import { timeAgo } from '../lib/format';
import { useToast } from '@/components/ui/use-toast';

interface KitchenOrder {
  id: number;
  order_number: string;
  table_number: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  items?: any[];
}

const STATUSES = [
  { key: 'pending', label: 'To Cook', color: 'yellow', bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700' },
  { key: 'preparing', label: 'Preparing', color: 'blue', bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
  { key: 'ready', label: 'Ready', color: 'green', bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700' },
];

const NEXT_STATUS: Record<string, string> = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'paid',
};

export default function KitchenPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    try {
      const [pending, preparing, ready] = await Promise.all([
        backend.orders.list({ status: 'pending' }),
        backend.orders.list({ status: 'preparing' }),
        backend.orders.list({ status: 'ready' }),
      ]);
      const all = [...pending.orders, ...preparing.orders, ...ready.orders];

      // Fetch items for each order
      const withItems = await Promise.all(
        all.map(async (order) => {
          try {
            const full = await backend.orders.getOrder({ id: order.id });
            return { ...order, items: full.items };
          } catch {
            return order;
          }
        })
      );
      setOrders(withItems);
      setLastRefresh(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const advanceStatus = async (order: KitchenOrder) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    try {
      await backend.orders.updateStatus({ id: order.id, status: next });
      toast({ title: `Order ${order.order_number}`, description: `Status → ${next}` });
      fetchOrders();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
      console.error(e);
    }
  };

  const ordersByStatus = (status: string) => orders.filter(o => o.status === status);

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center">
            <ChefHat size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold">Kitchen Display System</h1>
            <p className="text-gray-400 text-xs">Auto-refresh every 10s</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-xs">Last updated: {lastRefresh.toLocaleTimeString()}</span>
          <button onClick={fetchOrders} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg text-xs hover:bg-gray-600 transition-colors">
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden p-4 grid grid-cols-3 gap-4">
        {STATUSES.map(({ key, label, bg, border, badge }) => {
          const colOrders = ordersByStatus(key);
          return (
            <div key={key} className="flex flex-col overflow-hidden">
              <div className={`flex items-center justify-between px-4 py-2.5 rounded-t-xl ${bg} border-t border-x ${border}`}>
                <h2 className="font-bold text-gray-700 text-sm">{label}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${badge}`}>{colOrders.length}</span>
              </div>
              <div className={`flex-1 overflow-y-auto bg-gray-800/50 rounded-b-xl border border-t-0 ${border} p-3 space-y-3`}>
                {colOrders.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-600">
                    <CheckCircle size={24} className="mb-1 opacity-40" />
                    <p className="text-xs">No orders</p>
                  </div>
                )}
                {colOrders.map(order => (
                  <div key={order.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <div>
                        <span className="font-bold text-gray-900 text-sm">{order.order_number}</span>
                        {order.table_number && (
                          <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-medium">
                            T{order.table_number}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock size={12} />
                        <span className="text-xs">{timeAgo(order.created_at)}</span>
                      </div>
                    </div>

                    <div className="p-3 space-y-1.5">
                      {order.items?.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{item.product_name}</span>
                          <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-full text-xs">×{item.quantity}</span>
                        </div>
                      ))}
                      {(!order.items || order.items.length === 0) && (
                        <p className="text-xs text-gray-400">Loading items...</p>
                      )}
                    </div>

                    {order.notes && (
                      <div className="px-3 pb-2">
                        <p className="text-xs text-orange-600 bg-orange-50 rounded px-2 py-1">📝 {order.notes}</p>
                      </div>
                    )}

                    {NEXT_STATUS[order.status] && (
                      <button
                        onClick={() => advanceStatus(order)}
                        className={`w-full py-2.5 text-sm font-bold transition-colors ${
                          order.status === 'pending' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                          order.status === 'preparing' ? 'bg-green-500 hover:bg-green-600 text-white' :
                          'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                      >
                        {order.status === 'pending' ? '▶ Start Preparing' :
                         order.status === 'preparing' ? '✓ Mark Ready' : '✓ Mark Served'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
