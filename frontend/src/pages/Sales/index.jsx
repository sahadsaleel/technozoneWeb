import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Trash2, Edit2, ShoppingCart, Save } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { useApp } from '../../context/AppContext';
import * as api from '../../services/api';

export default function Sales() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    productName: '', totalAmount: '', paymentMethod: 'Cash', status: 'Completed', notes: '', date: new Date().toISOString().split('T')[0]
  });
  const [suggestions, setSuggestions] = useState([]);
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
    fetchSales();
    fetchProducts();
  }, []);

  const fetchSales = async () => {
    try { const res = await api.getSales(); setSales(res.data); }
    catch (err) { showToast('Failed to load sales', 'error'); }
    finally { setLoading(false); }
  };

  const fetchProducts = async () => {
    try { const res = await api.getProducts(); setProducts(res.data); }
    catch (err) { console.error('Failed to load products catálogo', err); }
  };

  const handleProductInput = (val) => {
    setFormData({ ...formData, productName: val });
    if (val.trim().length > 0) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const selectProduct = (p) => {
    setFormData({ 
      ...formData, 
      productName: p.name, 
      totalAmount: p.sellingPrice 
    });
    setSuggestions([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...formData, 
        customerName: 'Default Customer', 
        items: [{ name: formData.productName, quantity: 1, price: formData.totalAmount }] 
      };
      
      if (editingId) {
        await api.updateSale(editingId, payload);
        showToast('Sale updated!', 'success');
      } else {
        await api.createSale(payload);
        showToast('Sale recorded!', 'success');
      }
      
      setModalOpen(false);
      setEditingId(null);
      setFormData({ productName:'', totalAmount:'', paymentMethod:'Cash', status:'Completed', notes:'', date: new Date().toISOString().split('T')[0] });
      setSuggestions([]);
      fetchSales();
    } catch (err) { showToast(err.response?.data?.message || 'Error saving sale', 'error'); }
  };

  const handleEdit = (s) => {
    setEditingId(s._id);
    setFormData({
      productName: s.items?.[0]?.name || s.customerName || '',
      totalAmount: s.totalAmount || '',
      paymentMethod: s.paymentMethod || 'Cash',
      status: s.status || 'Completed',
      notes: s.notes || '',
      date: s.date ? new Date(s.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
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
      await api.deleteSale(itemToDelete); 
      showToast('Sale deleted', 'success'); 
      fetchSales(); 
    } catch (err) { showToast('Failed to delete', 'error'); }
    finally { setItemToDelete(null); }
  };

  const filtered = sales.filter(s =>
    s.customerName?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (st) =>
    st === 'Completed' ? 'clay-badge-green' : st === 'Pending' ? 'clay-badge-amber' : 'clay-badge-red';

  const payColor = (p) =>
    p === 'Cash' ? 'clay-badge-blue' : p === 'UPI' ? 'clay-badge-purple' : 'clay-badge-pink';

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'.75rem' }}>
        <div>
          <h1 className="clay-page-title" style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
            Sales <ShoppingCart size={24} color="#4F8EF7" />
          </h1>
          <p className="clay-page-subtitle">{sales.length} records total</p>
        </div>
        <button className="clay-btn clay-btn-blue" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Record Sale
        </button>
      </div>

      {/* Search */}
      <div className="clay-card" style={{ padding:'.9rem 1.1rem' }}>
        <div className="clay-input-icon-wrap" style={{ maxWidth:340 }}>
          <span className="clay-input-icon"><Search size={16} /></span>
          <input
            className="clay-input"
            placeholder="Search customers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
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
            <ShoppingCart size={48} color="#CBD5E1" />
          </div>
          <div style={{ fontWeight:700, fontSize:'1rem' }}>No sales recorded yet</div>
          <div style={{ fontSize:'.85rem', marginTop:'.35rem' }}>Tap "Record Sale" to get started</div>
        </div>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="flex flex-col gap-3 md:hidden">
            {filtered.map(s => (
              <div key={s._id} className="clay-list-card">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontWeight:800, fontSize:'1rem', color:'#1E293B' }}>{s.items?.[0]?.name || s.customerName}</div>
                    <div style={{ fontSize:'.75rem', color:'#94A3B8', fontWeight:600 }}>
                      {new Date(s.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </div>
                  </div>
                  <div style={{ fontWeight:900, fontSize:'1.15rem', color:'#34D399' }}>₹{s.totalAmount}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'.5rem', flexWrap:'wrap', marginTop:'.3rem' }}>
                  <span className={`clay-badge ${statusColor(s.status)}`}>{s.status}</span>
                  <span className={`clay-badge ${payColor(s.paymentMethod)}`}>{s.paymentMethod}</span>
                  {s.addedBy?.name && <span style={{ fontSize:'.72rem', color:'#94A3B8', fontWeight:600 }}>by {s.addedBy.name}</span>}
                </div>
                <div style={{ display:'flex', gap:'.5rem', marginTop:'.4rem' }}>
                  <button className="clay-btn-icon" onClick={() => handleEdit(s)} title="Edit"><Edit2 size={14} /></button>
                  <button className="clay-btn-icon danger" onClick={() => confirmDelete(s._id)} title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="clay-card hidden md:block" style={{ padding:0, overflow:'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th><th>Customer</th><th>Amount</th>
                  <th>Payment</th><th>Status</th><th>Added By</th><th style={{ textAlign:'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s._id}>
                    <td>{new Date(s.date).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</td>
                    <td style={{ fontWeight:700 }}>{s.items?.[0]?.name || s.customerName}</td>
                    <td style={{ fontWeight:900, color:'#34D399' }}>₹{s.totalAmount}</td>
                    <td><span className={`clay-badge ${payColor(s.paymentMethod)}`}>{s.paymentMethod}</span></td>
                    <td><span className={`clay-badge ${statusColor(s.status)}`}>{s.status}</span></td>
                    <td style={{ color:'#94A3B8' }}>{s.addedBy?.name}</td>
                    <td style={{ textAlign:'right' }}>
                      <div style={{ display:'flex', gap:'.5rem', justifyContent:'flex-end' }}>
                        <button className="clay-btn-icon" onClick={() => handleEdit(s)} title="Edit"><Edit2 size={14} /></button>
                        <button className="clay-btn-icon danger" onClick={() => confirmDelete(s._id)} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* FAB on mobile */}
      <button className="clay-fab md:hidden" onClick={() => setModalOpen(true)} aria-label="Add Sale">
        <Plus size={26} />
      </button>

      {/* Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => {
          setModalOpen(false);
          setEditingId(null);
          setFormData({ productName:'', totalAmount:'', paymentMethod:'Cash', status:'Completed', notes:'', date: new Date().toISOString().split('T')[0] });
        }} 
        title={editingId ? "Edit Sale" : "Record New Sale"}
      >
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'.85rem' }}>
          <div className="clay-field" style={{ position: 'relative' }}>
            <label className="clay-label">Product Name</label>
            <input className="clay-input" required placeholder="e.g. Laptop, Header, etc."
              value={formData.productName} 
              onChange={e => handleProductInput(e.target.value)} 
              onBlur={() => setTimeout(() => setSuggestions([]), 200)}
            />
            {suggestions.length > 0 && (
              <div className="clay-card animate-fadeIn" style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                marginTop: '0.5rem', padding: '0.5rem', maxHeight: '200px', overflowY: 'auto',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}>
                {suggestions.map(p => (
                  <div 
                    key={p._id} 
                    className="clay-trend-row" 
                    style={{ padding: '0.6rem 0.8rem', cursor: 'pointer', marginBottom: '0.25rem' }}
                    onMouseDown={() => selectProduct(p)}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{p.name}</div>
                    <div style={{ fontWeight: 900, color: 'var(--clay-green-dark)', fontSize: '0.85rem' }}>₹{p.sellingPrice}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="clay-field">
            <label className="clay-label">Price (₹)</label>
            <input className="clay-input" type="number" required min="0" placeholder="0"
              value={formData.totalAmount} onChange={e => setFormData({...formData, totalAmount: e.target.value})} />
          </div>
          <div className="clay-field">
            <label className="clay-label">Date</label>
            <input className="clay-input" type="date" required
              value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem' }}>
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
              <label className="clay-label">Status</label>
              <div className="clay-select-wrap">
                <select className="clay-input clay-select" value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option>Completed</option><option>Pending</option><option>Cancelled</option>
                </select>
              </div>
            </div>
          </div>
          <div className="clay-field">
            <label className="clay-label">Notes (Optional)</label>
            <textarea className="clay-input clay-textarea" placeholder="Any extra details..."
              value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>
          <div style={{ display:'flex', gap:'.75rem', marginTop:'.5rem' }}>
            <button type="button" className="clay-btn clay-btn-ghost" style={{ flex:1 }}
              onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="clay-btn clay-btn-green" style={{ flex:1 }}>
              <Save size={16} /> {editingId ? 'Update Sale' : 'Save Sale'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Sale?"
        message="This action cannot be undone. Are you sure you want to delete this record?"
      />
    </div>
  );
}
