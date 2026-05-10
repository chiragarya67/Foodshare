import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Shield, Users, Building2, Heart, ToggleLeft, ToggleRight, Search } from 'lucide-react';

function UserTable({ users, onToggle, role }) {
  const [search, setSearch] = useState('');
  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div style={{ position:'relative', maxWidth:320 }}>
        <Search size={14} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--ink-ghost)' }}/>
        <input className="form-input" placeholder={`Search ${role}s...`} style={{ paddingLeft:32 }} value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>{role === 'business' ? 'Type' : 'Org Type'}</th>
              <th>City</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign:'center', color:'var(--ink-ghost)', padding:32 }}>No {role}s found</td></tr>
            ) : filtered.map(u => (
              <tr key={u._id}>
                <td style={{ fontWeight:500, color:'var(--ink)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--sage-light)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'var(--sage)', flexShrink:0 }}>
                      {u.name[0].toUpperCase()}
                    </div>
                    {u.name}
                  </div>
                </td>
                <td style={{ color:'var(--ink-soft)', fontSize:13 }}>{u.email}</td>
                <td style={{ fontSize:13, textTransform:'capitalize' }}>{u.businessType || u.charityType || '–'}</td>
                <td style={{ fontSize:13 }}>{u.address?.city || '–'}</td>
                <td style={{ fontSize:13 }}>{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                <td>
                  <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                    {u.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td>
                  <button
                    className={`btn btn-sm ${u.isActive ? 'btn-outline' : 'btn-primary'}`}
                    style={{ gap:5 }}
                    onClick={() => onToggle(u._id)}
                  >
                    {u.isActive ? <><ToggleRight size={14}/> Disable</> : <><ToggleLeft size={14}/> Enable</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('businesses');
  const [businesses, setBusinesses] = useState([]);
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/businesses'),
      axios.get('/api/charities'),
    ]).then(([bRes, cRes]) => {
      setBusinesses(bRes.data.businesses);
      setCharities(cRes.data.charities);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleToggle = async (id) => {
    try {
      const { data } = await axios.put(`/api/businesses/${id}/toggle`);
      const update = list => list.map(u => u._id === id ? data.user : u);
      setBusinesses(update);
      setCharities(update);
      toast.success(`User ${data.user.isActive ? 'enabled' : 'disabled'}`);
    } catch { toast.error('Failed to update user'); }
  };

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding:80 }}>
      <div className="spinner" style={{ width:32, height:32 }}/>
    </div>
  );

  const tabs = [
    { key:'businesses', label:'Businesses', icon: Building2, count: businesses.length },
    { key:'charities', label:'Charities', icon: Heart, count: charities.length },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ width:40, height:40, borderRadius:10, background:'var(--blue-light)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Shield size={20} color="var(--blue)"/>
        </div>
        <div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:700 }}>Admin Panel</h1>
          <p style={{ color:'var(--ink-soft)', fontSize:13 }}>Manage users and platform activity</p>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px,1fr))', gap:14 }}>
        {[
          { label:'Total Businesses', value: businesses.length, icon: Building2, color:'#c47c2e', active: businesses.filter(b=>b.isActive).length },
          { label:'Total Charities', value: charities.length, icon: Heart, color:'#3d7a52', active: charities.filter(c=>c.isActive).length },
          { label:'Active Businesses', value: businesses.filter(b=>b.isActive).length, icon: Users, color:'#2563eb' },
          { label:'Active Charities', value: charities.filter(c=>c.isActive).length, icon: Users, color:'#7c3aed' },
        ].map(({ label, value, icon:Icon, color, active }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon" style={{ background:color+'18', color }}><Icon size={18}/></div>
            <div className="stat-value" style={{ fontSize:24 }}>{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="card" style={{ padding:0 }}>
        <div style={{ display:'flex', borderBottom:'1px solid var(--border)' }}>
          {tabs.map(t => (
            <button key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                display:'flex', alignItems:'center', gap:8,
                padding:'14px 20px', border:'none', background:'transparent',
                cursor:'pointer', fontSize:14, fontWeight:500,
                color: activeTab === t.key ? 'var(--sage)' : 'var(--ink-soft)',
                borderBottom: activeTab === t.key ? '2px solid var(--sage)' : '2px solid transparent',
                transition:'all 0.15s',
              }}>
              <t.icon size={15}/>
              {t.label}
              <span style={{ background:activeTab===t.key?'var(--sage-light)':'var(--cream)', color:activeTab===t.key?'var(--sage)':'var(--ink-ghost)', padding:'1px 7px', borderRadius:10, fontSize:11, fontWeight:600 }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
        <div style={{ padding:20 }}>
          {activeTab === 'businesses' && <UserTable users={businesses} onToggle={handleToggle} role="business"/>}
          {activeTab === 'charities' && <UserTable users={charities} onToggle={handleToggle} role="charity"/>}
        </div>
      </div>
    </div>
  );
}