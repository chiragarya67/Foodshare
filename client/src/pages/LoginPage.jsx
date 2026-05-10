import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Leaf, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const demos = {
      business: { email: 'demo-business@foodshare.com', password: 'demo123' },
      charity: { email: 'demo-charity@foodshare.com', password: 'demo123' },
      admin: { email: 'admin@foodshare.com', password: 'admin123' },
    };
    setForm(demos[role]);
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
            <Leaf size={28} color="#7ec898" />
            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: 'white' }}>
              FoodShare<span style={{ color: '#7ec898' }}>Connect</span>
            </span>
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 42, fontWeight: 800, color: 'white', lineHeight: 1.15, marginBottom: 20 }}>
            Fighting food waste,<br />
            <span style={{ color: '#7ec898' }}>one meal at a time.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, lineHeight: 1.7, maxWidth: 380, marginBottom: 48 }}>
            Connect your surplus food with communities that need it most. Real-time matching. Zero waste. Maximum impact.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 32 }}>
            {[['15K+', 'Meals donated'], ['280+', 'Businesses'], ['120', 'Charities served']].map(([val, label]) => (
              <div key={label}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 26, fontWeight: 800, color: '#7ec898' }}>{val}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative circles */}
        <div style={{ position: 'absolute', bottom: -60, right: -60, width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(126,200,152,0.15)' }} />
        <div style={{ position: 'absolute', bottom: -100, right: -100, width: 460, height: 460, borderRadius: '50%', border: '1px solid rgba(126,200,152,0.07)' }} />
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-form-box">
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Sign in</h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginBottom: 28 }}>
            Don't have an account? <Link to="/register">Create one</Link>
          </p>

          {/* Demo logins */}
          <div style={{ background: 'var(--cream)', borderRadius: 8, padding: 12, marginBottom: 24, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Quick demo login</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['business', 'charity', 'admin'].map(r => (
                <button key={r} type="button" className="btn btn-outline btn-sm" style={{ textTransform: 'capitalize', fontSize: 12 }} onClick={() => fillDemo(r)}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-ghost)' }} />
                <input
                  className="form-input"
                  type="email"
                  placeholder="you@example.com"
                  style={{ paddingLeft: 36 }}
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-ghost)' }} />
                <input
                  className="form-input"
                  type="password"
                  placeholder="••••••••"
                  style={{ paddingLeft: 36 }}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ marginTop: 4, justifyContent: 'center' }}>
              {loading ? <div className="spinner" /> : <><span>Sign in</span><ArrowRight size={16} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}