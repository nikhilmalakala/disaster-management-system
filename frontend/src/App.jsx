import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useSocket } from './context/SocketContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import IncidentForm from './pages/IncidentForm';
import IncidentDetail from './pages/IncidentDetail';
import AuthorityDashboard from './pages/AuthorityDashboard';
import Analytics from './pages/Analytics';
import AdminUserManagement from './pages/AdminUserManagement';
import SOSButton from './components/SOSButton';
import SOSModal from './components/SOSModal';

// Using standalone ProtectedRoute component in ./components/ProtectedRoute.jsx

export default function App() {
  const { user, loading } = useAuth();
  const { sosAlert, clearSosAlert } = useSocket();
  console.log('App render', { user, loading, token: !!localStorage.getItem('token') });

  return (
    <>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="incidents/new" element={<IncidentForm />} />
          <Route path="incidents/:id" element={<IncidentDetail />} />
          <Route path="incidents/:id/edit" element={<IncidentForm />} />
          <Route
            path="authority"
            element={
              <ProtectedRoute roles={['authority', 'admin']}>
                <AuthorityDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="analytics" element={<Analytics />} />
          <Route
            path="admin/users"
            element={
              <ProtectedRoute roles={["admin"]}>
                <AdminUserManagement />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {user && <SOSButton />}
      {sosAlert && <SOSModal data={sosAlert} onClose={clearSosAlert} />}
    </>
  );
}
