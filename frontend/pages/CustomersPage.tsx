import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, UserCircle } from 'lucide-react';
import { getAuthenticatedBackend } from '../lib/auth';
import PageHeader from '../components/PageHeader';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Customer {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
}

const DEFAULT_FORM = { name: '', email: '', phone: '' };

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const load = () => {
    getAuthenticatedBackend().customers.list()
      .then(r => setCustomers(r.customers))
      .catch(console.error);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(DEFAULT_FORM); setOpen(true); };
  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email ?? '', phone: c.phone ?? '' });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast({ title: 'Name required', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      const api = getAuthenticatedBackend();
      const payload = { name: form.name, email: form.email || undefined, phone: form.phone || undefined };
      if (editing) {
        await api.customers.update({ id: editing.id, ...payload });
        toast({ title: 'Customer updated' });
      } else {
        await api.customers.create(payload);
        toast({ title: 'Customer created' });
      }
      setOpen(false);
      load();
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this customer?')) return;
    try {
      await getAuthenticatedBackend().customers.deleteCustomer({ id });
      toast({ title: 'Customer deleted' });
      load();
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? '').includes(search)
  );

  return (
    <div className="p-6">
      <PageHeader
        title="Customers"
        subtitle={`${customers.length} customers registered`}
        icon={<UserCircle className="w-6 h-6" />}
        action={
          <Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600 gap-2">
            <Plus size={16} />Add Customer
          </Button>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="pl-9"
            />
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Customer', 'Email', 'Phone', 'Joined', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center font-bold text-purple-600 text-sm">
                      {c.name[0].toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{c.email ?? '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{c.phone ?? '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(c.created_at).toLocaleDateString('en-IN')}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">
                  <UserCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Customer name" className="mt-1" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" className="mt-1" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 9876543210" className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading} className="bg-orange-500 hover:bg-orange-600">
              {loading ? 'Saving...' : editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
