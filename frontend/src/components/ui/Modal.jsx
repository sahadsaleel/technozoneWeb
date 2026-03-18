import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Modal({ isOpen, onClose, title, children }) {
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

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      display: 'flex', 
      alignItems: 'center', // Always center, even on mobile
      justifyContent: 'center',
      padding: '1.5rem' // Consistent padding all around so it doesn't touch screen edges on mobile
    }}>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(15,23,42,0.40)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />

      {/* ── Modal panel ── */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          zIndex: 1,
          background: '#fff',
          width: '100%',
          maxWidth: '500px', // On mobile it will just be 100% minus the 1.5rem padding
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: '1.5rem',
          borderRadius: '28px', // Fully rounded corners on all sides for both mobile and desktop
          boxShadow: '0 -8px 40px rgba(0,0,0,0.14), 0 16px 32px rgba(0,0,0,0.08)',
          animation: 'modalPop 0.3s cubic-bezier(.32,.72,0,1)', // Same bouncy pop animation everywhere
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '1.25rem',
        }}>
          <h2 style={{
            fontFamily: 'Nunito,sans-serif', fontWeight: 900,
            fontSize: '1.1rem', color: '#1E293B',
          }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 34, height: 34, borderRadius: 10, border: 'none',
              background: '#F0F4FF', color: '#64748B', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 3px 0 rgba(0,0,0,0.08)',
              transition: 'transform .1s',
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        {children}
      </div>

      <style>{`
        @keyframes modalPop {
          from { opacity:0; transform:scale(0.95); }
          to   { opacity:1; transform:scale(1); }
        }
      `}</style>
    </div>
  );
}
