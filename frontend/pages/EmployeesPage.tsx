import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, User } from 'lucide-react';
import backend from '~backend/client';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { formatDate } from '../lib/format';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Employee { id: number; name: string; email: string; role: string; is_active: boolean; created_at: string; }

const DEFAULT_FORM = { name: '', email: '', role: 'EMPLOYEE', is_active: true };

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetch = () => backend.employees.list().then(r => setEmployees(r.employees)).catch(console.error);
  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm(DEFAULT_FORM); setOpen(true); };
  const openEdit = (e: Employee) => { setEditing(e); setForm({ name: e.name, email: e.email, role: e.role, is_active: e.is_active }); setOpen(true); };

  const handleSave = async () => {
    if (!form.name || !form.email) { toast({ title: 'Name and email required', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      if (editing) {
        await backend.employees.update({ id: editing.id, ...form });
        toast({ title: 'Employee updated' });
      } else {
        await backend.employees.create({ name: form.name, email: form.email, role: form.role });
        toast({ title: 'Employee created' });
      }
      setOpen(false);
      fetch();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this employee?')) return;
    try {
      await backend.employees.deleteEmployee({ id });
      toast({ title: 'Employee deleted' });
      fetch();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
      console.error(e);
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Employees"
        subtitle={`${employees.filter(e => e.is_active).length} active staff`}
        action={<Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600 gap-2"><Plus size={16} />Add Employee</Button>}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Employee', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {employees.map(emp => (
              <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm">
                      {emp.name[0].toUpperCase()}
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{emp.name}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{emp.email}</td>
                <td className="px-4 py-3"><StatusBadge status={emp.role} /></td>
                <td className="px-4 py-3"><StatusBadge status={emp.is_active ? 'available' : 'cancelled'} /></td>
                <td className="px-4 py-3 text-sm text-gray-500">{formatDate(emp.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(emp)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(emp.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Employee' : 'Add Employee'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Full Name</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" className="mt-1" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@cafe.com" className="mt-1" disabled={!!editing} />
            </div>
            <div>
              <Label>Role</Label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full mt-1 border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="ADMIN">Admin</option>
                <option value="EMPLOYEE">Employee</option>
              </select>
            </div>
            {editing && (
              <div className="flex items-center gap-2">
                <input type="checkbox" id="active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                <Label htmlFor="active">Active</Label>
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
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
