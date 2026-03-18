import { Menu, Bell, Search, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export default function Topbar() {
  const { setSidebarOpen } = useApp();
  const { user, logout } = useAuth();

  const initial = user?.name?.charAt(0).toUpperCase() || '?';

  return (
    <header className="clay-topbar">
      {/* Left: hamburger + search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', flex: 1 }}>
        <button
          className="clay-btn-icon md:hidden"
          onClick={() => setSidebarOpen(true)}
          style={{ flexShrink: 0 }}
        >
          <Menu size={20} />
        </button>

        {/* Search pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '.5rem',
          background: 'rgba(255,255,255,0.85)',
          borderRadius: 999,
          padding: '.55rem 1rem',
          maxWidth: 260,
          width: '100%',
          boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.06), 0 2px 0 rgba(255,255,255,0.9)',
        }}>
          <Search size={15} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search..."
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '.85rem',
              fontWeight: 600,
              color: '#1E293B',
              fontFamily: 'Nunito, sans-serif',
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* Right: notification + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
        {/* Bell */}
        <button className="clay-btn-icon" style={{ position: 'relative' }}>
          <Bell size={19} />
          <span style={{
            position: 'absolute', top: 8, right: 8,
            width: 8, height: 8,
            background: '#F472B6',
            borderRadius: '50%',
            border: '2px solid white',
            boxShadow: '0 2px 0 rgba(219,39,119,0.40)',
          }} />
        </button>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
          <div className="hidden sm:block" style={{ textAlign: 'right', lineHeight: 1.2 }}>
            <div style={{ fontWeight: 800, fontSize: '.875rem', color: '#1E293B' }}>{user?.name}</div>
            <div style={{ fontWeight: 600, fontSize: '.72rem', color: '#94A3B8', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
          <div style={{
            width: 42, height: 42,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #EEF4FF, #C7D2FE)',
            color: '#4F8EF7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: '1rem',
            boxShadow: '0 4px 0 rgba(79,142,247,0.20), 0 8px 16px rgba(79,142,247,0.12)',
            flexShrink: 0,
          }}>
            {initial}
          </div>

          {/* Mobile Logout (only shows on small screens because desktop has it in the sidebar) */}
          <button
            className="md:hidden clay-btn-icon"
            onClick={logout}
            style={{ color: '#F87171', marginLeft: '.25rem', flexShrink: 0 }}
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
