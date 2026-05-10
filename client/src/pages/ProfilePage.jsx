import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { User, MapPin, Phone, Bell, Save, Building2, Heart } from 'lucide-react';
import { format } from 'date-fns';

const BUSINESS_TYPES = ['Restaurant','Grocery Store','Bakery','Hotel','Caterer','Food Manufacturer','Supermarket','Dhaba','Tiffin Service','Other'];
const CHARITY_TYPES = ['Food Bank','Homeless Shelter','Community Kitchen','School','Religious Organization','NGO','Gurudwara Langar','Anganwadi','Other'];

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    businessType: user?.businessType || '',
    charityType: user?.charityType || '',
    capacity: user?.capacity || '',
    operatingHours: user?.operatingHours || '',
    notifications: user?.notifications ?? true,
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zip: user?.address?.zip || '',
    },
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setAddr = (k, v) => setForm(p => ({ ...p, address: { ...p.address, [k]: v } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  const roleColor = { business:'var(--earth)', charity:'var(--sage)', admin:'var(--blue)' }[user?.role] || 'var(--sage)';

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24, maxWidth:700 }}>
      <div>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:700 }}>Profile Settings</h1>
        <p style={{ color:'var(--ink-soft)', fontSize:13, marginTop:2 }}>Manage your account information</p>
      </div>

      {/* Profile header card */}
      <div className="card" style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:roleColor, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:28, color:'white', flexShrink:0 }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex:1 }}>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:20, fontWeight:700 }}>{user?.name}</h2>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:6 }}>
            <span style={{ fontSize:13, color:'var(--ink-soft)' }}>{user?.email}</span>
            <span className={`badge ${user?.role==='business'?'badge-amber':user?.role==='admin'?'badge-blue':'badge-green'}`} style={{ textTransform:'capitalize' }}>
              {user?.role}
            </span>
            {user?.isVerified && <span className="badge badge-green">✓ Verified</span>}
          </div>
          {user?.lastLogin && (
            <div style={{ fontSize:12, color:'var(--ink-ghost)', marginTop:6 }}>
              Last login: {format(new Date(user.lastLogin), 'MMM d, yyyy HH:mm')}
            </div>
          )}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6, alignItems:'flex-end' }}>
          <div style={{ fontSize:12, color:'var(--ink-ghost)' }}>Member since</div>
          <div style={{ fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:15 }}>{format(new Date(user?.createdAt), 'MMMM yyyy')}</div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:20 }}>
        {/* Basic info */}
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
            <User size={16} color="var(--ink-soft)"/>
            <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:600 }}>Basic Information</h3>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input className="form-input" value={form.name} onChange={e=>set('name',e.target.value)} required/>
              </div>
              <div className="form-group">
                <label className="form-label">Phone number</label>
                <input className="form-input" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e=>set('phone',e.target.value)}/>
              </div>
            </div>

            {user?.role === 'business' && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div className="form-group">
                  <label className="form-label">Business type</label>
                  <select className="form-select" value={form.businessType} onChange={e=>set('businessType',e.target.value)}>
                    <option value="">Select...</option>
                    {BUSINESS_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Operating hours</label>
                  <input className="form-input" placeholder="e.g. Mon-Fri 9am-6pm" value={form.operatingHours} onChange={e=>set('operatingHours',e.target.value)}/>
                </div>
              </div>
            )}

            {user?.role === 'charity' && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div className="form-group">
                  <label className="form-label">Organization type</label>
                  <select className="form-select" value={form.charityType} onChange={e=>set('charityType',e.target.value)}>
                    <option value="">Select...</option>
                    {CHARITY_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Weekly capacity (kg)</label>
                  <input className="form-input" type="number" placeholder="e.g. 200" value={form.capacity} onChange={e=>set('capacity',e.target.value)}/>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
            <MapPin size={16} color="var(--ink-soft)"/>
            <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:600 }}>Address</h3>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div className="form-group">
              <label className="form-label">Street address</label>
              <input className="form-input" placeholder="14 MG Road" value={form.address.street} onChange={e=>setAddr('street',e.target.value)}/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" placeholder="Mumbai" value={form.address.city} onChange={e=>setAddr('city',e.target.value)}/>
              </div>
              <div className="form-group">
                <label className="form-label">State</label>
                <input className="form-input" placeholder="MH" value={form.address.state} onChange={e=>setAddr('state',e.target.value)}/>
              </div>
              <div className="form-group">
                <label className="form-label">PIN Code</label>
                <input className="form-input" placeholder="400001" value={form.address.zip} onChange={e=>setAddr('zip',e.target.value)}/>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
            <Bell size={16} color="var(--ink-soft)"/>
            <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:15, fontWeight:600 }}>Notifications</h3>
          </div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', background:'var(--cream)', borderRadius:8 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:500 }}>Email & real-time notifications</div>
              <div style={{ fontSize:12, color:'var(--ink-soft)', marginTop:2 }}>
                {user?.role === 'charity' ? 'Get notified when new food donations are available nearby.' : 'Get notified when charities claim your donations.'}
              </div>
            </div>
            <button type="button"
              onClick={() => set('notifications', !form.notifications)}
              style={{ width:44, height:24, borderRadius:12, background:form.notifications?'var(--sage)':'var(--border)', border:'none', cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
              <div style={{ position:'absolute', top:3, left: form.notifications?22:3, width:18, height:18, borderRadius:'50%', background:'white', transition:'left 0.2s', boxShadow:'0 1px 3px rgba(0,0,0,0.2)' }}/>
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-lg" style={{ alignSelf:'flex-start' }} disabled={loading}>
          {loading ? <div className="spinner"/> : <><Save size={16}/> Save Changes</>}
        </button>
      </form>
    </div>
  );
}