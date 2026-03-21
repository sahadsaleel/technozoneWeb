import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Shield, Hand, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import logo from '../../assets/splash.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);
  const [debugOtp, setDebugOtp] = useState('');

  const { login, verifyOTP, resendOTP, loading, error, clearError } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const startTimer = () => {
    setTimer(60);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    clearError();
    if (!email || !password) return showToast('Please enter email and password', 'error');
    const res = await login(email, password);
    if (res?.requiresOTP) {
      setOtpSent(true);
      startTimer();
      if (res.debug?.otp) setDebugOtp(res.debug.otp);
      showToast('OTP sent to your email', 'success');
    } else if (res?.success) {
      navigate('/');
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    const res = await resendOTP(email);
    if (res.success) {
      startTimer();
      if (res.debug?.otp) setDebugOtp(res.debug.otp);
      showToast('New OTP sent!', 'success');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length < 6) return showToast('Please enter the full 6-digit OTP', 'error');
    const res = await verifyOTP(email, otpValue);
    if (res?.success) {
      navigate('/');
      showToast('Login successful!', 'success');
    }
  };

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex((d) => d === '');
    document.getElementById(`otp-${nextEmpty === -1 ? 5 : nextEmpty}`)?.focus();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #DDEAFF 0%, #EEF4FF 60%, #FCE7F3 100%)',
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
          { top:'8%', left:'12%', w:120, bg:'rgba(79,142,247,0.10)' },
          { top:'60%', left:'5%', w:80, bg:'rgba(244,114,182,0.10)' },
          { top:'20%', right:'8%', w:100, bg:'rgba(52,211,153,0.10)' },
          { bottom:'12%', right:'14%', w:140, bg:'rgba(167,139,250,0.10)' },
        ].map((b,i)=>(
          <div key={i} style={{ position:'absolute', ...b, height:b.w, borderRadius:'50%', background:b.bg }} />
        ))}
      </div>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: 400,
        background: 'rgba(255,255,255,0.92)',
        borderRadius: 32,
        padding: '2.25rem 1.75rem',
        boxShadow: '0 12px 0 0 rgba(0,0,0,0.08), 0 32px 60px rgba(0,0,0,0.10)',
        position: 'relative',
        zIndex: 1,
        animation: 'fadeUp .45s ease',
      }}>
        {/* Logo + Brand */}
        <div style={{ textAlign:'center', marginBottom:'1.75rem' }}>
          <div style={{
            width: 84, height: 84,
            borderRadius: 24,
            background: 'linear-gradient(135deg,#EEF4FF,#DDEAFF)',
            boxShadow: '0 8px 0 rgba(79,142,247,0.20), 0 16px 32px rgba(79,142,247,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.1rem',
          }}>
            <img src={logo} alt="TechnoZone" style={{ width:64, height:64, objectFit:'contain' }} />
          </div>
          <div style={{
            fontWeight: 900, fontSize: '1.55rem', letterSpacing:'-.02em', lineHeight:1,
            background: 'linear-gradient(135deg,#4F8EF7,#A78BFA)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            marginBottom: '.3rem',
          }}>TechnoZone</div>
          <div style={{ fontWeight:700, fontSize:'.72rem', color:'#94A3B8', letterSpacing:'.10em', textTransform:'uppercase' }}>
            Member Portal
          </div>
        </div>

        {/* Heading */}
        <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
          <h1 style={{ fontWeight:900, fontSize:'1.25rem', color:'#1E293B', marginBottom:'.3rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'.4rem' }}>
            {otpSent ? <><ShieldCheck size={20} color="#34D399" /> Verify Identity</> : <><Hand size={20} color="#F59E0B" /> Welcome Back!</>}
          </h1>
          <p style={{ fontSize:'.85rem', color:'#94A3B8', fontWeight:600 }}>
            {otpSent ? 'Enter the 6-digit code we sent to your inbox' : 'Sign in to your TechnoZone account'}
          </p>
        </div>

        {/* Error */}
        {error && <div className="clay-error" style={{ marginBottom:'1rem' }}>{error}</div>}

        {/* ── Login Form ── */}
        {!otpSent ? (
          <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:'.85rem' }} className="animate-fadeUp">
            <div className="clay-field">
              <label className="clay-label">Email</label>
              <div className="clay-input-icon-wrap">
                <span className="clay-input-icon"><Mail size={16} /></span>
                <input
                  className="clay-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="clay-field">
              <label className="clay-label">Password</label>
              <div className="clay-input-icon-wrap">
                <span className="clay-input-icon"><Lock size={16} /></span>
                <input
                  className="clay-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="clay-btn clay-btn-blue"
              disabled={loading}
              style={{ width:'100%', marginTop:'.25rem', justifyContent:'center' }}
            >
              {loading
                ? <span className="clay-spinner clay-spinner-sm" style={{ borderTopColor:'#fff', borderColor:'rgba(255,255,255,.3)' }} />
                : <><span>Sign In</span><ArrowRight size={16} /></>
              }
            </button>
          </form>

        ) : (
          /* ── OTP Form ── */
          <form onSubmit={handleVerifyOTP} style={{ display:'flex', flexDirection:'column', gap:'.85rem' }} className="animate-fadeUp">
            {/* Hint */}
            <div style={{
              background:'#F0F4FF', borderRadius:14, padding:'.7rem 1rem',
              textAlign:'center', fontSize:'.83rem', fontWeight:600, color:'#64748B',
              boxShadow:'inset 0 3px 8px rgba(0,0,0,0.06)',
            }}>
              Code sent to <strong style={{ color:'#1E293B' }}>{email}</strong>
            </div>

            {/* Debug OTP Display (Only during testing/dev) */}
            {debugOtp && (
              <div style={{
                background: '#FFF7ED',
                border: '1px dashed #FB923C',
                borderRadius: 12,
                padding: '.6rem',
                textAlign: 'center',
                fontSize: '.85rem',
                fontWeight: 700,
                color: '#EA580C',
                marginBottom: '.5rem',
                animation: 'pulse 2s infinite'
              }}>
                TEST MODE: Use Code <span style={{ fontSize: '1.1rem', letterSpacing: '2px' }}>{debugOtp}</span>
              </div>
            )}

            {/* OTP boxes */}
            <div style={{ display:'flex', gap:6 }}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  placeholder="·"
                  className={`clay-otp-box${digit ? ' clay-otp-filled' : ''}`}
                  onChange={e => handleOtpChange(e.target.value, index)}
                  onKeyDown={e => handleKeyDown(e, index)}
                  onPaste={index === 0 ? handlePaste : undefined}
                />
              ))}
            </div>

            <button
              type="submit"
              className="clay-btn clay-btn-green"
              disabled={loading}
              style={{ width:'100%', justifyContent:'center' }}
            >
              {loading
                ? <span className="clay-spinner clay-spinner-sm" style={{ borderTopColor:'#fff', borderColor:'rgba(255,255,255,.3)' }} />
                : <><Shield size={16} /><span>Verify & Login</span></>
              }
            </button>

            <div style={{ textAlign:'center' }}>
              <button
                type="button"
                onClick={handleResend}
                disabled={timer > 0 || loading}
                style={{
                  display:'flex', alignItems:'center', justifyContent:'center', gap:'.35rem',
                  background:'none', border:'none', cursor: timer > 0 ? 'not-allowed' : 'pointer',
                  fontFamily:'Nunito,sans-serif', fontSize:'.83rem', fontWeight:700,
                  color: timer > 0 ? '#CBD5E1' : '#4F8EF7',
                  transition:'color .2s', margin:'0 auto'
                }}
              >
                {timer > 0 ? `Resend in ${timer}s` : <><RefreshCw size={14} /> Resend OTP Code</>}
              </button>
            </div>

            <button
              type="button"
              style={{
                background:'none', border:'none', cursor:'pointer',
                fontFamily:'Nunito,sans-serif', fontSize:'.83rem', fontWeight:700,
                color:'#94A3B8', width:'100%', textAlign:'center', padding:'.35rem',
              }}
              onClick={() => setOtpSent(false)}
            >
              ← Back to Sign In
            </button>
          </form>
        )}

        {/* Footer */}
        <div style={{ textAlign:'center', marginTop:'1.5rem', paddingTop:'1rem', borderTop:'2px solid #EEF4FF' }}>
          <span style={{ fontSize:'.85rem', color:'#94A3B8', fontWeight:600 }}>
            Don't have an account?{' '}
          </span>
          <Link to="/register" style={{
            fontWeight:800, fontSize:'.85rem',
            background:'linear-gradient(135deg,#4F8EF7,#A78BFA)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            textDecoration:'none',
          }}>
            Create one
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes pulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
        .animate-fadeUp { animation: fadeUp .35s ease forwards; }
      `}</style>
    </div>
  );
}