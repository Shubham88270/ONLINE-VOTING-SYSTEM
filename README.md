# 🗳️ VoteApp — Online Voting System

A full-stack secure online voting system with blockchain-backed vote integrity.

## Tech Stack
- **Frontend**: React 18, Tailwind CSS, Framer Motion, Chart.js, Socket.io
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Socket.io
- **Security**: bcrypt, helmet, CORS, rate limiting, express-validator
- **Extra**: Blockchain vote recording, OTP email verification

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Gmail account (for OTP emails)

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

```bash
cd server
cp .env.example .env
# Edit .env with your values
```

### 3. Run Development

```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm start
```

### 4. Default Admin
```
Email:    admin@vote.com
Password: admin123
```

---

## 📁 Project Structure

```
voting-system/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── context/      # Auth + Theme context
│   │   ├── pages/
│   │   │   ├── admin/    # Admin panel pages
│   │   │   └── user/     # User panel pages
│   │   └── utils/        # Validators
│   └── public/
└── server/          # Node.js backend
    ├── blockchain/   # VoteChain implementation
    ├── controllers/  # Route controllers
    ├── middleware/   # Auth, validate, rate limiter
    ├── models/       # Mongoose schemas
    ├── routes/       # API routes
    └── utils/        # Email helpers
```

---

## 🌐 Deployment

### Backend → Render
1. Push to GitHub
2. Create new Web Service on Render
3. Set environment variables from `.env.example`
4. Build command: `npm install`
5. Start command: `npm start`

### Frontend → Vercel
1. Import GitHub repo
2. Set root directory: `client`
3. Add env variable: `REACT_APP_API_URL=https://your-render-url.onrender.com`
4. Deploy

### Database → MongoDB Atlas
1. Create free cluster at cloud.mongodb.com
2. Get connection string
3. Update `MONGO_URI` in Render env vars

---

## ✨ Features
- JWT Authentication + Email OTP Verification
- Role-based access (Admin / User)
- Blockchain tamper-proof voting
- Real-time results via Socket.io
- Admin: manage elections, users, candidates
- User: vote once, view live results
- Profile photo upload
- Dark theme with animations
- Responsive design
