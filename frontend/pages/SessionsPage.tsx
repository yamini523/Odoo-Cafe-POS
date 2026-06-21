import React, { useState, useEffect } from 'react';
import { Clock, Play, Square, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { getAuthenticatedBackend } from '../lib/auth';
import { useAuth } from '../contexts/AuthContext';
import PageHeader from '../components/PageHeader';
import type { PosSession } from '~backend/sessions/list';

function formatCurrency(v: number) { return `₹${v.toFixed(2)}`; }
function formatDate(s: string) {
  return new Date(s).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<PosSession[]>([]);
  const [activeSession, setActiveSession] = useState<PosSession | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const load = async () => {
    try {
      const api = getAuthenticatedBackend();
      const [listRes, activeRes] = await Promise.all([
        api.sessions.list(),
        api.sessions.getActive().catch(() => ({ session: null })),
      ]);
      setSessions(listRes.sessions);
      setActiveSession(activeRes.session);
    } catch (e: any) {
      console.error(e);
    }
  };

  useEffect(() => { load(); }, []);

  const openSession = async () => {
    setLoading(true);
    try {
      const api = getAuthenticatedBackend();
      await api.sessions.create({});
      toast({ title: 'POS Session Opened', description: 'Your shift has started.' });
      load();
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const closeSession = async () => {
    if (!activeSession) return;
    if (!confirm('Are you sure you want to close this session?')) return;
    setLoading(true);
    try {
      const api = getAuthenticatedBackend();
      await api.sessions.close({ id: activeSession.id });
      toast({ title: 'Session Closed', description: 'Your shift summary has been saved.' });
      load();
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally { setLoading(false); }
  };

  return (
    <div className="p-6">
      <PageHeader
        title="POS Sessions"
        subtitle="Manage cashier shifts"
        icon={<Clock className="w-6 h-6" />}
      />

      {activeSession ? (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-green-100 text-sm font-medium">LIVE SESSION</span>
              </div>
              <h3 className="text-2xl font-bold">Session #{activeSession.id}</h3>
              <p className="text-green-100 mt-1">Started {formatDate(activeSession.opened_at)}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{formatCurrency(activeSession.total_revenue)}</div>
              <div className="text-green-100">{activeSession.total_orders} orders</div>
              <Button onClick={closeSession} disabled={loading} className="mt-3 bg-white text-green-700 hover:bg-green-50">
                <Square className="w-4 h-4 mr-2" />Close Session
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-green-400">
            <div className="text-center">
              <div className="text-xl font-bold">{formatCurrency(activeSession.cash_total)}</div>
              <div className="text-green-100 text-xs">Cash</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{formatCurrency(activeSession.upi_total)}</div>
              <div className="text-green-100 text-xs">UPI</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">{formatCurrency(activeSession.card_total)}</div>
              <div className="text-green-100 text-xs">Card</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-dashed border-orange-200 p-10 text-center mb-6">
          <Clock className="w-14 h-14 text-orange-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Active Session</h3>
          <p className="text-gray-500 mb-5">Open a session to start taking orders</p>
          <Button onClick={openSession} disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white px-8">
            <Play className="w-4 h-4 mr-2" />Open POS Session
          </Button>
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-800 mb-3">Session History</h3>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-semibold">Session</th>
              <th className="text-left px-4 py-3 text-gray-600 font-semibold">Employee</th>
              <th className="text-left px-4 py-3 text-gray-600 font-semibold">Opened</th>
              <th className="text-left px-4 py-3 text-gray-600 font-semibold">Closed</th>
              <th className="text-right px-4 py-3 text-gray-600 font-semibold">Orders</th>
              <th className="text-right px-4 py-3 text-gray-600 font-semibold">Revenue</th>
              <th className="text-center px-4 py-3 text-gray-600 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono font-semibold text-gray-700">#{s.id}</td>
                <td className="px-4 py-3 text-gray-700">{s.employee_name || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{formatDate(s.opened_at)}</td>
                <td className="px-4 py-3 text-gray-600">{s.closed_at ? formatDate(s.closed_at) : '—'}</td>
                <td className="px-4 py-3 text-right font-medium">{s.total_orders}</td>
                <td className="px-4 py-3 text-right font-semibold text-green-600">{formatCurrency(s.total_revenue)}</td>
                <td className="px-4 py-3 text-center">
                  <Badge className={s.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                    {s.status}
                  </Badge>
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-gray-400">No sessions yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
