import { useState, useEffect } from 'react';
import {
  TrendingUp, ShoppingCart, Truck, Receipt,
  ArrowRight, Activity, FileText, Package,
  ArrowUpRight, ArrowDownRight, BarChart2, Zap
} from 'lucide-react';
import * as api from '../../services/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.getDashboard();
      setData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const summary = data?.summary || {};

  const salesData = (() => {
    const trends = data?.trends?.sales || [];
    const type = data?.trends?.type;
    if (trends.length === 0)
      return Array.from({ length: 7 }, (_, i) => ({ name: MON[i], value: 20000 + Math.random() * 70000 }));
    if (type === 'monthly')
      return trends.map(i => ({ name: MON[i._id.month - 1], value: i.total }));
    // daily — format "2025-04-11" → "Apr 11"
    return trends.map(i => ({
      name: new Date(i.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      value: i.total
    }));
  })();

  const expenseData = (() => {
    const trends = data?.trends?.expenses || [];
    const type = data?.trends?.type;
    if (trends.length === 0)
      return Array.from({ length: 7 }, (_, i) => ({ name: MON[i], value: 8000 + Math.random() * 35000 }));
    if (type === 'monthly')
      return trends.map(i => ({ name: MON[i._id.month - 1], value: i.total }));
    return trends.map(i => ({
      name: new Date(i.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      value: i.total
    }));
  })();

  const maxS = Math.max(...salesData.map(d => d.value), 1);
  const maxE = Math.max(...expenseData.map(d => d.value), 1);

  const stats = [
    {
      title: 'Total Sales', val: summary.totalSales, pct: '+12.4%', up: true,
      color: '#4F8EF7', dark: '#2563EB', bg: '#EEF4FF', Icon: ShoppingCart
    },
    {
      title: "Today's Sales", val: summary.todaysSales, pct: '+8.1%', up: true,
      color: '#34D399', dark: '#059669', bg: '#D1FAE5', Icon: TrendingUp
    },
    {
      title: 'Purchases', val: summary.totalPurchases, pct: '+3.2%', up: true,
      color: '#A78BFA', dark: '#7C3AED', bg: '#EDE9FE', Icon: Truck
    },
    {
      title: 'Expenses', val: summary.totalExpenses, pct: '-2.5%', up: false,
      color: '#F87171', dark: '#DC2626', bg: '#FEE2E2', Icon: Receipt
    },
  ];

  const quickActions = [
    { label: 'New Sale', Icon: ShoppingCart, href: '/sales?action=new', color: '#4F8EF7', bg: '#EEF4FF' },
    { label: 'Add Purchase', Icon: Package, href: '/purchases?action=new', color: '#FBBF24', bg: '#FEF3C7' },
    { label: 'Add Expense', Icon: Receipt, href: '/expenses?action=new', color: '#A78BFA', bg: '#EDE9FE' },
    { label: 'Reports', Icon: BarChart2, href: '/reports', color: '#34D399', bg: '#D1FAE5' },
  ];

  const trends = [
    { name: 'Sales Revenue', amt: summary.totalSales, pct: '+12.4%', up: true, color: '#4F8EF7', spark: [40, 55, 45, 70, 60, 82, 75] },
    { name: "Today's Rev", amt: summary.todaysSales, pct: '+8.1%', up: true, color: '#34D399', spark: [30, 42, 38, 55, 50, 65, 60] },
    { name: 'Purchases', amt: summary.totalPurchases, pct: '+3.2%', up: true, color: '#A78BFA', spark: [50, 45, 62, 55, 70, 65, 72] },
    { name: 'Expenses', amt: summary.totalExpenses, pct: '-2.5%', up: false, color: '#F87171', spark: [60, 55, 65, 50, 58, 45, 48] },
  ];

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <div className="clay-spinner" />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* ─── Header ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.75rem' }}>
        <div>
          <h1 className="clay-page-title" style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            Dashboard <BarChart2 size={24} color="#4F8EF7" />
          </h1>
          <p className="clay-page-subtitle">Here's what's happening today</p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '.4rem',
          background: 'rgba(255,255,255,0.85)',
          borderRadius: 999,
          padding: '.4rem .9rem',
          boxShadow: '0 4px 0 rgba(0,0,0,0.07), 0 8px 16px rgba(0,0,0,0.04)',
          fontSize: '.78rem', fontWeight: 700, color: '#34D399'
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#34D399', animation: 'pulse 2s infinite', display: 'block' }} />
          Live
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}
        className="lg:grid-cols-4">
        {stats.map((s, i) => (
          <div key={i} className="clay-stat-card" style={{ animationDelay: `${i * 0.08}s` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: s.bg, color: s.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 0 ${s.dark}22, 0 8px 16px ${s.color}15`,
              }}>
                <s.Icon size={22} />
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 2,
                padding: '.25rem .6rem', borderRadius: 999,
                fontSize: '.7rem', fontWeight: 800,
                background: s.up ? '#D1FAE5' : '#FEE2E2',
                color: s.up ? '#059669' : '#DC2626',
                boxShadow: `0 3px 0 ${s.up ? 'rgba(5,150,105,0.15)' : 'rgba(220,38,38,0.15)'}`,
              }}>
                {s.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                {s.pct}
              </span>
            </div>
            <div>
              <div className="clay-stat-label">{s.title}</div>
              <div className="clay-stat-value" style={{ color: s.color }}>{fmt(s.val)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Sales Chart + Quick Actions ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}
        className="md:grid-cols-3 lg:grid-cols-3">

        {/* Sales Chart */}
        <div className="clay-card md:col-span-2">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
            <div className="clay-section-title">
              <span style={{ width: 30, height: 30, borderRadius: 10, background: '#EEF4FF', color: '#4F8EF7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={16} />
              </span>
              Sales Trend
            </div>
            <a href="/sales" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.78rem', fontWeight: 700, color: '#4F8EF7', textDecoration: 'none' }}>
              View All <ArrowRight size={13} />
            </a>
          </div>
          <div className="clay-bars" style={{ height: 150 }}>
            {salesData.map((d, i) => (
              <div key={i} className="clay-bar-col">
                <div className="clay-bar" style={{
                  height: `${Math.max((d.value / maxS) * 100, 4)}%`,
                  background: 'linear-gradient(180deg,#93C5FD,#4F8EF7)',
                }} />
                <span className="clay-bar-label">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="clay-card">
          <div className="clay-section-title" style={{ marginBottom: '1rem' }}>
            <span style={{ width: 30, height: 30, borderRadius: 10, background: '#FEF3C7', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} />
            </span>
            Quick Actions
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
            {quickActions.map((a, i) => (
              <a key={i} href={a.href} className="clay-quick-btn">
                <div className="clay-quick-btn-icon" style={{ background: a.bg, color: a.color }}>
                  <a.Icon size={20} />
                </div>
                <span className="clay-quick-btn-label">{a.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Trend Indicators + Expense Chart ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}
        className="md:grid-cols-2">

        {/* Trend indicators */}
        <div className="clay-card">
          <div className="clay-section-title" style={{ marginBottom: '.9rem' }}>
            <span style={{ width: 30, height: 30, borderRadius: 10, background: '#EDE9FE', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={16} />
            </span>
            Trend Indicators
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
            {trends.map((t, i) => (
              <div key={i} className="clay-trend-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: t.color, flexShrink: 0, boxShadow: `0 3px 0 ${t.color}55` }} />
                  <span style={{ fontSize: '.82rem', fontWeight: 700, color: '#475569' }}>{t.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.6rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', height: 24, gap: 2 }}>
                    {t.spark.map((v, j) => (
                      <div key={j} style={{
                        width: 4, borderRadius: '2px 2px 0 0',
                        background: t.color,
                        height: `${(v / Math.max(...t.spark)) * 100}%`,
                        opacity: .75, minHeight: 3,
                      }} />
                    ))}
                  </div>
                  <span style={{ fontWeight: 900, fontSize: '.85rem', color: '#1E293B' }}>{fmt(t.amt)}</span>
                  <span style={{
                    fontSize: '.68rem', fontWeight: 800,
                    padding: '.2rem .45rem', borderRadius: 999,
                    background: t.up ? '#D1FAE5' : '#FEE2E2',
                    color: t.up ? '#059669' : '#DC2626',
                    boxShadow: `0 2px 0 ${t.up ? 'rgba(5,150,105,0.15)' : 'rgba(220,38,38,0.15)'}`,
                  }}>{t.pct}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Chart */}
        <div className="clay-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.1rem' }}>
            <div className="clay-section-title">
              <span style={{ width: 30, height: 30, borderRadius: 10, background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Receipt size={16} />
              </span>
              Expense Trend
            </div>
            <a href="/expenses" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '.78rem', fontWeight: 700, color: '#4F8EF7', textDecoration: 'none' }}>
              View All <ArrowRight size={13} />
            </a>
          </div>
          <div className="clay-bars" style={{ height: 150 }}>
            {expenseData.map((d, i) => (
              <div key={i} className="clay-bar-col">
                <div className="clay-bar" style={{
                  height: `${Math.max((d.value / maxE) * 100, 4)}%`,
                  background: 'linear-gradient(180deg,#FCD34D,#F87171)',
                }} />
                <span className="clay-bar-label">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}