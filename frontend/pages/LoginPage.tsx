import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export default function LoginPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role] = useState('ADMIN');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDemoLogin = async (demoRole: string) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const demoUser = {
      name: demoRole === 'ADMIN' ? 'Admin User' : 'John Barista',
      email: demoRole === 'ADMIN' ? 'admin@cafe.com' : 'john@cafe.com',
      role: demoRole,
    };
    login('demo-token', demoUser);
    navigate('/dashboard');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e1b4b]">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-orange-400"
              style={{
                width: `${Math.random() * 200 + 50}px`,
                height: `${Math.random() * 200 + 50}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5,
              }}
            />
          ))}
        </div>
        <div className="relative text-center">
          <div className="w-28 h-28 bg-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-orange-500/30">
            <Coffee size={56} className="text-white" />
          </div>
          <h1 className="text-5xl font-black text-white mb-4">Odoo Cafe</h1>
          <p className="text-xl text-indigo-200 mb-2">Point of Sale System</p>
          <p className="text-indigo-300 max-w-sm">Manage your cafe operations seamlessly — orders, kitchen, inventory and analytics in one place.</p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Orders Tracked', value: '10K+' },
              { label: 'Revenue Managed', value: '₹5L+' },
              { label: 'Happy Customers', value: '3K+' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur rounded-xl p-4">
                <p className="text-2xl font-bold text-orange-400">{stat.value}</p>
                <p className="text-xs text-indigo-200 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                <Coffee size={22} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Welcome Back</h2>
                <p className="text-sm text-gray-500">Sign in to Odoo Cafe POS</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700 mb-4">Choose a demo account to explore:</p>

              <button
                onClick={() => handleDemoLogin('ADMIN')}
                disabled={loading}
                className="w-full flex items-center gap-4 p-4 border-2 border-orange-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all group"
              >
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">A</div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">Full access • admin@cafe.com</p>
                </div>
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full font-medium">ADMIN</span>
              </button>

              <button
                onClick={() => handleDemoLogin('EMPLOYEE')}
                disabled={loading}
                className="w-full flex items-center gap-4 p-4 border-2 border-blue-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">J</div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">John Barista</p>
                  <p className="text-xs text-gray-500">POS & Kitchen access • john@cafe.com</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">EMPLOYEE</span>
              </button>
            </div>

            {loading && (
              <div className="mt-6 flex items-center justify-center gap-2 text-gray-500">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Signing in...</span>
              </div>
            )}

            <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-xs text-amber-700 font-medium">🔐 Authentication Notice</p>
              <p className="text-xs text-amber-600 mt-1">This is a demo login. Full authentication with Clerk will be set up separately to secure all endpoints.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
