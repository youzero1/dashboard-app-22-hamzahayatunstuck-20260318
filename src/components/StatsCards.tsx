'use client';

import { useState, useEffect } from 'react';
import { Users, DollarSign, Activity, UserPlus, TrendingUp, TrendingDown } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalRevenue: number;
  activeSessions: number;
  newSignups: number;
}

const cards = [
  {
    key: 'totalUsers',
    label: 'Total Users',
    icon: Users,
    color: 'blue',
    format: (v: number) => v.toLocaleString(),
    trend: '+12%',
    up: true,
  },
  {
    key: 'totalRevenue',
    label: 'Total Revenue',
    icon: DollarSign,
    color: 'green',
    format: (v: number) => `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    trend: '+8.2%',
    up: true,
  },
  {
    key: 'activeSessions',
    label: 'Active Sessions',
    icon: Activity,
    color: 'purple',
    format: (v: number) => v.toLocaleString(),
    trend: '-3.1%',
    up: false,
  },
  {
    key: 'newSignups',
    label: 'New Signups',
    icon: UserPlus,
    color: 'orange',
    format: (v: number) => v.toLocaleString(),
    trend: '+24%',
    up: true,
  },
];

const colorMap: Record<string, { bg: string; icon: string; light: string }> = {
  blue: { bg: 'bg-blue-500', icon: 'text-blue-600', light: 'bg-blue-100 dark:bg-blue-900/30' },
  green: { bg: 'bg-emerald-500', icon: 'text-emerald-600', light: 'bg-emerald-100 dark:bg-emerald-900/30' },
  purple: { bg: 'bg-purple-500', icon: 'text-purple-600', light: 'bg-purple-100 dark:bg-purple-900/30' },
  orange: { bg: 'bg-orange-500', icon: 'text-orange-600', light: 'bg-orange-100 dark:bg-orange-900/30' },
};

export default function StatsCards() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const colors = colorMap[card.color];
        const value = stats ? (stats as unknown as Record<string, number>)[card.key] : 0;

        return (
          <div
            key={card.key}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${colors.light}`}>
                <Icon className={`w-6 h-6 ${colors.icon}`} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                card.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
              }`}>
                {card.up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {card.trend}
              </div>
            </div>
            {loading ? (
              <div className="space-y-2">
                <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-24" />
                <div className="h-4 bg-gray-100 dark:bg-slate-700/50 rounded animate-pulse w-20" />
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {card.format(value)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
