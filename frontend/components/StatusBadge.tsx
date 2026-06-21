import React from 'react';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  pending: 'bg-yellow-100 text-yellow-700',
  preparing: 'bg-blue-100 text-blue-700',
  ready: 'bg-green-100 text-green-700',
  paid: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-600',
  available: 'bg-green-100 text-green-700',
  occupied: 'bg-orange-100 text-orange-700',
  reserved: 'bg-purple-100 text-purple-700',
  OPEN: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-600',
  ADMIN: 'bg-indigo-100 text-indigo-700',
  EMPLOYEE: 'bg-blue-100 text-blue-700',
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize', STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600')}>
      {status.toLowerCase()}
    </span>
  );
}
