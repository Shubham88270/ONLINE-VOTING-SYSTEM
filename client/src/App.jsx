import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

import AdminLayout  from './components/AdminLayout.jsx';
import UserLayout   from './components/UserLayout.jsx';

import Home         from './pages/Home.jsx';
import Auth         from './pages/Auth.jsx';
import VerifyEmail  from './pages/VerifyEmail.jsx';
import VotingPage   from './pages/VotingPage.jsx';
import ResultsPage  from './pages/ResultsPage.jsx';

// User pages
import UserHome    from './pages/user/UserHome.jsx';
import UserVote    from './pages/user/UserVote.jsx';
import UserResults from './pages/user/UserResults.jsx';
import UserProfile from './pages/user/UserProfile.jsx';

// Admin pages
import AdminDashboard     from './pages/admin/AdminDashboard.jsx';
import ManageElections    from './pages/admin/ManageElections.jsx';
import ManageUsers        from './pages/admin/ManageUsers.jsx';
import ManageCandidates   from './pages/admin/ManageCandidates.jsx';
import VotesMonitoring    from './pages/admin/VotesMonitoring.jsx';
import AdminResults       from './pages/admin/AdminResults.jsx';
import AdminSettings      from './pages/admin/AdminSettings.jsx';
import BlockchainExplorer from './pages/admin/BlockchainExplorer.jsx';

// ── Guards ────────────────────────────────────────────────
const AutoRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  return user.isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />;
};

const UserRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  if (user.isAdmin) return <Navigate to="/admin" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  if (!user.isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

// ── Routes ────────────────────────────────────────────────
const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/"             element={<Home />} />
    <Route path="/auth"         element={<Auth />} />
    <Route path="/verify-email" element={<VerifyEmail />} />
    <Route path="/panel"        element={<AutoRedirect />} />

    {/* User Panel — sidebar layout */}
    <Route path="/dashboard" element={<UserRoute><UserLayout /></UserRoute>}>
      <Route index                element={<UserHome />}    />
      <Route path="vote"          element={<UserVote />}    />
      <Route path="vote/:id"      element={<VotingPage />}  />  {/* ✅ Fixed route */}
      <Route path="results"       element={<UserResults />} />
      <Route path="results/:id"   element={<ResultsPage />} />
      <Route path="profile"       element={<UserProfile />} />
    </Route>

    {/* Admin Panel — sidebar layout */}
    <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
      <Route index             element={<AdminDashboard />}     />
      <Route path="elections"  element={<ManageElections />}    />
      <Route path="users"      element={<ManageUsers />}        />
      <Route path="candidates" element={<ManageCandidates />}   />
      <Route path="monitoring" element={<VotesMonitoring />}    />
      <Route path="results"    element={<AdminResults />}       />
      <Route path="blockchain" element={<BlockchainExplorer />} />
      <Route path="settings"   element={<AdminSettings />}      />
    </Route>

    <Route path="*" element={<AutoRedirect />} />
  </Routes>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
