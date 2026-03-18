import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, Truck, Receipt, Calendar, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import * as api from '../../services/api';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n || 0);

export default function Ledger() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useApp();

  useEffect(() => {
    fetchLedger();
  }, [date]);

  const fetchLedger = async () => {
    try {
      setLoading(true);
      const res = await api.getLedger({ date });
      setData(res.data);
    } catch (err) {
      showToast('Failed to load ledger', 'error');
    } finally {
      setLoading(false);
    }
  };

  const changeDate = (days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split('T')[0]);
  };

  if (loading && !data) return (
    <div style={{ display:'flex', justifyContent:'center', padding:'4rem' }}>
      <div className="clay-spinner" />
    </div>
  );

  const s = data?.summary || { totalSales:0, totalPurchases:0, totalExpenses:0, netCash:0 };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      {/* Header & Date Pagination */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'.75rem' }}>
        <div>
          <h1 className="clay-page-title" style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
            Daily Ledger <Calendar size={24} color="#6366F1" />
          </h1>
          <p className="clay-page-subtitle">Detailed transaction log for the day</p>
        </div>
        
        <div className="clay-card" style={{ padding:'.5rem .75rem', display:'flex', alignItems:'center', gap:'.75rem' }}>
          <button className="clay-btn-icon" onClick={() => changeDate(-1)}><ChevronLeft size={18} /></button>
          <div style={{ fontWeight:800, fontSize:'.9rem', color:'#1E293B', minWidth:120, textAlign:'center' }}>
            {new Date(date).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
          </div>
          <button className="clay-btn-icon" onClick={() => changeDate(1)}><ChevronRight size={18} /></button>
        </div>
      </div>

      {loading && (
        <div style={{ display:'flex', justifyContent:'center', padding:'1rem' }}>
           <div className="clay-spinner" style={{ width:24, height:24 }} />
        </div>
      )}

      {/* Main Content Areas */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'1.25rem' }}>
        
        {/* Sales Section */}
        <section className="clay-card" style={{ padding:0, overflow:'hidden' }}>
          <div className="clay-section-title" style={{ padding:'1rem 1.25rem', background:'rgba(79,142,247,0.05)', borderBottom:'1px solid #EEF4FF' }}>
            <ShoppingCart size={18} color="#4F8EF7" /> Sales
          </div>
          <div style={{ overflowX:'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th><th>Product</th><th>Amount</th><th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {data?.sales.length > 0 ? data.sales.map(s => (
                  <tr key={s._id}>
                    <td style={{ fontWeight:700 }}>{s.customerName}</td>
                    <td>{s.items?.[0]?.name || '—'}</td>
                    <td style={{ fontWeight:900, color:'#34D399' }}>₹{s.totalAmount}</td>
                    <td><span className="clay-badge clay-badge-blue">{s.paymentMethod}</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" style={{ textAlign:'center', color:'#94A3B8', padding:'2rem' }}>No sales today</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Purchases Section */}
        <section className="clay-card" style={{ padding:0, overflow:'hidden' }}>
          <div className="clay-section-title" style={{ padding:'1rem 1.25rem', background:'rgba(167,139,250,0.05)', borderBottom:'1px solid #EEF4FF' }}>
            <Truck size={18} color="#A78BFA" /> Purchases
          </div>
          <div style={{ overflowX:'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Supplier</th><th>Product</th><th>Cost</th><th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {data?.purchases.length > 0 ? data.purchases.map(p => (
                  <tr key={p._id}>
                    <td style={{ fontWeight:700 }}>{p.supplierName}</td>
                    <td>{p.items?.[0]?.name || '—'}</td>
                    <td style={{ fontWeight:900, color:'#F59E0B' }}>₹{p.totalCost}</td>
                    <td><span className="clay-badge clay-badge-purple">{p.paymentMethod}</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" style={{ textAlign:'center', color:'#94A3B8', padding:'2rem' }}>No purchases today</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Expenses Section */}
        <section className="clay-card" style={{ padding:0, overflow:'hidden' }}>
          <div className="clay-section-title" style={{ padding:'1rem 1.25rem', background:'rgba(248,113,113,0.05)', borderBottom:'1px solid #EEF4FF' }}>
            <Receipt size={18} color="#F87171" /> Expenses
          </div>
          <div style={{ overflowX:'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Category</th><th>Description</th><th>Amount</th><th>Method</th>
                </tr>
              </thead>
              <tbody>
                {data?.expenses.length > 0 ? data.expenses.map(e => (
                  <tr key={e._id}>
                    <td style={{ fontWeight:700 }}>{e.category}</td>
                    <td className="truncate" style={{ maxWidth:150 }}>{e.description || '—'}</td>
                    <td style={{ fontWeight:900, color:'#F87171' }}>₹{e.amount}</td>
                    <td><span className="clay-badge clay-badge-pink">{e.paymentMethod}</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan="4" style={{ textAlign:'center', color:'#94A3B8', padding:'2rem' }}>No expenses today</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* Summary Totals at the bottom */}
      <div style={{
        display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', marginTop:'.5rem'
      }} className="lg:grid-cols-4">
        
        <div className="clay-stat-card" style={{ background:'linear-gradient(135deg,#ECFDF5,#D1FAE5)' }}>
          <div>
            <div className="clay-stat-label" style={{ color:'#059669' }}>Total Sales</div>
            <div className="clay-stat-value" style={{ color:'#059669' }}>{fmt(s.totalSales)}</div>
          </div>
          <ArrowUpRight size={24} color="#059669" />
        </div>

        <div className="clay-stat-card" style={{ background:'linear-gradient(135deg,#FFFBEB,#FEF3C7)' }}>
          <div>
            <div className="clay-stat-label" style={{ color:'#D97706' }}>Total Purchases</div>
            <div className="clay-stat-value" style={{ color:'#D97706' }}>{fmt(s.totalPurchases)}</div>
          </div>
          <ArrowDownRight size={24} color="#D97706" />
        </div>

        <div className="clay-stat-card" style={{ background:'linear-gradient(135deg,#FEF2F2,#FEE2E2)' }}>
          <div>
            <div className="clay-stat-label" style={{ color:'#DC2626' }}>Total Expenses</div>
            <div className="clay-stat-value" style={{ color:'#DC2626' }}>{fmt(s.totalExpenses)}</div>
          </div>
          <ArrowDownRight size={24} color="#DC2626" />
        </div>

        <div className="clay-stat-card" style={{ background:'linear-gradient(135deg,#EEF4FF,#DDEAFF)' }}>
          <div>
            <div className="clay-stat-label" style={{ color:'#2563EB' }}>Day Net Cash</div>
            <div className="clay-stat-value" style={{ color:'#2563EB' }}>{fmt(s.netCash)}</div>
          </div>
          <Wallet size={24} color="#2563EB" />
        </div>

      </div>

    </div>
  );
}
