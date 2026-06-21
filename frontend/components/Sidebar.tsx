import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Monitor, ChefHat, ShoppingBag, Package,
  Tag, Grid3x3, Users, UserCircle, Ticket, Clock,
  BarChart3, Settings, LogOut, Coffee,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '@/lib/utils';

const adminLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pos', icon: Monitor, label: 'POS Terminal' },
  { to: '/kitchen', icon: ChefHat, label: 'Kitchen Display' },
  { to: '/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/categories', icon: Tag, label: 'Categories' },
  { to: '/tables', icon: Grid3x3, label: 'Tables' },
  { to: '/employees', icon: Users, label: 'Employees' },
  { to: '/customers', icon: UserCircle, label: 'Customers' },
  { to: '/coupons', icon: Ticket, label: 'Coupons' },
  { to: '/sessions', icon: Clock, label: 'Sessions' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const employeeLinks = [
  { to: '/pos', icon: Monitor, label: 'POS Terminal' },
  { to: '/kitchen', icon: ChefHat, label: 'Kitchen Display' },
  { to: '/orders', icon: ShoppingBag, label: 'Orders' },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const links = isAdmin ? adminLinks : employeeLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-56 bg-[#1e1b4b] flex flex-col z-40">
      {/* Brand */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-indigo-800">
        <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center">
          <Coffee size={20} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">Odoo Cafe</p>
          <p className="text-indigo-300 text-xs">POS System</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-indigo-800 p-3">
        <div className="flex items-center gap-2 px-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.name ?? 'User'}</p>
            <p className="text-indigo-300 text-xs truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-indigo-300 hover:text-white hover:bg-indigo-800 rounded-lg text-sm transition-all"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}
