import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Leaf, ArrowRight, ArrowLeft, Building2, Heart } from 'lucide-react';

const BUSINESS_TYPES = ['Restaurant', 'Grocery Store', 'Bakery', 'Hotel', 'Caterer', 'Food Manufacturer', 'Supermarket', 'Dhaba', 'Tiffin Service', 'Other'];
const CHARITY_TYPES = ['Food Bank', 'Homeless Shelter', 'Community Kitchen', 'School', 'Religious Organization', 'NGO', 'Gurudwara Langar', 'Anganwadi', 'Other'];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    role: '', name: '', email: '', password: '', confirmPassword: '',
    phone: '', businessType: '', charityType: '', capacity: '',
    address: { street: '', city: '', state: '', zip: '' },
  });

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));
  const setAddr = (field, val) => setForm(p => ({ ...p, address: { ...p.address, [field]: val } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await register(payload);
      toast.success('Account created! Welcome to FoodShare.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
            <Leaf size={28} color="#7ec898" />
            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: 'white' }}>
              FoodShare<span style={{ color: '#7ec898' }}>Connect</span>
            </span>
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 38, fontWeight: 800, color: 'white', lineHeight: 1.2, marginBottom: 20 }}>
            Join the movement<br /><span style={{ color: '#7ec898' }}>against food waste.</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 360 }}>
            Whether you're a business with surplus food or a charity feeding communities — you belong here.
          </p>

          {/* Role cards */}
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: Building2, title: 'For Businesses', desc: 'List surplus food, reduce waste, earn impact points.' },
              { icon: Heart, title: 'For Charities', desc: 'Get matched with nearby food donations instantly.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Icon size={18} color="#7ec898" style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-box" style={{ maxWidth: 460 }}>
          {/* Progress */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= step ? 'var(--sage)' : 'var(--border)', transition: 'background 0.3s' }} />
            ))}
          </div>

          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            {step === 1 ? 'Choose your role' : step === 2 ? 'Account details' : 'Organization info'}
          </h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginBottom: 24 }}>
            Step {step} of 3 &nbsp;·&nbsp; <Link to="/login">Already have an account?</Link>
          </p>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Role */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { value: 'business', icon: Building2, label: 'Business / Restaurant', desc: 'I have surplus food to donate' },
                  { value: 'charity', icon: Heart, label: 'Charity / Food Bank', desc: 'I distribute food to those in need' },
                ].map(({ value, icon: Icon, label, desc }) => (
                  <button
                    key={value} type="button"
                    onClick={() => set('role', value)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px',
                      borderRadius: 10, border: `2px solid ${form.role === value ? 'var(--sage)' : 'var(--border)'}`,
                      background: form.role === value ? 'var(--sage-light)' : 'var(--white)',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: form.role === value ? 'var(--sage)' : 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={20} color={form.role === value ? 'white' : 'var(--ink-soft)'} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{label}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>{desc}</div>
                    </div>
                  </button>
                ))}
                <button type="button" className="btn btn-primary btn-lg" style={{ marginTop: 8, justifyContent: 'center' }} disabled={!form.role} onClick={() => setStep(2)}>
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* Step 2: Account */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Full name</label>
                  <input className="form-input" placeholder="Priya Sharma" value={form.name} onChange={e => set('name', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email address</label>
                  <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input className="form-input" type="password" placeholder="Min 6 chars" value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm password</label>
                    <input className="form-input" type="password" placeholder="••••••" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone (optional)</label>
                  <input className="form-input" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="button" className="btn btn-outline" onClick={() => setStep(1)}><ArrowLeft size={15} /> Back</button>
                  <button type="button" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}
                    disabled={!form.name || !form.email || !form.password}
                    onClick={() => setStep(3)}>
                    Continue <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Org info */}
            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">{form.role === 'business' ? 'Business type' : 'Organization type'}</label>
                  <select className="form-select"
                    value={form.role === 'business' ? form.businessType : form.charityType}
                    onChange={e => form.role === 'business' ? set('businessType', e.target.value) : set('charityType', e.target.value)}>
                    <option value="">Select type...</option>
                    {(form.role === 'business' ? BUSINESS_TYPES : CHARITY_TYPES).map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                {form.role === 'charity' && (
                  <div className="form-group">
                    <label className="form-label">Weekly capacity (kg)</label>
                    <input className="form-input" type="number" placeholder="e.g. 200" value={form.capacity} onChange={e => set('capacity', e.target.value)} />
                  </div>
                )}
                <div className="form-group">
                  <label className="form-label">Street address</label>
                  <input className="form-input" placeholder="14 MG Road" value={form.address.street} onChange={e => setAddr('street', e.target.value)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">City</label>
                    <input className="form-input" placeholder="Mumbai" value={form.address.city} onChange={e => setAddr('city', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">PIN Code</label>
                    <input className="form-input" placeholder="400001" value={form.address.zip} onChange={e => setAddr('zip', e.target.value)} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button type="button" className="btn btn-outline" onClick={() => setStep(2)}><ArrowLeft size={15} /> Back</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
                    {loading ? <div className="spinner" /> : <><span>Create account</span><ArrowRight size={16} /></>}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}