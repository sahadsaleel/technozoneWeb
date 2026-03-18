import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { Download, ShoppingCart, Calculator, Receipt, PartyPopper, AlertTriangle, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import * as api from '../../services/api';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n || 0);

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');
  const { showToast } = useApp();

  useEffect(() => { fetchReports(); }, [period]);

  const fetchReports = async () => {
    try { 
      setLoading(true);
      const res = await api.getDashboard({ period }); 
      setData(res.data); 
    }
    catch (err) { showToast('Failed to load reports', 'error'); }
    finally { setLoading(false); }
  };

  const handleExportCSV = async () => {
    try {
      showToast('Preparing CSV...', 'info');
      
      // Fetch data for the current period from the respective modules
      // This ensures we get the detailed records for the period selected
      const [salesRes, purchasesRes, expensesRes] = await Promise.all([
        api.getSales({ period }),
        api.getPurchases({ period }),
        api.getExpenses({ period })
      ]);

      const sales = salesRes.data || [];
      const purchases = purchasesRes.data || [];
      const expenses = expensesRes.data || [];

      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Type,Date,Product/Category,Amount,Payment,Status\n";

      sales.forEach(s => {
        const prod = s.items?.[0]?.name || 'Sale';
        csvContent += `Sale,${new Date(s.date).toLocaleDateString()},"${prod}",${s.totalAmount},${s.paymentMethod},${s.status}\n`;
      });

      purchases.forEach(p => {
        const prod = p.items?.[0]?.name || 'Purchase';
        csvContent += `Purchase,${new Date(p.date).toLocaleDateString()},"${prod}",${p.totalCost},${p.paymentMethod},${p.status}\n`;
      });

      expenses.forEach(e => {
        csvContent += `Expense,${new Date(e.date).toLocaleDateString()},"${e.category} - ${e.description || ''}",${e.amount},${e.paymentMethod},Completed\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Report_${period}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast('CSV Downloaded!', 'success');
    } catch (err) {
      showToast('Failed to export CSV', 'error');
    }
  };

  if (loading && !data) return (
    <div style={{ display:'flex', justifyContent:'center', padding:'4rem' }}>
      <div className="clay-spinner" />
    </div>
  );

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  
  const formatTrendData = (trend) => {
    if (!trend) return [];
    return trend.map(i => {
      let label = '';
      if (data.trends.type === 'monthly') {
        label = monthNames[i._id.month - 1];
      } else {
        // Daily: i.name is YYYY-MM-DD
        const d = new Date(i.name);
        label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      }
      return { name: label, total: i.total };
    });
  };

  const salesData = formatTrendData(data?.trends?.sales);
  const expensesData = formatTrendData(data?.trends?.expenses);

  const s = data?.summary || {};
  const netProfit = (s.totalSales || 0) - (s.totalExpenses || 0) - (s.totalPurchases || 0);

  const summaryCards = [
    { label:'Total Sales',       val: fmt(s.totalSales),    Icon: ShoppingCart, color:'#4F8EF7', bg:'#EEF4FF', dark:'#2563EB' },
    { label:'Total Transactions',val: s.salesCount || 0,    Icon: Calculator,   color:'#A78BFA', bg:'#EDE9FE', dark:'#7C3AED' },
    { label:'Total Expenses',    val: fmt(s.totalExpenses), Icon: Receipt,      color:'#F87171', bg:'#FEE2E2', dark:'#DC2626' },
    { label:'Net Profit',        val: fmt(netProfit),       Icon: netProfit >= 0 ? PartyPopper : AlertTriangle,
      color: netProfit >= 0 ? '#34D399' : '#F87171',
      bg:    netProfit >= 0 ? '#D1FAE5' : '#FEE2E2',
      dark:  netProfit >= 0 ? '#059669' : '#DC2626' },
  ];

  const customTooltipStyle = {
    backgroundColor:'#fff', border:'none', borderRadius:14,
    boxShadow:'0 6px 0 rgba(0,0,0,0.09), 0 16px 32px rgba(0,0,0,0.08)',
    fontFamily:'Nunito,sans-serif', fontWeight:700, color:'#1E293B',
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'.75rem' }}>
        <div>
          <h1 className="clay-page-title" style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
            Reports <BarChart2 size={24} color="#A78BFA" />
          </h1>
          <p className="clay-page-subtitle">Financial overview & analytics</p>
        </div>
        <div style={{ display:'flex', gap:'.5rem' }}>
          <button className="clay-btn clay-btn-ghost" onClick={handleExportCSV}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Period Filter */}
      <div className="clay-card" style={{ padding: '0.6rem 0.8rem', display: 'flex', gap: '0.4rem', justifyContent: 'center', background: 'rgba(255,255,255,0.6)' }}>
        {['weekly', 'monthly', 'yearly'].map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`clay-btn ${period === p ? 'clay-btn-blue' : 'clay-btn-ghost'}`}
            style={{ 
              padding: '0.4rem 1.2rem', 
              fontSize: '0.85rem', 
              textTransform: 'capitalize',
              boxShadow: period === p ? undefined : 'none'
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {loading && !data ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}>
           <div className="clay-spinner" />
        </div>
      ) : (
        <>
          {/* Summary Cards  */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }} className="lg:grid-cols-4">
            {summaryCards.map((c, i) => (
              <div key={i} className="clay-stat-card" style={{ animationDelay:`${i*0.07}s` }}>
                <div style={{
                  width:48, height:48, borderRadius:14,
                  background: c.bg, color: c.color,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  boxShadow:`0 4px 0 ${c.dark}22`,
                }}>
                  <c.Icon size={24} />
                </div>
                <div>
                  <div className="clay-stat-label">{c.label}</div>
                  <div className="clay-stat-value" style={{ color: c.color, fontSize:'1.3rem' }}>{c.val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'1rem' }} className="md:grid-cols-2">
            {/* Sales Bar Chart */}
            <div className="clay-card">
              <div className="clay-section-title" style={{ marginBottom:'1.1rem' }}>
                <span style={{ width:30, height:30, borderRadius:10, background:'#EEF4FF', color:'#4F8EF7', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <TrendingUp size={16} />
                </span>
                Sales {period === 'weekly' ? 'Daily' : period === 'monthly' ? 'Month Progress' : 'Yearly'}
              </div>
              <div style={{ height:200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData} margin={{ top:8, right:8, left:0, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEF4FF" vertical={false} />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} width={55} />
                    <RechartsTooltip cursor={{ fill:'#EEF4FF' }} contentStyle={customTooltipStyle} />
                    <Bar dataKey="total" fill="url(#blueGrad)" radius={[8,8,0,0]} maxBarSize={36} />
                    <defs>
                      <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#93C5FD" />
                        <stop offset="100%" stopColor="#4F8EF7" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense Line Chart */}
            <div className="clay-card">
              <div className="clay-section-title" style={{ marginBottom:'1.1rem' }}>
                <span style={{ width:30, height:30, borderRadius:10, background:'#FEE2E2', color:'#DC2626', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <TrendingDown size={16} />
                </span>
                Expense Trend
              </div>
              <div style={{ height:200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={expensesData} margin={{ top:8, right:8, left:0, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#FEE2E2" vertical={false} />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} width={55} />
                    <RechartsTooltip contentStyle={customTooltipStyle} />
                    <Line
                      type="monotone" dataKey="total" stroke="#F87171" strokeWidth={3}
                      dot={{ r:4, fill:'#F87171', strokeWidth:2, stroke:'#fff' }}
                      activeDot={{ r:6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {salesData.length === 0 && expensesData.length === 0 && (
            <div className="clay-card" style={{ textAlign:'center', padding:'2.5rem', color:'#94A3B8' }}>
              <div style={{ display:'flex', justifyContent:'center', marginBottom:'.75rem' }}>
                <BarChart2 size={48} color="#CBD5E1" />
              </div>
              <div style={{ fontWeight:700 }}>No trend data for this period — add some records to see your charts!</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
