import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format, isPast } from 'date-fns';
import { Plus, X, Search, Filter, Package, MapPin, Calendar, Tag, CheckCircle, Clock } from 'lucide-react';

const CATEGORIES = ['produce','bakery','dairy','meat','prepared','packaged','beverages','other'];
const UNITS = ['kg','lbs','items','boxes','bags'];
const CATEGORY_EMOJI = { produce:'🥦', bakery:'🍞', dairy:'🥛', meat:'🥩', prepared:'🍱', packaged:'📦', beverages:'🧃', other:'🍽️' };
const CATEGORY_COLORS = { produce:'#3d7a52', bakery:'#c47c2e', dairy:'#2563eb', meat:'#d44f4f', prepared:'#7c3aed', packaged:'#0891b2', beverages:'#0d9488', other:'#6b7280' };

function StatusBadge({ status }) {
  const map = { available:'badge-green', matched:'badge-blue', in_transit:'badge-amber', completed:'badge-gray', expired:'badge-red', cancelled:'badge-red' };
  return <span className={`badge ${map[status] || 'badge-gray'}`} style={{ textTransform:'capitalize' }}>{status?.replace('_',' ')}</span>;
}

function DonationModal({ donation, onClose, onClaim, user }) {
  if (!donation) return null;
  const isBusiness = user.role === 'business';
  const isCharity = user.role === 'charity';
  const canClaim = isCharity && donation.status === 'available';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:24 }}>{CATEGORY_EMOJI[donation.category]}</span>
            <div>
              <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:17, fontWeight:600 }}>{donation.title}</h3>
              <StatusBadge status={donation.status} />
            </div>
          </div>
          <button className="btn btn-outline btn-sm" style={{ padding:'6px' }} onClick={onClose}><X size={16}/></button>
        </div>
        <div className="modal-body" style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {[
              { icon:<Tag size={15}/>, label:'Category', value: donation.category },
              { icon:<Package size={15}/>, label:'Quantity', value: `${donation.quantity} ${donation.unit}` },
              { icon:<Calendar size={15}/>, label:'Expires', value: format(new Date(donation.expiryDate), 'MMM d, yyyy') },
              { icon:<Clock size={15}/>, label:'Pickup by', value: format(new Date(donation.pickupBy), 'MMM d, yyyy HH:mm') },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{ background:'var(--cream)', borderRadius:8, padding:'12px 14px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--ink-soft)', marginBottom:4 }}>{icon}{label}</div>
                <div style={{ fontSize:14, fontWeight:500, color:'var(--ink)', textTransform:'capitalize' }}>{value}</div>
              </div>
            ))}
          </div>

          {donation.description && (
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--ink-soft)', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.04em' }}>Description</div>
              <p style={{ fontSize:14, color:'var(--ink-mid)', lineHeight:1.6 }}>{donation.description}</p>
            </div>
          )}

          {donation.pickupAddress?.city && (
            <div style={{ display:'flex', alignItems:'flex-start', gap:8 }}>
              <MapPin size={16} style={{ color:'var(--ink-soft)', marginTop:2, flexShrink:0 }} />
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--ink-soft)', marginBottom:2 }}>Pickup Address</div>
                <div style={{ fontSize:14, color:'var(--ink-mid)' }}>
                  {[donation.pickupAddress.street, donation.pickupAddress.city, donation.pickupAddress.state, donation.pickupAddress.zip].filter(Boolean).join(', ')}
                </div>
              </div>
            </div>
          )}

          {donation.business && (
            <div style={{ background:'var(--sage-light)', borderRadius:8, padding:'12px 14px' }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--sage)', marginBottom:4 }}>Donated by</div>
              <div style={{ fontSize:14, fontWeight:500 }}>{donation.business.name}</div>
              {donation.business.phone && <div style={{ fontSize:13, color:'var(--ink-soft)' }}>{donation.business.phone}</div>}
            </div>
          )}

          {/* Dietary tags */}
          {donation.dietary && Object.entries(donation.dietary).some(([,v]) => v) && (
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {Object.entries(donation.dietary).filter(([,v]) => v).map(([k]) => (
                <span key={k} className="badge badge-green" style={{ textTransform:'capitalize' }}>{k}</span>
              ))}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>Close</button>
          {canClaim && <button className="btn btn-primary" onClick={() => onClaim(donation._id)}><CheckCircle size={16}/>Claim Donation</button>}
        </div>
      </div>
    </div>
  );
}

function AddDonationModal({ onClose, onSave }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title:'', category:'produce', description:'', quantity:'', unit:'kg',
    expiryDate:'', pickupBy:'',
    pickupAddress:{ street:'', city: user?.address?.city || '', state:'', zip:'' },
    dietary:{ vegan:false, vegetarian:false, glutenFree:false, halal:false, kosher:false },
    notes:'',
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setAddr = (k, v) => setForm(p => ({ ...p, pickupAddress:{ ...p.pickupAddress, [k]:v } }));
  const setDiet = (k) => setForm(p => ({ ...p, dietary:{ ...p.dietary, [k]:!p.dietary[k] } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/donations', form);
      toast.success('Donation listed! Charities have been notified.');
      onSave(data.donation);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to list donation');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal" style={{ maxWidth:620 }}>
        <div className="modal-header">
          <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:600 }}>List Surplus Food</h3>
          <button className="btn btn-outline btn-sm" style={{ padding:'6px' }} onClick={onClose}><X size={16}/></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:12 }}>
              <div className="form-group">
                <label className="form-label">Item name *</label>
                <input className="form-input" placeholder="e.g. Fresh bread loaves" value={form.title} onChange={e=>set('title',e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" value={form.category} onChange={e=>set('category',e.target.value)}>
                  {CATEGORIES.map(c=><option key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="Any details about the food, condition, packaging..." value={form.description} onChange={e=>set('description',e.target.value)} rows={2}/>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:12 }}>
              <div className="form-group" style={{ gridColumn:'span 2' }}>
                <label className="form-label">Quantity *</label>
                <input className="form-input" type="number" min="0.1" step="0.1" placeholder="0" value={form.quantity} onChange={e=>set('quantity',e.target.value)} required />
              </div>
              <div className="form-group" style={{ gridColumn:'span 2' }}>
                <label className="form-label">Unit</label>
                <select className="form-select" value={form.unit} onChange={e=>set('unit',e.target.value)}>
                  {UNITS.map(u=><option key={u}>{u}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ gridColumn:'span 2' }}>
                <label className="form-label">Expiry date *</label>
                <input className="form-input" type="date" value={form.expiryDate} min={new Date().toISOString().split('T')[0]} onChange={e=>set('expiryDate',e.target.value)} required />
              </div>
              <div className="form-group" style={{ gridColumn:'span 2' }}>
                <label className="form-label">Pickup by *</label>
                <input className="form-input" type="datetime-local" value={form.pickupBy} onChange={e=>set('pickupBy',e.target.value)} required />
              </div>
            </div>

            <div>
              <div className="form-label" style={{ marginBottom:8 }}>Pickup address</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <input className="form-input" placeholder="Street address" value={form.pickupAddress.street} onChange={e=>setAddr('street',e.target.value)}/>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                  <input className="form-input" placeholder="City" value={form.pickupAddress.city} onChange={e=>setAddr('city',e.target.value)}/>
                  <input className="form-input" placeholder="State" value={form.pickupAddress.state} onChange={e=>setAddr('state',e.target.value)}/>
                  <input className="form-input" placeholder="ZIP" value={form.pickupAddress.zip} onChange={e=>setAddr('zip',e.target.value)}/>
                </div>
              </div>
            </div>

            <div>
              <div className="form-label" style={{ marginBottom:8 }}>Dietary info</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {Object.keys(form.dietary).map(k=>(
                  <button key={k} type="button"
                    style={{ padding:'5px 12px', borderRadius:20, fontSize:12, border:`1.5px solid ${form.dietary[k]?'var(--sage)':'var(--border)'}`, background:form.dietary[k]?'var(--sage-light)':'transparent', color:form.dietary[k]?'var(--sage)':'var(--ink-soft)', cursor:'pointer', textTransform:'capitalize', transition:'all 0.15s' }}
                    onClick={()=>setDiet(k)}>{k.replace(/([A-Z])/g,' $1').trim()}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="spinner"/> : <><Plus size={16}/>List Donation</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DonationsPage() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const isBusiness = user?.role === 'business';
  const isCharity = user?.role === 'charity';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit:12 });
      if (filterStatus) params.set('status', filterStatus);
      if (filterCat) params.set('category', filterCat);
      const { data } = await axios.get(`/api/donations?${params}`);
      setDonations(data.donations);
      setTotal(data.total);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [page, filterStatus, filterCat]);

  useEffect(() => { load(); }, [load]);

  const handleClaim = async (id) => {
    try {
      await axios.post(`/api/donations/${id}/claim`);
      toast.success('Donation claimed! The business has been notified.');
      setSelected(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Could not claim donation'); }
  };

  const filtered = donations.filter(d =>
    !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.category.includes(search.toLowerCase())
  );

  const STATUSES = ['available','matched','in_transit','completed','expired'];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:700 }}>
            {isCharity ? 'Available Donations' : 'My Donations'}
          </h1>
          <p style={{ color:'var(--ink-soft)', fontSize:13, marginTop:2 }}>{total} total listings</p>
        </div>
        {isBusiness && (
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={16}/> List Surplus Food
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ position:'relative', flex:'1 1 200px', maxWidth:320 }}>
          <Search size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--ink-ghost)' }}/>
          <input className="form-input" placeholder="Search donations..." style={{ paddingLeft:36 }} value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select className="form-select" style={{ width:'auto', minWidth:140 }} value={filterStatus} onChange={e=>{setFilterStatus(e.target.value);setPage(1);}}>
          <option value="">All statuses</option>
          {STATUSES.map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
        <select className="form-select" style={{ width:'auto', minWidth:140 }} value={filterCat} onChange={e=>{setFilterCat(e.target.value);setPage(1);}}>
          <option value="">All categories</option>
          {CATEGORIES.map(c=><option key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</option>)}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><div className="spinner" style={{ width:32, height:32 }}/></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>No donations found</h3>
          <p>{isBusiness ? 'List your first surplus food item above.' : 'Check back soon — food donations will appear here.'}</p>
        </div>
      ) : (
        <div className="donation-grid">
          {filtered.map(d => {
            const expiring = !isPast(new Date(d.expiryDate)) && (new Date(d.expiryDate) - Date.now()) < 1000*60*60*24;
            return (
              <div key={d._id} className="donation-card" onClick={() => setSelected(d)}>
                <div className="donation-card-header">
                  <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, overflow:'hidden' }}>
                    <div className="category-icon" style={{ background: CATEGORY_COLORS[d.category]+'18', flexShrink:0 }}>
                      <span style={{ fontSize:18 }}>{CATEGORY_EMOJI[d.category]}</span>
                    </div>
                    <div style={{ overflow:'hidden' }}>
                      <div style={{ fontWeight:600, fontSize:14, color:'var(--ink)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.title}</div>
                      <div style={{ fontSize:12, color:'var(--ink-ghost)', textTransform:'capitalize' }}>{d.category}</div>
                    </div>
                  </div>
                  <div style={{ flexShrink:0 }}><StatusBadge status={d.status}/></div>
                </div>
                <div className="donation-card-body">
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                    <span style={{ color:'var(--ink-soft)' }}>Quantity</span>
                    <span style={{ fontWeight:600, color:'var(--ink)' }}>{d.quantity} {d.unit}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                    <span style={{ color:'var(--ink-soft)' }}>Expires</span>
                    <span style={{ fontWeight:500, color: expiring ? 'var(--red)' : 'var(--ink)' }}>
                      {expiring && '⚠️ '}{format(new Date(d.expiryDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                  {d.pickupAddress?.city && (
                    <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--ink-soft)' }}>
                      <MapPin size={12}/>{d.pickupAddress.city}{d.pickupAddress.state && `, ${d.pickupAddress.state}`}
                    </div>
                  )}
                </div>
                <div className="donation-card-footer">
                  {d.business?.name && <span style={{ fontSize:12, color:'var(--ink-ghost)' }}>{d.business.name}</span>}
                  {isCharity && d.status==='available' && (
                    <button className="btn btn-primary btn-sm" onClick={e=>{e.stopPropagation();handleClaim(d._id);}}>
                      <CheckCircle size={13}/> Claim
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:8 }}>
          <button className="btn btn-outline btn-sm" disabled={page===1} onClick={()=>setPage(p=>p-1)}>← Prev</button>
          <span style={{ padding:'6px 12px', fontSize:13, color:'var(--ink-soft)' }}>Page {page}</span>
          <button className="btn btn-outline btn-sm" disabled={filtered.length < 12} onClick={()=>setPage(p=>p+1)}>Next →</button>
        </div>
      )}

      {selected && <DonationModal donation={selected} onClose={()=>setSelected(null)} onClaim={handleClaim} user={user}/>}
      {showAdd && <AddDonationModal onClose={()=>setShowAdd(false)} onSave={d=>setDonations(p=>[d,...p])}/>}
    </div>
  );
}