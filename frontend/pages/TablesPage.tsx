import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Grid3x3 } from 'lucide-react';
import backend from '~backend/client';
import PageHeader from '../components/PageHeader';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Table { id: number; table_number: string; floor_id: number | null; floor_name: string | null; seats: number; status: string; }
interface Floor { id: number; name: string; }

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Table | null>(null);
  const [form, setForm] = useState({ table_number: '', floor_id: '', seats: '4', status: 'available' });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetch = () => backend.tables.list().then(r => { setTables(r.tables); setFloors(r.floors); }).catch(console.error);
  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm({ table_number: '', floor_id: '', seats: '4', status: 'available' }); setOpen(true); };
  const openEdit = (t: Table) => {
    setEditing(t);
    setForm({ table_number: t.table_number, floor_id: String(t.floor_id ?? ''), seats: String(t.seats), status: t.status });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!form.table_number) { toast({ title: 'Table number required', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      const payload = { table_number: form.table_number, floor_id: form.floor_id ? parseInt(form.floor_id) : undefined, seats: parseInt(form.seats) || 4, status: form.status };
      if (editing) {
        await backend.tables.update({ id: editing.id, ...payload });
        toast({ title: 'Table updated' });
      } else {
        await backend.tables.create(payload);
        toast({ title: 'Table created' });
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
    if (!confirm('Delete this table?')) return;
    try {
      await backend.tables.deleteTable({ id });
      toast({ title: 'Table deleted' });
      fetch();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
      console.error(e);
    }
  };

  const filteredTables = selectedFloor ? tables.filter(t => t.floor_id === selectedFloor) : tables;

  const statusColor: Record<string, string> = {
    available: 'border-green-300 bg-green-50',
    occupied: 'border-orange-300 bg-orange-50',
    reserved: 'border-purple-300 bg-purple-50',
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Tables"
        subtitle={`${tables.length} tables across ${floors.length} floors`}
        action={<Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600 gap-2"><Plus size={16} />Add Table</Button>}
      />

      {/* Floor tabs */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => setSelectedFloor(null)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedFloor === null ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'}`}
        >
          All Floors
        </button>
        {floors.map(f => (
          <button key={f.id} onClick={() => setSelectedFloor(f.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${selectedFloor === f.id ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'}`}
          >
            {f.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {filteredTables.map(t => (
          <div key={t.id} className={`relative bg-white rounded-xl p-4 border-2 shadow-sm hover:shadow-md transition-all group ${statusColor[t.status] ?? 'border-gray-200 bg-gray-50'}`}>
            <div className="text-center mb-3">
              <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Grid3x3 size={24} className="text-indigo-600" />
              </div>
              <p className="font-bold text-gray-900">Table {t.table_number}</p>
              <p className="text-xs text-gray-500">{t.floor_name ?? 'No floor'}</p>
              <p className="text-xs text-gray-400">{t.seats} seats</p>
            </div>
            <StatusBadge status={t.status} />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
              <button onClick={() => openEdit(t)} className="p-1 bg-white rounded-lg shadow-sm text-indigo-500 hover:bg-indigo-50"><Pencil size={12} /></button>
              <button onClick={() => handleDelete(t.id)} className="p-1 bg-white rounded-lg shadow-sm text-red-400 hover:bg-red-50"><Trash2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Table' : 'Add Table'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Table Number</Label>
              <Input value={form.table_number} onChange={e => setForm({ ...form, table_number: e.target.value })} placeholder="e.g. T9" className="mt-1" />
            </div>
            <div>
              <Label>Floor</Label>
              <select value={form.floor_id} onChange={e => setForm({ ...form, floor_id: e.target.value })} className="w-full mt-1 border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">No floor</option>
                {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Seats</Label>
              <Input type="number" value={form.seats} onChange={e => setForm({ ...form, seats: e.target.value })} placeholder="4" className="mt-1" />
            </div>
            <div>
              <Label>Status</Label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full mt-1 border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>
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
