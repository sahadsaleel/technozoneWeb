import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Truck, Receipt, BarChart3, LogOut, X, Package, ClipboardList } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import logo from '../../assets/icon.png';

export default function Sidebar() {
  const { logout } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useApp();

  const links = [
    { name: 'Dashboard', path: '/',          icon: LayoutDashboard },
    { name: 'Sales',     path: '/sales',      icon: ShoppingCart },
    { name: 'Purchases', path: '/purchases',  icon: Truck },
    { name: 'Expenses',  path: '/expenses',   icon: Receipt },
    { name: 'Products',  path: '/products',   icon: Package },
    { name: 'Reports',   path: '/reports',    icon: BarChart3 },
    { name: 'Ledger',    path: '/ledger',     icon: ClipboardList },
  ];

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-20 md:hidden transition-all duration-300 ${
          sidebarOpen
            ? 'opacity-100 visible'
            : 'opacity-0 invisible pointer-events-none'
        }`}
        style={{ background: 'rgba(15,23,42,0.35)', backdropFilter: 'blur(4px)' }}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar panel */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Header */}
        <div style={{
          padding: '1.5rem 1.25rem 1.1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: 'linear-gradient(135deg,#EEF4FF,#DDEAFF)',
              boxShadow: '0 4px 0 rgba(79,142,247,0.20), 0 8px 16px rgba(79,142,247,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
            }}>
              <img src={logo} alt="Logo" style={{ width: 34, height: 34, objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#1E293B', lineHeight: 1 }}>TechnoZone</div>
              <div style={{ fontWeight: 600, fontSize: '.68rem', color: '#94A3B8', letterSpacing: '.05em' }}>MANAGEMENT</div>
            </div>
          </div>
          <button
            className="md:hidden clay-btn-icon"
            onClick={() => setSidebarOpen(false)}
            style={{ width: 34, height: 34, borderRadius: 10 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '.5rem .85rem', display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
          <div style={{ fontSize: '.68rem', fontWeight: 800, color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '.08em', padding: '.25rem .75rem .5rem' }}>
            Menu
          </div>
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
              end={link.path === '/'}
            >
              <link.icon size={17} />
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '.85rem', borderTop: '2px solid #EEF4FF' }}>
          <button
            onClick={logout}
            style={{
              display: 'flex', alignItems: 'center', gap: '.75rem',
              width: '100%', padding: '.65rem 1rem',
              borderRadius: 999, border: 'none', cursor: 'pointer',
              background: 'transparent', color: '#94A3B8',
              fontFamily: 'Nunito,sans-serif', fontSize: '.875rem', fontWeight: 700,
              transition: 'all .2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#DC2626'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94A3B8'; }}
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="clay-bottom-nav md:hidden">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            end={link.path === '/'}
            className={({ isActive }) => `clay-bottom-nav-item${isActive ? ' active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            <div className="icon-wrap">
              <link.icon size={20} />
            </div>
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
