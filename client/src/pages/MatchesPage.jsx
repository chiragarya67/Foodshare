import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { GitMerge, MapPin, Phone, Mail, CheckCircle, Package } from 'lucide-react';

const CATEGORY_EMOJI = { produce:'🥦', bakery:'🍞', dairy:'🥛', meat:'🥩', prepared:'🍱', packaged:'📦', beverages:'🧃', other:'🍽️' };

function StatusBadge({ status }) {
  const map = { available:'badge-green', matched:'badge-blue', in_transit:'badge-amber', completed:'badge-gray', expired:'badge-red' };
  return <span className={`badge ${map[status] || 'badge-gray'}`} style={{ textTransform:'capitalize' }}>{status?.replace('_',' ')}</span>;
}

export default function MatchesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/matches')
      .then(({ data }) => setMatches(data.matches))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleComplete = async (id) => {
    const weight = prompt('Enter actual weight picked up (kg):');
    if (!weight) return;
    try {
      const { data } = await axios.post(`/api/donations/${id}/complete`, { actualWeight: parseFloat(weight) });
      setMatches(prev => prev.map(m => m._id === id ? data.donation : m));
      toast.success('Donation marked as completed!');
    } catch { toast.error('Could not update donation'); }
  };

  const isBusiness = user?.role === 'business';
  const isCharity = user?.role === 'charity';

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding:80 }}>
      <div className="spinner" style={{ width:32, height:32 }}/>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:700 }}>
          {isCharity ? 'My Claims' : 'Matched Donations'}
        </h1>
        <p style={{ color:'var(--ink-soft)', fontSize:13, marginTop:2 }}>
          {matches.length} {isCharity ? 'active and past claims' : 'donations with charity matches'}
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><GitMerge size={48} style={{ opacity:0.3 }}/></div>
          <h3>No matches yet</h3>
          <p>{isCharity ? 'Claim a donation from the Donations page to see it here.' : 'Once charities claim your donations, they\'ll appear here.'}</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {matches.map(m => {
            const partner = isCharity ? m.business : m.matchedCharity;
            return (
              <div key={m._id} className="card" style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:20, alignItems:'start' }}>
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  {/* Top row */}
                  <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:22 }}>{CATEGORY_EMOJI[m.category] || '🍽️'}</span>
                      <div>
                        <div style={{ fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:16 }}>{m.title}</div>
                        <div style={{ fontSize:12, color:'var(--ink-soft)', textTransform:'capitalize' }}>{m.category}</div>
                      </div>
                    </div>
                    <StatusBadge status={m.status}/>
                  </div>

                  {/* Details */}
                  <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
                    <div>
                      <div style={{ fontSize:11, fontWeight:600, color:'var(--ink-soft)', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:2 }}>Quantity</div>
                      <div style={{ fontSize:14, fontWeight:500 }}>{m.quantity} {m.unit}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:11, fontWeight:600, color:'var(--ink-soft)', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:2 }}>Expires</div>
                      <div style={{ fontSize:14 }}>{format(new Date(m.expiryDate), 'MMM d, yyyy')}</div>
                    </div>
                    {m.matchedAt && (
                      <div>
                        <div style={{ fontSize:11, fontWeight:600, color:'var(--ink-soft)', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:2 }}>Matched on</div>
                        <div style={{ fontSize:14 }}>{format(new Date(m.matchedAt), 'MMM d, yyyy')}</div>
                      </div>
                    )}
                    {m.completedAt && (
                      <div>
                        <div style={{ fontSize:11, fontWeight:600, color:'var(--ink-soft)', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:2 }}>Completed</div>
                        <div style={{ fontSize:14 }}>{format(new Date(m.completedAt), 'MMM d, yyyy')}</div>
                      </div>
                    )}
                  </div>

                  {/* Partner info */}
                  {partner && (
                    <div style={{ background:'var(--sage-light)', borderRadius:8, padding:'12px 14px', display:'flex', flexWrap:'wrap', gap:16 }}>
                      <div>
                        <div style={{ fontSize:11, fontWeight:600, color:'var(--sage)', textTransform:'uppercase', letterSpacing:'0.04em', marginBottom:2 }}>
                          {isCharity ? 'Donated by' : 'Claimed by'}
                        </div>
                        <div style={{ fontSize:14, fontWeight:600 }}>{partner.name}</div>
                      </div>
                      {partner.address?.city && (
                        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--ink-soft)' }}>
                          <MapPin size={13}/>{partner.address.city}
                        </div>
                      )}
                      {partner.phone && (
                        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--ink-soft)' }}>
                          <Phone size={13}/>{partner.phone}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action */}
                <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end' }}>
                  {m.status === 'matched' && (isCharity || user?.role === 'admin') && (
                    <button className="btn btn-primary btn-sm" onClick={() => handleComplete(m._id)}>
                      <CheckCircle size={14}/> Mark Complete
                    </button>
                  )}
                  {m.status === 'completed' && (
                    <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--sage)', fontWeight:500 }}>
                      <CheckCircle size={15}/> Completed
                    </div>
                  )}
                  {m.actualWeight && (
                    <div style={{ fontSize:12, color:'var(--ink-soft)' }}>
                      <Package size={12} style={{ display:'inline', marginRight:4 }}/>
                      {m.actualWeight} kg actual
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}