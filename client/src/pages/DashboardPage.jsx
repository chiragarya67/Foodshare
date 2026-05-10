import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import { Package, CheckCircle, Clock, TrendingUp, Leaf, Users, AlertTriangle, ArrowRight } from 'lucide-react';

const CATEGORY_EMOJI = { produce:'🥦', bakery:'🍞', dairy:'🥛', meat:'🥩', prepared:'🍱', packaged:'📦', beverages:'🧃', other:'🍽️' };

function StatCard({ icon, label, value, color, change }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color + '18', color }}>{icon}</div>
      <div className="stat-value">{value ?? '–'}</div>
      <div className="stat-label">{label}</div>
      {change && <div className={`stat-change ${change > 0 ? 'up' : 'down'}`}>{change > 0 ? '↑' : '↓'} {Math.abs(change)}% this month</div>}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { available:'badge-green', matched:'badge-blue', in_transit:'badge-amber', completed:'badge-gray', expired:'badge-red', cancelled:'badge-red' };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status?.replace('_', ' ')}</span>;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, donationsRes] = await Promise.all([
          axios.get('/api/analytics/overview'),
          axios.get('/api/donations?limit=5'),
        ]);
        setStats(statsRes.data);
        setRecent(donationsRes.data.donations);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300 }}>
      <div className="spinner" style={{ width:32, height:32 }} />
    </div>
  );

  const isBusiness = user?.role === 'business';
  const isCharity = user?.role === 'charity';
  const isAdmin = user?.role === 'admin';

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:28 }}>
      {/* Welcome */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontSize:26, fontFamily:'Syne,sans-serif', fontWeight:700, marginBottom:4 }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color:'var(--ink-soft)', fontSize:14 }}>{format(new Date(), 'EEEE, MMMM do yyyy')}</p>
        </div>
        {isBusiness && (
          <button className="btn btn-primary" onClick={() => navigate('/donations')}>
            <Package size={16} /> List Surplus Food
          </button>
        )}
        {isCharity && (
          <button className="btn btn-primary" onClick={() => navigate('/donations')}>
            <Package size={16} /> Browse Available Food
          </button>
        )}
      </div>

      {/* Stats grid */}
      <div className="stat-grid">
        {isBusiness && <>
          <StatCard icon={<Package size={20}/>} label="Total Listings" value={stats?.totalDonations} color="#3d7a52" />
          <StatCard icon={<CheckCircle size={20}/>} label="Completed" value={stats?.completedDonations} color="#2563eb" />
          <StatCard icon={<Clock size={20}/>} label="Active Now" value={stats?.activeDonations} color="#d97706" />
          <StatCard icon={<Leaf size={20}/>} label="Meals Provided" value={stats?.mealsProvided?.toLocaleString()} color="#7ec898" />
          <StatCard icon={<TrendingUp size={20}/>} label="CO₂ Saved (kg)" value={stats?.co2Saved?.toLocaleString()} color="#6366f1" />
        </>}
        {isCharity && <>
          <StatCard icon={<CheckCircle size={20}/>} label="Claims Made" value={stats?.completedDonations} color="#3d7a52" />
          <StatCard icon={<Clock size={20}/>} label="Active Claims" value={stats?.activeDonations} color="#d97706" />
          <StatCard icon={<Leaf size={20}/>} label="Meals Received" value={stats?.mealsProvided?.toLocaleString()} color="#7ec898" />
          <StatCard icon={<TrendingUp size={20}/>} label="Total Weight (kg)" value={stats?.totalWeight?.toLocaleString()} color="#6366f1" />
        </>}
        {isAdmin && <>
          <StatCard icon={<Package size={20}/>} label="Total Donations" value={stats?.totalDonations} color="#3d7a52" />
          <StatCard icon={<Users size={20}/>} label="Total Users" value={stats?.totalUsers} color="#2563eb" />
          <StatCard icon={<CheckCircle size={20}/>} label="Completed" value={stats?.completedDonations} color="#d97706" />
          <StatCard icon={<Leaf size={20}/>} label="Meals Provided" value={stats?.mealsProvided?.toLocaleString()} color="#7ec898" />
          <StatCard icon={<AlertTriangle size={20}/>} label="Expired" value={stats?.expiredDonations} color="#d44f4f" />
          <StatCard icon={<TrendingUp size={20}/>} label="CO₂ Saved (kg)" value={stats?.co2Saved?.toLocaleString()} color="#6366f1" />
        </>}
      </div>

      {/* Impact banner */}
      {stats?.mealsProvided > 0 && (
        <div style={{ background:'linear-gradient(135deg, var(--sage) 0%, #2e5f3f 100%)', borderRadius:12, padding:'20px 24px', display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
          <div style={{ fontSize:36 }}>🌱</div>
          <div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:18, fontWeight:700, color:'white' }}>
              You've helped provide <span style={{ color:'#a8e6bc' }}>{stats?.mealsProvided?.toLocaleString()} meals</span> to communities in need!
            </div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.65)', marginTop:4 }}>
              That's equivalent to saving {stats?.co2Saved?.toLocaleString()} kg of CO₂ from food waste. Keep it up!
            </div>
          </div>
        </div>
      )}

      {/* Recent donations */}
      <div className="card">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:600 }}>
            {isCharity ? 'Available Donations' : 'Recent Listings'}
          </h3>
          <button className="btn btn-outline btn-sm" onClick={() => navigate('/donations')}>
            View all <ArrowRight size={14} />
          </button>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state" style={{ padding:'40px 20px' }}>
            <div className="empty-state-icon">📦</div>
            <h3>No donations yet</h3>
            <p>{isBusiness ? 'List your first surplus food item to get started.' : 'No food available right now. Check back soon!'}</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  {isAdmin && <th>Business</th>}
                </tr>
              </thead>
              <tbody>
                {recent.map(d => (
                  <tr key={d._id} style={{ cursor:'pointer' }} onClick={() => navigate('/donations')}>
                    <td>
                      <div style={{ fontWeight:500, color:'var(--ink)' }}>{d.title}</div>
                      <div style={{ fontSize:12, color:'var(--ink-ghost)' }}>{d.pickupAddress?.city}</div>
                    </td>
                    <td>
                      <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
                        {CATEGORY_EMOJI[d.category] || '🍽️'} {d.category}
                      </span>
                    </td>
                    <td style={{ fontWeight:500 }}>{d.quantity} {d.unit}</td>
                    <td style={{ fontSize:13 }}>{format(new Date(d.expiryDate), 'MMM d, yyyy')}</td>
                    <td><StatusBadge status={d.status} /></td>
                    {isAdmin && <td style={{ fontSize:13 }}>{d.business?.name}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}