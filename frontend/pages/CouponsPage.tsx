import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Ticket, Tag, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { getAuthenticatedBackend } from '../lib/auth';
import PageHeader from '../components/PageHeader';
import type { Coupon } from '~backend/coupons/list';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '', is_active: true });
  const { toast } = useToast();

  const load = async () => {
    try {
      const api = getAuthenticatedBackend();
      const res = await api.coupons.list();
      setCoupons(res.coupons);
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '', is_active: true });
    setOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: String(c.discount_value),
      min_order_amount: String(c.min_order_amount),
      is_active: c.is_active,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.code || !form.discount_value) return;
    try {
      const api = getAuthenticatedBackend();
      const payload = {
        code: form.code.toUpperCase(),
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        min_order_amount: Number(form.min_order_amount) || 0,
        is_active: form.is_active,
      };
      if (editing) {
        await api.coupons.update({ id: editing.id, ...payload });
        toast({ title: 'Coupon updated' });
      } else {
        await api.coupons.create(payload);
        toast({ title: 'Coupon created' });
      }
      setOpen(false);
      load();
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      const api = getAuthenticatedBackend();
      await api.coupons.deleteCoupon({ id });
      toast({ title: 'Coupon deleted' });
      load();
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const filtered = coupons.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <PageHeader
        title="Coupons"
        subtitle="Manage discount coupons"
        icon={<Ticket className="w-6 h-6" />}
        action={<Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600"><Plus className="w-4 h-4 mr-2" />Add Coupon</Button>}
      />

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input className="pl-9" placeholder="Search coupons..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <Tag className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <span className="font-bold text-lg tracking-wider text-gray-800">{c.code}</span>
                  <div className="mt-1">
                    <Badge className={c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => openEdit(c)} className="hover:bg-blue-50 hover:text-blue-600">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => remove(c.id)} className="hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Discount</span>
                <span className="font-semibold text-orange-600">
                  {c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Min Order</span>
                <span className="font-medium">₹{c.min_order_amount}</span>
              </div>
              <div className="flex justify-between">
                <span>Type</span>
                <span className="capitalize font-medium">{c.discount_type}</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-400">
            <Ticket className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No coupons found</p>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Coupon' : 'Add Coupon'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Coupon Code</Label>
              <Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="e.g. SAVE20" className="uppercase font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Discount Type</Label>
                <Select value={form.discount_type} onValueChange={v => setForm(p => ({ ...p, discount_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Discount Value</Label>
                <Input type="number" value={form.discount_value} onChange={e => setForm(p => ({ ...p, discount_value: e.target.value }))} placeholder="e.g. 10" />
              </div>
            </div>
            <div>
              <Label>Minimum Order Amount (₹)</Label>
              <Input type="number" value={form.min_order_amount} onChange={e => setForm(p => ({ ...p, min_order_amount: e.target.value }))} placeholder="0" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="active" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="w-4 h-4 accent-orange-500" />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="bg-orange-500 hover:bg-orange-600">Save Coupon</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
