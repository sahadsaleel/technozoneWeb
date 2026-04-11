import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, Box, Save, DollarSign, Tag } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { useApp } from '../../context/AppContext';
import * as api from '../../services/api';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '', purchasePrice: '', sellingPrice: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const { showToast } = useApp();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try { 
      const res = await api.getProducts(); 
      setProducts(res.data); 
    } catch (err) { 
      showToast('Failed to load products', 'error'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateProduct(editingId, formData);
        showToast('Product updated!', 'success');
      } else {
        await api.createProduct(formData);
        showToast('Product added!', 'success');
      }
      setModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', purchasePrice: '', sellingPrice: '' });
      fetchProducts();
    } catch (err) { 
      showToast(err.response?.data?.message || 'Error saving product', 'error'); 
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setFormData({
      name: p.name || '',
      purchasePrice: p.purchasePrice || '',
      sellingPrice: p.sellingPrice || ''
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
      await api.deleteProduct(itemToDelete); 
      showToast('Product deleted', 'success'); 
      fetchProducts(); 
    } catch (err) { 
      showToast('Failed to delete', 'error'); 
    } finally {
      setItemToDelete(null);
      setConfirmOpen(false);
    }
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'.75rem' }}>
        <div>
          <h1 className="clay-page-title" style={{ display:'flex', alignItems:'center', gap:'.5rem' }}>
            Products <Box size={24} color="#4F8EF7" />
          </h1>
          <p className="clay-page-subtitle">{products.length} items in catalog</p>
        </div>
        <button className="clay-btn clay-btn-blue" onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="clay-card" style={{ padding:'.9rem 1.1rem' }}>
        <div className="clay-input-icon-wrap" style={{ maxWidth:340 }}>
          <span className="clay-input-icon"><Search size={16} /></span>
          <input
            className="clay-input"
            placeholder="Search products..."
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
            <Box size={48} color="#CBD5E1" />
          </div>
          <div style={{ fontWeight:700, fontSize:'1rem' }}>No products found</div>
          <div style={{ fontSize:'.85rem', marginTop:'.35rem' }}>Tap "Add Product" to create your first item</div>
        </div>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="flex flex-col gap-3 md:hidden">
            {filtered.map(p => (
              <div key={p._id} className="clay-list-card">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ fontWeight:800, fontSize:'1rem', color:'#1E293B' }}>{p.name}</div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end' }}>
                    <div style={{ fontWeight:900, fontSize:'1.1rem', color:'#34D399' }}>₹{p.sellingPrice}</div>
                    <div style={{ fontSize:'.7rem', color:'#94A3B8', fontWeight:700 }}>Buy: ₹{p.purchasePrice}</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:'.5rem', marginTop:'.6rem' }}>
                  <button className="clay-btn-icon" onClick={() => handleEdit(p)} title="Edit"><Edit2 size={14} /></button>
                  <button className="clay-btn-icon danger" onClick={() => confirmDelete(p._id)} title="Delete"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="clay-card hidden md:block" style={{ padding:0, overflow:'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Purchase Price (Buy)</th>
                  <th>Selling Price (Sell)</th>
                  <th>Margin</th>
                  <th style={{ textAlign:'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p._id}>
                    <td style={{ fontWeight:700 }}>{p.name}</td>
                    <td style={{ fontWeight:600, color:'#64748B' }}>₹{p.purchasePrice}</td>
                    <td style={{ fontWeight:900, color:'#34D399' }}>₹{p.sellingPrice}</td>
                    <td>
                      <span className="clay-badge clay-badge-blue">
                        ₹{(p.sellingPrice - p.purchasePrice).toFixed(2)}
                      </span>
                    </td>
                    <td style={{ textAlign:'right' }}>
                      <div style={{ display:'flex', gap:'.5rem', justifyContent:'flex-end' }}>
                        <button className="clay-btn-icon" onClick={() => handleEdit(p)} title="Edit"><Edit2 size={14} /></button>
                        <button className="clay-btn-icon danger" onClick={() => confirmDelete(p._id)} title="Delete"><Trash2 size={14} /></button>
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
      <button className="clay-fab md:hidden" onClick={() => setModalOpen(true)} aria-label="Add Product">
        <Plus size={26} />
      </button>

      {/* Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => {
          setModalOpen(false);
          setEditingId(null);
          setFormData({ name: '', purchasePrice: '', sellingPrice: '' });
        }} 
        title={editingId ? "Edit Product" : "Add New Product"}
      >
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'.85rem' }}>
          <div className="clay-field">
            <label className="clay-label">Product Name</label>
            <div className="clay-input-icon-wrap">
              <span className="clay-input-icon"><Tag size={16} /></span>
              <input className="clay-input" required placeholder="e.g. iPhone 15, USB Cable, etc."
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem' }}>
            <div className="clay-field">
              <label className="clay-label">Purchase Price (₹)</label>
              <div className="clay-input-icon-wrap">
                <span className="clay-input-icon"><DollarSign size={16} /></span>
                <input className="clay-input" type="number" required min="0" step="0.01" placeholder="0.00"
                  value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: e.target.value})} />
              </div>
            </div>
            <div className="clay-field">
              <label className="clay-label">Selling Price (₹)</label>
              <div className="clay-input-icon-wrap">
                <span className="clay-input-icon"><DollarSign size={16} /></span>
                <input className="clay-input" type="number" required min="0" step="0.01" placeholder="0.00"
                  value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} />
              </div>
            </div>
          </div>
          
          <div style={{ marginTop:'.5rem', padding:'.75rem', borderRadius:'var(--r-md)', background:'var(--clay-green-bg)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
             <span style={{ fontSize:'.75rem', fontWeight:800, color:'var(--clay-green-dark)' }}>Estimated Margin:</span>
             <span style={{ fontSize:'1rem', fontWeight:900, color:'var(--clay-green-dark)' }}>
               ₹{(parseFloat(formData.sellingPrice || 0) - parseFloat(formData.purchasePrice || 0)).toFixed(2)}
             </span>
          </div>

          <div style={{ display:'flex', gap:'.75rem', marginTop:'.5rem' }}>
            <button type="button" className="clay-btn clay-btn-ghost" style={{ flex:1 }}
              onClick={() => {
                setModalOpen(false);
                setEditingId(null);
                setFormData({ name: '', purchasePrice: '', sellingPrice: '' });
              }}>Cancel</button>
            <button type="submit" className="clay-btn clay-btn-blue" style={{ flex:1 }}>
              <Save size={16} /> {editingId ? "Update Product" : "Save Product"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Product?"
        message="This action cannot be undone. Are you sure you want to delete this product from your catalog?"
      />
    </div>
  );
}
