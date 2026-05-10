# 🌱 FoodShare Connect — MERN Stack

> Reducing food waste by connecting businesses with surplus food to local charities and food banks.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Recharts, Socket.IO client |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Real-time | Socket.IO |
| Styling | Custom CSS (no UI library) |

---

## Project Structure

```
foodshare/
├── package.json              ← root scripts (concurrently)
├── .env.example
│
├── server/
│   ├── index.js              ← Express + Socket.IO entry point
│   ├── seed.js               ← demo data seeder
│   ├── middleware/
│   │   └── auth.js           ← JWT protect + role authorize
│   ├── models/
│   │   ├── User.js           ← business / charity / admin
│   │   ├── Donation.js       ← full donation lifecycle
│   │   └── Notification.js
│   └── routes/
│       ├── auth.js           ← register, login, /me, profile
│       ├── donations.js      ← CRUD, claim, complete
│       ├── analytics.js      ← overview, trends, categories, leaderboard
│       ├── notifications.js
│       ├── charities.js
│       ├── businesses.js
│       └── matches.js
│
└── client/src/
    ├── App.jsx               ← routing + protected routes
    ├── index.css             ← global design system
    ├── context/
    │   ├── AuthContext.jsx   ← auth state + axios header
    │   └── SocketContext.jsx ← real-time notifications
    ├── components/shared/
    │   └── AppShell.jsx      ← sidebar + topbar layout
    └── pages/
        ├── LoginPage.jsx
        ├── RegisterPage.jsx  ← 3-step registration
        ├── DashboardPage.jsx ← role-aware stats + recent donations
        ├── DonationsPage.jsx ← grid view, filters, add/claim modals
        ├── MatchesPage.jsx   ← matched donations + complete action
        ├── AnalyticsPage.jsx ← charts (line, bar, pie) + leaderboard
        ├── AdminPage.jsx     ← user management table
        └── ProfilePage.jsx   ← edit profile + notifications toggle
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Clone & configure

```bash
cd foodshare
cp .env.example .env
# Edit .env — set MONGO_URI and JWT_SECRET
```

### 2. Install dependencies

```bash
npm run install-all
```

### 3. Seed demo data (optional but recommended)

```bash
node server/seed.js
```

### 4. Run dev server

```bash
npm run dev
```

- **Frontend**: http://localhost:3000  
- **Backend API**: http://localhost:5000/api

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Business | demo-business@foodshare.com | demo123 |
| Charity | demo-charity@foodshare.com | demo123 |
| Admin | admin@foodshare.com | admin123 |

---

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Donations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/donations` | List donations (role-filtered) |
| GET | `/api/donations/:id` | Get single donation |
| POST | `/api/donations` | Create donation (business/admin) |
| PUT | `/api/donations/:id` | Update donation |
| POST | `/api/donations/:id/claim` | Claim donation (charity) |
| POST | `/api/donations/:id/complete` | Mark completed |
| DELETE | `/api/donations/:id` | Delete donation |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/overview` | Summary stats |
| GET | `/api/analytics/trends` | Monthly trends |
| GET | `/api/analytics/categories` | Category breakdown |
| GET | `/api/analytics/leaderboard` | Top donors (admin) |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications |
| PUT | `/api/notifications/:id/read` | Mark one read |
| PUT | `/api/notifications/read-all` | Mark all read |

---

## Key Features

- **Role-based access**: Businesses list food, charities claim it, admins manage all
- **Real-time notifications**: Socket.IO pushes alerts to charities when food is listed
- **Auto-matching**: All active charities are notified instantly on new donation
- **Analytics dashboard**: Charts for trends, categories, CO₂ saved, meals provided
- **Responsive design**: Mobile-friendly with collapsible sidebar
- **3-step registration**: Separate flows for businesses and charities

---

## Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/foodshare
JWT_SECRET=jwt_secreat_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```
