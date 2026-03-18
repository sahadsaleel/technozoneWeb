import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function MainLayout() {
  return (
    <div style={{ background: '#DDEAFF', minHeight: '100vh', display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }} className="page-content">
        <Topbar />
        <main className="animate-fadeIn" style={{ flex: 1, padding: '1.25rem 1rem 6rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
