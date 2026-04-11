import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Store, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import logo from '../../assets/splash.png';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '', password: '', confirm_password: '', shopName: ''
  });

  const [validationError, setValidationError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register, loading, error, clearError } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validate = () => {
    if (formData.username.length < 3 || /\s/.test(formData.username)) return "Username must be at least 3 characters and contain no spaces";
    
    if (formData.password.length < 6 || !/\d/.test(formData.password)) {
      return "Password must be at least 6 characters and contain a number";
    }

    if (formData.password !== formData.confirm_password) return "Passwords do not match";
    if (!formData.shopName) return "Shop name is required";
    return null;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    clearError();
    
    const err = validate();
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError('');

    const res = await register(formData);
    if (res?.success) {
      showToast('Registration successful! Please login.', 'success');
      navigate('/login');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #DDEAFF 0%, #EEF4FF 60%, #D1FAE5 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem 1rem', fontFamily: 'Nunito, sans-serif'
    }}>
      <div style={{
        width:'100%', maxWidth:440, background:'rgba(255,255,255,0.92)',
        borderRadius:32, padding:'2.25rem 1.75rem',
        boxShadow:'0 12px 0 0 rgba(0,0,0,0.08), 0 32px 60px rgba(0,0,0,0.10)'
      }}>
        <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
          <img src={logo} alt="TechnoZone" style={{ width:56, height:56, margin:'0 auto .9rem' }} />
          <h1 style={{ fontWeight:900, fontSize:'1.2rem', color:'#1E293B' }}>Create Account</h1>
        </div>

        {(error || validationError) && <div className="clay-error" style={{ marginBottom:'1rem' }}>{validationError || error}</div>}

        <form onSubmit={handleRegister} style={{ display:'flex', flexDirection:'column', gap:'.8rem' }}>
          <div className="clay-input-icon-wrap"><span className="clay-input-icon"><User size={15} /></span>
            <input className="clay-input" type="text" name="username" placeholder="Username *" autoComplete="username" value={formData.username} onChange={handleChange} />
          </div>
          <div className="clay-input-icon-wrap" style={{ position: 'relative' }}><span className="clay-input-icon"><Lock size={15} /></span>
            <input className="clay-input" type={showPassword ? "text" : "password"} name="password" placeholder="Password *" autoComplete="new-password" value={formData.password} onChange={handleChange} />
            <button type="button" tabIndex="-1" onClick={() => setShowPassword(!showPassword)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94A3B8', display:'flex' }}>
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <div className="clay-input-icon-wrap" style={{ position: 'relative' }}><span className="clay-input-icon"><Lock size={15} /></span>
            <input className="clay-input" type={showConfirm ? "text" : "password"} name="confirm_password" placeholder="Confirm Password *" autoComplete="new-password" value={formData.confirm_password} onChange={handleChange} />
            <button type="button" tabIndex="-1" onClick={() => setShowConfirm(!showConfirm)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94A3B8', display:'flex' }}>
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <div className="clay-input-icon-wrap"><span className="clay-input-icon"><Store size={15} /></span>
            <input className="clay-input" type="text" name="shopName" placeholder="Shop Name *" value={formData.shopName} onChange={handleChange} />
          </div>

          <button type="submit" className="clay-btn clay-btn-green" disabled={loading} style={{ width:'100%', justifyContent:'center' }}>
            {loading ? <span className="clay-spinner clay-spinner-sm" style={{ borderTopColor:'#fff' }} /> : <><span>Create Account</span><ArrowRight size={16} /></>}
          </button>
        </form>

        <div style={{ textAlign:'center', marginTop:'1.4rem', borderTop:'2px solid #EEF4FF', paddingTop:'1rem' }}>
          <span style={{ fontSize:'.85rem', color:'#94A3B8' }}>Already have an account? </span>
          <Link to="/login" style={{ fontWeight:800, fontSize:'.85rem', color:'#34D399', textDecoration:'none' }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}