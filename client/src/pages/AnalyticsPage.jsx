import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Leaf, Package, CheckCircle, AlertTriangle, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#3d7a52','#c47c2e','#2563eb','#d44f4f','#7c3aed','#0891b2','#0d9488','#6b7280'];
const CATEGORY_EMOJI = { produce:'🥦', bakery:'🍞', dairy:'🥛', meat:'🥩', prepared:'🍱', packaged:'📦', beverages:'🧃', other:'🍽️' };

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color + '18', color }}>{icon}</div>
      <div className="stat-value">{value ?? '–'}</div>
      <div className="stat-label">{label}</div>
      {sub && <div style={{ fontSize:12, color:'var(--ink-ghost)' }}>{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--white)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', boxShadow:'var(--shadow-md)', fontSize:13 }}>
      <div style={{ fontWeight:600, marginBottom:6, color:'var(--ink)' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, display:'flex', gap:8, justifyContent:'space-between' }}>
          <span>{p.name}</span><span style={{ fontWeight:600 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reqs = [
      axios.get('/api/analytics/overview'),
      axios.get('/api/analytics/trends'),
      axios.get('/api/analytics/categories'),
    ];
    if (user?.role === 'admin') reqs.push(axios.get('/api/analytics/leaderboard'));

    Promise.all(reqs).then(results => {
      setStats(results[0].data);
      setTrends(results[1].data.trends);
      setCategories(results[2].data.categories);
      if (results[3]) setLeaderboard(results[3].data.leaderboard);
    }).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding:80 }}>
      <div className="spinner" style={{ width:32, height:32 }}/>
    </div>
  );

  const completionRate = stats?.totalDonations
    ? Math.round((stats.completedDonations / stats.totalDonations) * 100) : 0;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      <div>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:22, fontWeight:700 }}>Analytics & Impact</h1>
        <p style={{ color:'var(--ink-soft)', fontSize:13, marginTop:2 }}>Track your food donation impact and platform performance</p>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <StatCard icon={<Package size={20}/>} label="Total Donations" value={stats?.totalDonations?.toLocaleString()} color="#3d7a52"/>
        <StatCard icon={<CheckCircle size={20}/>} label="Completed" value={stats?.completedDonations?.toLocaleString()} sub={`${completionRate}% completion rate`} color="#2563eb"/>
        <StatCard icon={<Leaf size={20}/>} label="Meals Provided" value={stats?.mealsProvided?.toLocaleString()} sub="estimated equivalent" color="#7ec898"/>
        <StatCard icon={<TrendingUp size={20}/>} label="CO₂ Saved" value={`${stats?.co2Saved?.toLocaleString()} kg`} sub="from food waste" color="#6366f1"/>
        <StatCard icon={<AlertTriangle size={20}/>} label="Expired" value={stats?.expiredDonations} color="#d97706"/>
        {user?.role === 'admin' && <StatCard icon={<Award size={20}/>} label="Total Users" value={stats?.totalUsers} color="#d44f4f"/>}
      </div>

      {/* Impact bar */}
      <div style={{ background:'var(--ink)', borderRadius:12, padding:'20px 24px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
        {[
          { label:'Meals provided', value: stats?.mealsProvided?.toLocaleString() || '0', icon:'🍽️' },
          { label:'CO₂ offset (kg)', value: stats?.co2Saved?.toLocaleString() || '0', icon:'🌿' },
          { label:'Food redistributed (kg)', value: stats?.totalWeight?.toLocaleString() || '0', icon:'♻️' },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{ textAlign:'center' }}>
            <div style={{ fontSize:28, marginBottom:6 }}>{icon}</div>
            <div style={{ fontFamily:'Syne,sans-serif', fontSize:28, fontWeight:800, color:'#7ec898' }}>{value}</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', marginTop:4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:20 }}>
        {/* Line chart - trends */}
        <div className="chart-card">
          <div className="chart-title">Donation Trends</div>
          {trends.length === 0 ? (
            <div style={{ height:220, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--ink-ghost)', fontSize:13 }}>No trend data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trends} margin={{ top:5, right:10, left:-20, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize:11, fill:'var(--ink-soft)' }} />
                <YAxis tick={{ fontSize:11, fill:'var(--ink-soft)' }} />
                <Tooltip content={<CustomTooltip/>} />
                <Legend wrapperStyle={{ fontSize:12 }} />
                <Line type="monotone" dataKey="donations" name="Listed" stroke="#3d7a52" strokeWidth={2.5} dot={{ r:4 }} />
                <Line type="monotone" dataKey="completed" name="Completed" stroke="#2563eb" strokeWidth={2.5} dot={{ r:4 }} strokeDasharray="5 3" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie - categories */}
        <div className="chart-card">
          <div className="chart-title">By Category</div>
          {categories.length === 0 ? (
            <div style={{ height:220, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--ink-ghost)', fontSize:13 }}>No data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={categories} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="count" paddingAngle={3}>
                    {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                  </Pie>
                  <Tooltip formatter={(v, n, p) => [v, p.payload._id]}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', flexDirection:'column', gap:5, marginTop:8 }}>
                {categories.slice(0,5).map((c, i) => (
                  <div key={c._id} style={{ display:'flex', alignItems:'center', gap:8, fontSize:12 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:COLORS[i%COLORS.length], flexShrink:0 }}/>
                    <span style={{ flex:1, color:'var(--ink-mid)', textTransform:'capitalize' }}>{CATEGORY_EMOJI[c._id]} {c._id}</span>
                    <span style={{ fontWeight:600, color:'var(--ink)' }}>{c.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bar chart */}
      {trends.length > 0 && (
        <div className="chart-card">
          <div className="chart-title">Monthly Food Volume (kg)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trends} margin={{ top:5, right:10, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'var(--ink-soft)' }}/>
              <YAxis tick={{ fontSize:11, fill:'var(--ink-soft)' }}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="quantity" name="Volume (kg)" fill="#3d7a52" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Leaderboard (admin only) */}
      {user?.role === 'admin' && leaderboard.length > 0 && (
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
            <Award size={18} color="var(--earth)"/>
            <h3 style={{ fontFamily:'Syne,sans-serif', fontSize:16, fontWeight:600 }}>Top Donors Leaderboard</h3>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Business</th>
                  <th>City</th>
                  <th>Donations</th>
                  <th>Total Qty</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, i) => (
                  <tr key={entry._id}>
                    <td>
                      <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, color: i===0?'#c47c2e':i===1?'#6b7280':i===2?'#7c5d3a':'var(--ink-ghost)' }}>
                        {i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}
                      </span>
                    </td>
                    <td style={{ fontWeight:500, color:'var(--ink)' }}>{entry.business.name}</td>
                    <td style={{ color:'var(--ink-soft)' }}>{entry.business.address?.city || '–'}</td>
                    <td><span className="badge badge-green">{entry.totalDonations}</span></td>
                    <td style={{ fontWeight:500 }}>{entry.totalQty?.toLocaleString()} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}