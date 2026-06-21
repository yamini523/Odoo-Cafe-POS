import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import backend from '~backend/client';
import PageHeader from '../components/PageHeader';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Category { id: number; name: string; color: string; created_at: string; }

const PRESET_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#6366f1', '#a855f7', '#ec4899'];

export default function CategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', color: '#6366f1' });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetch = () => backend.categories.list().then(r => setCats(r.categories)).catch(console.error);
  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', color: '#6366f1' }); setOpen(true); };
  const openEdit = (c: Category) => { setEditing(c); setForm({ name: c.name, color: c.color }); setOpen(true); };

  const handleSave = async () => {
    if (!form.name) { toast({ title: 'Name required', variant: 'destructive' }); return; }
    setLoading(true);
    try {
      if (editing) {
        await backend.categories.update({ id: editing.id, ...form });
        toast({ title: 'Category updated' });
      } else {
        await backend.categories.create(form);
        toast({ title: 'Category created' });
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
    if (!confirm('Delete this category? Products will become uncategorized.')) return;
    try {
      await backend.categories.deleteCategory({ id });
      toast({ title: 'Category deleted' });
      fetch();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
      console.error(e);
    }
  };

  return (
    <div className="p-6">
      <PageHeader
        title="Categories"
        subtitle={`${cats.length} categories`}
        action={<Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600 gap-2"><Plus size={16} />Add Category</Button>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {cats.map(cat => (
          <div key={cat.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 rounded-xl mb-3" style={{ backgroundColor: cat.color }} />
            <p className="font-semibold text-gray-900 mb-1">{cat.name}</p>
            <p className="text-xs text-gray-400 font-mono">{cat.color}</p>
            <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEdit(cat)} className="flex-1 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium flex items-center justify-center gap-1">
                <Pencil size={11} />Edit
              </button>
              <button onClick={() => handleDelete(cat.id)} className="flex-1 py-1 text-xs bg-red-50 text-red-500 rounded-lg hover:bg-red-100 font-medium flex items-center justify-center gap-1">
                <Trash2 size={11} />Del
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Category' : 'New Category'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Category name" className="mt-1" />
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    className="w-8 h-8 rounded-lg border-2 transition-all"
                    style={{ backgroundColor: c, borderColor: form.color === c ? '#1e1b4b' : 'transparent' }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                <Input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="font-mono text-sm" />
              </div>
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
