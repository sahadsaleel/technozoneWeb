import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Trash2, Edit2, Receipt, Home, Lightbulb, Briefcase, ShoppingBag, Megaphone, Pin, Save } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { useApp } from '../../context/AppContext';
import * as api from '../../services/api';

const CATEGORIES = ['Rent','Utilities','Salary','Supplies','Marketing','Other'];

const getCatIcon = (cat) => {
  switch (cat) {
    case 'Rent': return <Home size={20} color="#EC4899" />;
    case 'Utilities': return <Lightbulb size={20} color="#EC4899" />;
    case 'Salary': return <Briefcase size={20} color="#EC4899" />;
    case 'Supplies': return <ShoppingBag size={20} color="#EC4899" />;
    case 'Marketing': return <Megaphone size={20} color="#EC4899" />;
    default: return <Pin size={20} color="#EC4899" />;
  }
};

export default function Expenses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    description: '', amount: '', category: 'General', paymentMethod: 'Cash', date: new Date().toISOString().split('T')[0]
  });
  const [editingId, setEditingId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const { showToast } = useApp();

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setModalOpen(true);
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try { const res = await api.getExpenses(); setExpenses(res.data); }
    catch (err) { showToast('Failed to load expenses', 'error'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateExpense(editingId, formData);
        showToast('Expense updated!', 'success');
      } else {
        await api.createExpense(formData);
        showToast('Expense recorded!', 'success');
      }
      setModalOpen(false);
      setEditingId(null);
      setFormData({ description: '', amount: '', category: 'General', paymentMethod: 'Cash', date: new Date().toISOString().split('T')[0] });
      fetchExpenses();
    } catch (err) { showToast(err.response?.data?.message || 'Error saving expense', 'error'); }
  };

  const handleEdit = (exp) => {
    setEditingId(exp._id);
    setFormData({
      description: exp.description || '',
      amount: exp.amount || '',
      category: exp.category || 'General',
      paymentMethod: exp.paymentMethod || 'Cash',
      date: exp.date ? new Date(exp.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setModalOpen(true);
  };

  const confirmDelete = (id) => {
    setItemToDelete(id);
    setConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.deleteExpense(itemToDelete);
      showToast('Expense deleted', 'success');
      fetchExpenses();
    } catch (err) { showToast('Failed to delete', 'error'); }
    finally { setItemToDelete(null); setConfirmOpen(false); }
  };

  const filtered = expenses.filter(exp =>
    (exp.description || '').toLowerCase().includes(search.toLowerCase()) ||
    exp.category?.toLowerCase().includes(search.toLowerCase())
  );

  const payColor = (p) =>
    p === 'Cash' ? 'clay-badge-blue' : p === 'Card' ? 'clay-badge-purple' : 'clay-badge-pink';

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'.75rem' }}>
        <div>
          <h1 className="clay-page-title" style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
            Expenses <Receipt size={24} color="#EC4899" />
          </h1>
          <p className="clay-page-subtitle">{expenses.length} records total</p>
        </div>
        <button className="clay-btn clay-btn-pink" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Search */}
      <div className="clay-card" style={{ padding:'.9rem 1.1rem' }}>
        <div className="clay-input-icon-wrap" style={{ maxWidth:340 }}>
          <span className="clay-input-icon"><Search size={16} /></span>
          <input className="clay-input" placeholder="Search description or category..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}>
          <div className="clay-spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="clay-card" style={{ textAlign:'center', padding:'3rem', color:'#94A3B8' }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'.75rem' }}>
            <Receipt size={48} color="#CBD5E1" />
          </div>
          <div style={{ fontWeight:700, fontSize:'1rem' }}>No expenses recorded yet</div>
          <div style={{ fontSize:'.85rem', marginTop:'.35rem' }}>Tap "Add Expense" to get started</div>
        </div>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="flex flex-col gap-3 md:hidden">
            {filtered.map(exp => (
              <div key={exp._id} className="clay-list-card">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'.65rem' }}>
                    <div style={{
                      width:40, height:40, borderRadius:12,
                      background:'#FCE7F3', display:'flex', alignItems:'center', justifyContent:'center',
                      boxShadow:'0 3px 0 rgba(219,39,119,0.15)',
                    }}>
                      {getCatIcon(exp.category)}
                    </div>
                    <div>
                      <div style={{ fontWeight:800, fontSize:'.95rem', color:'#1E293B' }}>{exp.category}</div>
                      <div style={{ fontSize:'.73rem', color:'#94A3B8', fontWeight:600 }}>
                        {new Date(exp.date).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontWeight:900, fontSize:'1.1rem', color:'#F87171' }}>₹{exp.amount}</div>
                </div>
                {exp.description && (
                  <div style={{ fontSize:'.8rem', color:'#64748B', fontWeight:600, marginTop:'.25rem', paddingLeft:'.25rem' }}>
                    {exp.description}
                  </div>
                )}
                <div style={{ display:'flex', alignItems:'center', gap:'.5rem', flexWrap:'wrap', marginTop:'.35rem' }}>
                  <span className={`clay-badge ${payColor(exp.paymentMethod)}`}>{exp.paymentMethod}</span>
                  {exp.addedBy?.name && <span style={{ fontSize:'.72rem', color:'#94A3B8', fontWeight:600 }}>by {exp.addedBy.name}</span>}
                </div>
                <div style={{ display: 'flex', gap: '.5rem', marginTop: '.4rem' }}>
                  <button className="clay-btn-icon" onClick={() => handleEdit(exp)}><Edit2 size={14} /></button>
                  <button className="clay-btn-icon danger" onClick={() => confirmDelete(exp._id)}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="clay-card hidden md:block" style={{ padding:0, overflow:'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th><th>Category</th><th>Description</th>
                  <th>Amount</th><th>Payment</th><th>Added By</th><th style={{ textAlign:'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(exp => (
                  <tr key={exp._id}>
                    <td>{new Date(exp.date).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</td>
                    <td>
                      <span style={{ display:'flex', alignItems:'center', gap:'.4rem', fontWeight:700 }}>
                        {getCatIcon(exp.category)} {exp.category}
                      </span>
                    </td>
                    <td style={{ color:'#64748B', maxWidth:160 }} className="truncate">{exp.description || '—'}</td>
                    <td style={{ fontWeight:900, color:'#F87171' }}>₹{exp.amount}</td>
                    <td><span className={`clay-badge ${payColor(exp.paymentMethod)}`}>{exp.paymentMethod}</span></td>
                    <td style={{ color:'#94A3B8' }}>{exp.addedBy?.name}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'flex-end' }}>
                        <button className="clay-btn-icon" onClick={() => handleEdit(exp)}><Edit2 size={14} /></button>
                        <button className="clay-btn-icon danger" onClick={() => confirmDelete(exp._id)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* FAB */}
      <button className="clay-fab md:hidden" onClick={() => setModalOpen(true)}
        style={{ background:'#F472B6', boxShadow:'0 6px 0 #DB2777, 0 12px 28px rgba(244,114,182,0.35)' }}>
        <Plus size={26} />
      </button>

      {/* Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => {
          setModalOpen(false);
          setEditingId(null);
          setFormData({ description: '', amount: '', category: 'General', paymentMethod: 'Cash', date: new Date().toISOString().split('T')[0] });
        }} 
        title={editingId ? "Edit Expense" : "Record Expense"}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem' }}>
            <div className="clay-field">
              <label className="clay-label">Category</label>
              <div className="clay-input-icon-wrap">
                 <span className="clay-input-icon">{getCatIcon(formData.category)}</span>
                 <div className="clay-select-wrap">
                   <select className="clay-input clay-select" value={formData.category}
                     onChange={e => setFormData({...formData, category: e.target.value})}>
                     {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                   </select>
                 </div>
              </div>
            </div>
            <div className="clay-field">
              <label className="clay-label">Amount (₹)</label>
              <input className="clay-input" type="number" required min="0" placeholder="0"
                value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
            </div>
          </div>
          <div className="clay-field">
            <label className="clay-label">Date</label>
            <input className="clay-input" type="date" required
              value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div className="clay-field">
            <label className="clay-label">Payment Method</label>
            <div className="clay-select-wrap">
              <select className="clay-input clay-select" value={formData.paymentMethod}
                onChange={e => setFormData({...formData, paymentMethod: e.target.value})}>
                <option>Cash</option><option>UPI</option>
              </select>
            </div>
          </div>
          <div className="clay-field">
            <label className="clay-label">Product/Item Name</label>
            <textarea className="clay-input clay-textarea" placeholder="e.g. Office Supplies, Repairs, etc."
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div style={{ display:'flex', gap:'.75rem', marginTop:'.5rem' }}>
            <button type="button" className="clay-btn clay-btn-ghost" style={{ flex:1 }}
              onClick={() => {
                setModalOpen(false);
                setEditingId(null);
                setFormData({ description: '', amount: '', category: 'General', paymentMethod: 'Cash', date: new Date().toISOString().split('T')[0] });
              }}>Cancel</button>
            <button type="submit" className="clay-btn clay-btn-blue" style={{ flex: 1 }}>
              <Save size={16} /> {editingId ? 'Update Expense' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Expense?"
        message="This action cannot be undone. Are you sure you want to delete this expense record?"
      />
    </div>
  );
}
