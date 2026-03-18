import { AlertTriangle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', type = 'danger' }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const isDanger = type === 'danger';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem'
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(15,23,42,0.40)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />

      {/* Modal Dialog */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative', zIndex: 1,
          background: '#fff',
          width: '100%', maxWidth: '400px',
          padding: '1.75rem',
          borderRadius: '24px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15), 0 20px 60px rgba(0,0,0,0.10)',
          animation: 'modalPop 0.3s cubic-bezier(.32,.72,0,1)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            width: 30, height: 30, borderRadius: 10, border: 'none',
            background: 'transparent', color: '#94A3B8', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'color .2s, background .2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#475569'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}
        >
          <X size={16} />
        </button>

        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: isDanger ? 'var(--clay-red-bg)' : 'var(--clay-blue-bg)',
          color: isDanger ? 'var(--clay-red-dark)' : 'var(--clay-blue-dark)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1.25rem',
          boxShadow: `0 4px 0 0 ${isDanger ? 'rgba(220,38,38,0.15)' : 'rgba(37,99,235,0.15)'}`
        }}>
          {isDanger ? <AlertTriangle size={28} /> : <Info size={28} />}
        </div>
        
        <h2 style={{
          fontFamily: 'Nunito,sans-serif', fontWeight: 900, fontSize: '1.25rem',
          color: '#1E293B', marginBottom: '0.5rem'
        }}>
          {title}
        </h2>
        
        <p style={{
          fontSize: '0.95rem', color: '#64748B', lineHeight: 1.5, marginBottom: '1.5rem',
          fontWeight: 600
        }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
          <button
            onClick={onClose}
            className="clay-btn clay-btn-ghost"
            style={{ flex: 1, padding: '0.8rem' }}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`clay-btn ${isDanger ? 'clay-btn-pink' : 'clay-btn-blue'}`}
            style={{ flex: 1, padding: '0.8rem' }}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalPop {
          from { opacity:0; transform:scale(0.95) translateY(10px); }
          to   { opacity:1; transform:scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
