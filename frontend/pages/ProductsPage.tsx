import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Package, ToggleLeft, ToggleRight } from 'lucide-react';
import backend from '~backend/client';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { formatCurrency } from '../lib/format';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Product {
  id: number;
  name: string;
  category_id: number | null;
  category_name: string | null;
  category_color: string | null;
  price: number;
  tax: number;
  description: string | null;
  unit: string;
  is_available: boolean;
}

const DEFAULT_FORM = { name: '', category_id: '', price: '', tax: '5', description: '', unit: 'pcs', is_available: true };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetch = async () => {
    const [p, c] = await Promise.all([backend.products.list({}), backend.categories.list()]);
    setProducts(p.products);
    setCategories(c.categories);
  };

  useEffect(() => { fetch().catch(console.error); }, []);

  const openCreate = () => { setEditing(null); setForm(DEFAULT_FORM); setDialogOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, category_id: String(p.category_id ?? ''), price: String(p.price), tax: String(p.tax), description: p.description ?? '', unit: p.unit, is_available: p.is_available });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) { toast({ title: 'Name and price are required', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      const payload = {
        name: form.name, category_id: form.category_id ? parseInt(form.category_id) : undefined,
        price: parseFloat(form.price), tax: parseFloat(form.tax) || 0,
        description: form.description || undefined, unit: form.unit, is_available: form.is_available,
      };
      if (editing) {
        await backend.products.update({ id: editing.id, ...payload });
        toast({ title: 'Product updated' });
      } else {
        await backend.products.create(payload);
        toast({ title: 'Product created' });
      }
      setDialogOpen(false);
      fetch();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    try {
      await backend.products.deleteProduct({ id });
      toast({ title: 'Product deleted' });
      fetch();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
      console.error(e);
    }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6">
      <PageHeader
        title="Products"
        subtitle={`${products.length} products total`}
        action={<Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600 gap-2"><Plus size={16} />Add Product</Button>}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="pl-9" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Product', 'Category', 'Price', 'Tax', 'Unit', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${p.category_color ?? '#6366f1'}20` }}>☕</div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                        {p.description && <p className="text-xs text-gray-400 truncate max-w-40">{p.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {p.category_name ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${p.category_color}20`, color: p.category_color ?? '#6366f1' }}>
                        {p.category_name}
                      </span>
                    ) : <span className="text-gray-400 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3 font-bold text-orange-600">{formatCurrency(p.price)}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{p.tax}%</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{p.unit}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.is_available ? 'available' : 'cancelled'} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Name *</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="mt-1" />
            </div>
            <div>
              <Label>Category</Label>
              <select value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} className="w-full mt-1 border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">No category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Price (₹) *</Label>
                <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" className="mt-1" />
              </div>
              <div>
                <Label>Tax (%)</Label>
                <Input type="number" value={form.tax} onChange={e => setForm({ ...form, tax: e.target.value })} placeholder="5" className="mt-1" />
              </div>
            </div>
            <div>
              <Label>Unit</Label>
              <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} className="w-full mt-1 border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {['pcs', 'cup', 'glass', 'plate', 'bowl', 'slice', 'piece', 'kg', 'g'].map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <Label>Description</Label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional description" className="mt-1" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="available" checked={form.is_available} onChange={e => setForm({ ...form, is_available: e.target.checked })} className="rounded" />
              <Label htmlFor="available">Available for sale</Label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSave} disabled={loading} className="flex-1 bg-orange-500 hover:bg-orange-600">
                {loading ? 'Saving...' : editing ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
