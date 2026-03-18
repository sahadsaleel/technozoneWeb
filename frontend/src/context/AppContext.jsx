import { createContext, useContext, useState } from 'react';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <AppContext.Provider value={{ sidebarOpen, setSidebarOpen, toast, showToast }}>
      {children}
      {toast && <Toast toast={toast} />}
    </AppContext.Provider>
  );
}

function Toast({ toast }) {
  const colors = {
    success: 'border-green-500 bg-green-500/10 text-green-400',
    error:   'border-red-500 bg-red-500/10 text-red-400',
    info:    'border-[#00d2ff] bg-[#00d2ff]/10 text-[#00d2ff]',
    warning: 'border-yellow-500 bg-yellow-500/10 text-yellow-400',
  };
  return (
    <div style={{
      position:'fixed', bottom:'24px', right:'24px', zIndex:99,
      padding:'12px 20px', borderRadius:'12px', border:'1px solid',
      fontWeight:500, fontSize:'14px', maxWidth:'320px',
      animation:'fadeIn 0.3s ease',
      background: 'var(--color-surface)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
    }}
    className={colors[toast.type] || colors.info}
    >
      {toast.message}
    </div>
  );
}

export const useApp = () => useContext(AppContext);
