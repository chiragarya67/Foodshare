import { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Package, GitMerge, BarChart2, Shield,
  User, Bell, LogOut, Menu, X, Leaf, ChevronRight
} from 'lucide-react';
axios.defaults.baseURL = 'https://foodshare-x1x5.onrender.com'

const NAV = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['business','charity','admin'] },
  { label: 'Donations', icon: Package, path: '/donations', roles: ['business','charity','admin'] },
  { label: 'Matches', icon: GitMerge, path: '/matches', roles: ['business','charity','admin'] },
  { label: 'Analytics', icon: BarChart2, path: '/analytics', roles: ['business','charity','admin'] },
  { label: 'Admin Panel', icon: Shield, path: '/admin', roles: ['admin'] },
];

function NotifPanel({ onClose }) {
  const { notifications, unread, markRead, clearAll, setNotifications, setUnread } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/notifications').then(({ data }) => {
      setNotifications(data.notifications);
      setUnread(data.unread);
    }).catch(() => {});
  }, []);

  const handleRead = async (n) => {
    if (!n.read) {
      await axios.put(`/api/notifications/${n._id}/read`).catch(() => {});
      markRead(n._id);
    }
    if (n.data?.donationId) navigate('/donations');
    onClose();
  };

  const handleReadAll = async () => {
    await axios.put('/api/notifications/read-all').catch(() => {});
    clearAll();
  };

  return (
    <div className="notif-panel">
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 14 }}>Notifications</span>
        {unread > 0 && <button className="btn btn-sm" style={{ background: 'var(--sage-light)', color: 'var(--sage)', border: 'none', padding: '4px 10px' }} onClick={handleReadAll}>Mark all read</button>}
      </div>
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--ink-soft)', fontSize: 13 }}>No notifications yet</div>
        ) : notifications.map(n => (
          <div key={n._id} className={`notif-item ${!n.read ? 'unread' : ''}`} onClick={() => handleRead(n)}>
            <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 500, color: 'var(--ink)' }}>{n.title}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 2 }}>{n.message}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-ghost)', marginTop: 4 }}>{new Date(n.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AppShell() {
  const { user, logout } = useAuth();
  const { unread } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const navItems = NAV.filter(n => n.roles.includes(user?.role));
  const currentPage = NAV.find(n => location.pathname.startsWith(n.path));

  useEffect(() => {
    const handleClick = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => { logout(); toast.success('Logged out'); navigate('/login'); };

  const roleBadgeColor = { business: 'badge-earth', charity: 'badge-green', admin: 'badge-blue' };

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {sidebarOpen && <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:99 }} onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="nav-logo">
          <div className="nav-logo-text">
            <Leaf size={20} color="#7ec898" />
            FoodShare<span>Connect</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>Feeding communities</div>
        </div>

        <nav style={{ flex: 1, paddingTop: 8 }}>
          <div className="nav-section">Navigation</div>
          {navItems.map(item => (
            <button
              key={item.path}
              className={`nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}
              onClick={() => { navigate(item.path); setSidebarOpen(false); }}
            >
              <item.icon size={17} />
              {item.label}
              {location.pathname.startsWith(item.path) && <ChevronRight size={14} style={{ marginLeft:'auto', opacity:0.5 }} />}
            </button>
          ))}
        </nav>

        <div className="nav-bottom">
          <div style={{ padding: '8px 8px 12px', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:14, color:'white', flexShrink:0 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ overflow:'hidden' }}>
              <div style={{ fontSize:13, fontWeight:500, color:'white', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', textTransform:'capitalize' }}>{user?.role}</div>
            </div>
          </div>
          <button className="nav-item" onClick={() => { navigate('/profile'); setSidebarOpen(false); }}>
            <User size={16} /> Profile
          </button>
          <button className="nav-item" onClick={handleLogout} style={{ color:'rgba(212,79,79,0.8)' }}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <button className="btn btn-outline btn-sm" style={{ display:'none' }} onClick={() => setSidebarOpen(true)} id="mob-menu">
            <Menu size={18} />
          </button>
          <style>{`@media(max-width:768px){#mob-menu{display:flex!important}}`}</style>

          <div>
            <h2 style={{ fontSize:18, fontFamily:'Syne,sans-serif', fontWeight:600 }}>{currentPage?.label || 'FoodShare'}</h2>
          </div>
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:12 }}>
            {/* Notif bell */}
            <div ref={notifRef} style={{ position:'relative' }}>
              <button
                className="btn btn-outline btn-sm"
                style={{ position:'relative', padding:'8px' }}
                onClick={() => setNotifOpen(p => !p)}
              >
                <Bell size={17} />
                {unread > 0 && (
                  <span style={{ position:'absolute', top:4, right:4, width:8, height:8, borderRadius:'50%', background:'var(--red)', border:'2px solid white' }} />
                )}
              </button>
              {notifOpen && <NotifPanel onClose={() => setNotifOpen(false)} />}
            </div>

            {/* Role badge */}
            <span className={`badge ${user?.role === 'business' ? 'badge-amber' : user?.role === 'admin' ? 'badge-blue' : 'badge-green'}`} style={{ textTransform:'capitalize' }}>
              {user?.role}
            </span>

            <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--sage)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:13, color:'white', cursor:'pointer' }} onClick={() => navigate('/profile')}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="page-body page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
