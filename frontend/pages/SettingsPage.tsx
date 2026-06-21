import React, { useState, useEffect } from 'react';
import { Settings, CreditCard, Banknote, Smartphone, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { getAuthenticatedBackend } from '../lib/auth';
import PageHeader from '../components/PageHeader';
import type { PaymentMethod } from '~backend/paymentmethods/list';

const methodIcons: Record<string, React.ReactNode> = {
  cash: <Banknote className="w-6 h-6" />,
  card: <CreditCard className="w-6 h-6" />,
  upi: <Smartphone className="w-6 h-6" />,
};

const methodColors: Record<string, string> = {
  cash: 'bg-green-50 text-green-600 border-green-200',
  card: 'bg-blue-50 text-blue-600 border-blue-200',
  upi: 'bg-purple-50 text-purple-600 border-purple-200',
};

export default function SettingsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [upiId, setUpiId] = useState('');
  const { toast } = useToast();

  const load = async () => {
    try {
      const api = getAuthenticatedBackend();
      const res = await api.paymentmethods.list();
      setMethods(res.payment_methods);
      const upi = res.payment_methods.find(m => m.type === 'upi');
      if (upi?.upi_id) setUpiId(upi.upi_id);
    } catch (e: any) {
      console.error(e);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleMethod = async (method: PaymentMethod) => {
    try {
      const api = getAuthenticatedBackend();
      await api.paymentmethods.update({
        id: method.id,
        is_enabled: !method.is_enabled,
        upi_id: method.type === 'upi' ? upiId : method.upi_id ?? undefined,
      });
      toast({ title: `${method.name} ${!method.is_enabled ? 'enabled' : 'disabled'}` });
      load();
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const saveUpiId = async () => {
    const upi = methods.find(m => m.type === 'upi');
    if (!upi) return;
    try {
      const api = getAuthenticatedBackend();
      await api.paymentmethods.update({ id: upi.id, is_enabled: upi.is_enabled, upi_id: upiId });
      toast({ title: 'UPI ID saved' });
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <div className="p-6 max-w-3xl">
      <PageHeader
        title="Settings"
        subtitle="Configure restaurant preferences"
        icon={<Settings className="w-6 h-6" />}
      />

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Payment Methods</h3>
            <p className="text-sm text-gray-500">Enable or disable payment options for your POS</p>
          </div>
          <div className="p-6 space-y-4">
            {methods.map(method => (
              <div key={method.id} className={`flex items-center justify-between p-4 rounded-xl border-2 ${method.is_enabled ? methodColors[method.type] || 'bg-gray-50 text-gray-600 border-gray-200' : 'bg-gray-50 text-gray-400 border-gray-100'} transition-all`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${method.is_enabled ? '' : 'opacity-40'}`}>
                    {methodIcons[method.type] || <CreditCard className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="font-semibold text-base">{method.name}</div>
                    <div className="text-xs opacity-70 capitalize">{method.type} payment</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={method.is_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}>
                    {method.is_enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <Switch
                    checked={method.is_enabled}
                    onCheckedChange={() => toggleMethod(method)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">UPI Configuration</h3>
            <p className="text-sm text-gray-500">Set your UPI ID for QR code generation</p>
          </div>
          <div className="p-6">
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="upi-id">UPI ID</Label>
                <Input
                  id="upi-id"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="yourstore@ybl"
                  className="mt-1"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={saveUpiId} className="bg-orange-500 hover:bg-orange-600">
                  <Save className="w-4 h-4 mr-2" />Save
                </Button>
              </div>
            </div>
            {upiId && (
              <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-100 text-sm text-purple-700">
                <Smartphone className="inline w-4 h-4 mr-1" />
                UPI QR will be generated for: <strong>{upiId}</strong>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Restaurant Info</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <div>
              <Label>Restaurant Name</Label>
              <Input defaultValue="Odoo Cafe" className="mt-1" />
            </div>
            <div>
              <Label>Phone</Label>
              <Input defaultValue="+91 98765 43210" className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label>Address</Label>
              <Input defaultValue="123 Cafe Street, Bengaluru, Karnataka" className="mt-1" />
            </div>
            <div>
              <Label>GST Number</Label>
              <Input defaultValue="29ABCDE1234F1Z5" className="mt-1" />
            </div>
            <div>
              <Label>Currency</Label>
              <Input defaultValue="INR (₹)" className="mt-1" readOnly />
            </div>
          </div>
          <div className="px-6 pb-5">
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Save className="w-4 h-4 mr-2" />Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
