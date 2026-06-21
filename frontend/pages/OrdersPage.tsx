import React, { useState, useEffect } from 'react';
import { Search, Eye, Trash2, Filter } from 'lucide-react';
import backend from '~backend/client';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency, formatDateTime } from '../lib/format';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Order {
  id: number;
  order_number: string;
  table_number: string | null;
  customer_name: string | null;
  employee_name: string | null;
  status: string;
  subtotal: number;
  tax_total: number;
  discount: number;
  total: number;
  payment_method: string | null;
  created_at: string;
  items?: any[];
}

const STATUS_FILTERS = ['all', 'draft', 'pending', 'preparing', 'ready', 'paid', 'cancelled'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const { toast } = useToast();

  const fetch = async () => {
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const res = await backend.orders.list(params);
      setOrders(res.orders);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetch(); }, [statusFilter]);

  const handleView = async (order: Order) => {
    try {
      const full = await backend.orders.getOrder({ id: order.id });
      setViewOrder(full as any);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this order?')) return;
    try {
      await backend.orders.deleteOrder({ id });
      toast({ title: 'Order deleted' });
      fetch();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
      console.error(e);
    }
  };

  const filtered = orders.filter(o =>
    o.order_number.toLowerCase().includes(search.toLowerCase()) ||
    (o.customer_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (o.table_number ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <PageHeader title="Orders" subtitle={`${filtered.length} orders`} />

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." className="pl-9" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${statusFilter === s ? 'bg-orange-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-300'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Order #', 'Table', 'Customer', 'Items', 'Subtotal', 'Total', 'Payment', 'Status', 'Time', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(o => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-indigo-600 text-sm">{o.order_number}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{o.table_number ? `T${o.table_number}` : '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{o.customer_name ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">—</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(o.subtotal)}</td>
                  <td className="px-4 py-3 font-bold text-orange-600">{formatCurrency(o.total)}</td>
                  <td className="px-4 py-3">
                    {o.payment_method ? (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium capitalize">{o.payment_method}</span>
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{formatDateTime(o.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleView(o)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Eye size={14} /></button>
                      <button onClick={() => handleDelete(o.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-400">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Dialog */}
      {viewOrder && (
        <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Order {viewOrder.order_number}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400">Table</p>
                  <p className="font-medium">{viewOrder.table_number ? `Table ${viewOrder.table_number}` : 'Takeaway'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Status</p>
                  <StatusBadge status={viewOrder.status} />
                </div>
                <div>
                  <p className="text-gray-400">Payment</p>
                  <p className="font-medium capitalize">{viewOrder.payment_method ?? '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Time</p>
                  <p className="font-medium">{formatDateTime(viewOrder.created_at)}</p>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">Item</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-500">Qty</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-500">Price</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-500">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {viewOrder.items?.map((item: any) => (
                      <tr key={item.id}>
                        <td className="px-3 py-2">{item.product_name}</td>
                        <td className="px-3 py-2 text-right">{item.quantity}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.unit_price)}</td>
                        <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="space-y-1 text-sm border-t pt-3">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(viewOrder.subtotal)}</span></div>
                <div className="flex justify-between text-gray-500"><span>Tax</span><span>{formatCurrency(viewOrder.tax_total)}</span></div>
                {viewOrder.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatCurrency(viewOrder.discount)}</span></div>}
                <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-orange-600">{formatCurrency(viewOrder.total)}</span></div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
