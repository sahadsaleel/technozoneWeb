import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Store, User, Phone, ArrowRight, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import logo from '../../assets/splash.png';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', shopName: '', phone: ''
  });

  const { register, loading, error, clearError } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    clearError();
    if (!formData.name || !formData.email || !formData.password || !formData.shopName) {
      return showToast('Please fill all required fields', 'error');
    }
    const res = await register(formData);
    if (res?.success) {
      showToast('Registration successful! Please login.', 'success');
      navigate('/login');
    }
  };

  const fields = [
    { name:'name',     type:'text',     icon: User,  placeholder:'Full Name *'      },
    { name:'email',    type:'email',    icon: Mail,  placeholder:'Email Address *'  },
    { name:'password', type:'password', icon: Lock,  placeholder:'Password *'       },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #DDEAFF 0%, #EEF4FF 60%, #D1FAE5 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem 1rem',
      fontFamily: 'Nunito, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background bubbles */}
      <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
        {[
          { top:'5%', left:'8%',   w:110, bg:'rgba(52,211,153,0.10)' },
          { top:'70%', left:'4%',  w:90,  bg:'rgba(79,142,247,0.10)' },
          { top:'15%', right:'6%', w:130, bg:'rgba(167,139,250,0.09)' },
          { bottom:'8%', right:'10%', w:100, bg:'rgba(251,191,36,0.10)' },
        ].map((b,i)=>(
          <div key={i} style={{ position:'absolute', ...b, height:b.w, borderRadius:'50%', background:b.bg }} />
        ))}
      </div>

      {/* Card */}
      <div style={{
        width:'100%', maxWidth:440,
        background:'rgba(255,255,255,0.92)',
        borderRadius:32,
        padding:'2.25rem 1.75rem',
        boxShadow:'0 12px 0 0 rgba(0,0,0,0.08), 0 32px 60px rgba(0,0,0,0.10)',
        position:'relative', zIndex:1,
        animation:'fadeUp .45s ease',
      }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
          <div style={{
            width:76, height:76, borderRadius:22,
            background:'linear-gradient(135deg,#D1FAE5,#DDEAFF)',
            boxShadow:'0 8px 0 rgba(52,211,153,0.20), 0 16px 32px rgba(52,211,153,0.10)',
            display:'flex', alignItems:'center', justifyContent:'center',
            margin:'0 auto .9rem',
          }}>
            <img src={logo} alt="TechnoZone" style={{ width:56, height:56, objectFit:'contain' }} />
          </div>
          <div style={{
            fontWeight:900, fontSize:'1.45rem', letterSpacing:'-.02em',
            background:'linear-gradient(135deg,#34D399,#4F8EF7)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            marginBottom:'.25rem',
          }}>TechnoZone</div>
          <div style={{ fontWeight:700, fontSize:'.68rem', color:'#94A3B8', letterSpacing:'.10em', textTransform:'uppercase' }}>
            Member Portal
          </div>
        </div>

        <h1 style={{ fontWeight:900, fontSize:'1.2rem', color:'#1E293B', textAlign:'center', marginBottom:'.3rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'.5rem' }}>
          <UserPlus size={20} color="#34D399" /> Create Account
        </h1>
        <p style={{ fontSize:'.84rem', color:'#94A3B8', fontWeight:600, textAlign:'center', marginBottom:'1.4rem' }}>
          Register your shop with TechnoZone
        </p>

        {error && <div className="clay-error" style={{ marginBottom:'1rem' }}>{error}</div>}

        <form onSubmit={handleRegister} style={{ display:'flex', flexDirection:'column', gap:'.8rem' }}>
          {/* Single fields */}
          {fields.map(f => (
            <div key={f.name} className="clay-field">
              <div className="clay-input-icon-wrap">
                <span className="clay-input-icon"><f.icon size={15} /></span>
                <input
                  className="clay-input"
                  type={f.type}
                  name={f.name}
                  placeholder={f.placeholder}
                  value={formData[f.name]}
                  onChange={handleChange}
                />
              </div>
            </div>
          ))}

          {/* Shop Name + Phone row */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem' }}>
            <div className="clay-input-icon-wrap">
              <span className="clay-input-icon"><Store size={15} /></span>
              <input className="clay-input" name="shopName" placeholder="Shop Name *"
                value={formData.shopName} onChange={handleChange} />
            </div>
            <div className="clay-input-icon-wrap">
              <span className="clay-input-icon"><Phone size={15} /></span>
              <input className="clay-input" name="phone" placeholder="Phone"
                value={formData.phone} onChange={handleChange} />
            </div>
          </div>

          <div style={{ textAlign:'right', fontSize:'.73rem', color:'#CBD5E1', fontWeight:700, marginTop:'-.2rem' }}>
            * Required fields
          </div>

          <button
            type="submit"
            className="clay-btn clay-btn-green"
            disabled={loading}
            style={{ width:'100%', justifyContent:'center', marginTop:'.2rem' }}
          >
            {loading
              ? <span className="clay-spinner clay-spinner-sm" style={{ borderTopColor:'#fff', borderColor:'rgba(255,255,255,.3)' }} />
              : <><span>Create Account</span><ArrowRight size={16} /></>
            }
          </button>
        </form>

        <div style={{ textAlign:'center', marginTop:'1.4rem', paddingTop:'1rem', borderTop:'2px solid #EEF4FF' }}>
          <span style={{ fontSize:'.85rem', color:'#94A3B8', fontWeight:600 }}>
            Already have an account?{' '}
          </span>
          <Link to="/login" style={{
            fontWeight:800, fontSize:'.85rem',
            background:'linear-gradient(135deg,#34D399,#4F8EF7)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            textDecoration:'none',
          }}>
            Sign in
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}