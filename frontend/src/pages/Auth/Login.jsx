import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/splash.png';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    clearError();
    if (!username || !password) return;
    const res = await login(username, password);
    if (res?.success) {
      navigate('/');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #DDEAFF 0%, #EEF4FF 60%, #FCE7F3 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem 1rem', fontFamily: 'Nunito, sans-serif',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 400,
        background: 'rgba(255,255,255,0.92)',
        borderRadius: 32, padding: '2.25rem 1.75rem',
        boxShadow: '0 12px 0 0 rgba(0,0,0,0.08), 0 32px 60px rgba(0,0,0,0.10)',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ textAlign:'center', marginBottom:'1.75rem' }}>
          <div style={{
            width: 84, height: 84, borderRadius: 24,
            background: 'linear-gradient(135deg,#EEF4FF,#DDEAFF)',
            margin: '0 auto 1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <img src={logo} alt="Logo" style={{ width:64, height:64, objectFit:'contain' }} />
          </div>
          <h1 style={{ fontWeight: 900, fontSize: '1.55rem', color: '#1E293B' }}>Sign In</h1>
        </div>

        {error && <div className="clay-error" style={{ marginBottom:'1rem' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:'.85rem' }}>
          <div className="clay-field">
            <div className="clay-input-icon-wrap">
              <span className="clay-input-icon"><User size={16} /></span>
              <input
                className="clay-input"
                type="text"
                placeholder="Username"
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="clay-field">
            <div className="clay-input-icon-wrap" style={{ position: 'relative' }}>
              <span className="clay-input-icon"><Lock size={16} /></span>
              <input
                className="clay-input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                style={{
                  position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8',
                  display: 'flex', alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit" className="clay-btn clay-btn-blue"
            disabled={loading} style={{ width:'100%', marginTop:'.25rem', justifyContent:'center' }}
          >
            {loading ? <span className="clay-spinner clay-spinner-sm" style={{ borderTopColor:'#fff' }} /> : <><span>Sign In</span><ArrowRight size={16} /></>}
          </button>
        </form>

        <div style={{ textAlign:'center', marginTop:'1.5rem', paddingTop:'1rem', borderTop:'2px solid #EEF4FF' }}>
          <span style={{ fontSize:'.85rem', color:'#94A3B8' }}>Don't have an account? </span>
          <Link to="/register" style={{ fontWeight:800, fontSize:'.85rem', color:'#4F8EF7', textDecoration:'none' }}>Create one</Link>
        </div>
      </div>
    </div>
  );
}