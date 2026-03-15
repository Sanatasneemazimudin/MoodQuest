import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Challenges from './pages/Challenges';
import Wellness from './pages/Wellness';
import Achievements from './pages/Achievements';
import Leaderboard from './pages/Leaderboard';
import { useEffect } from 'react';
import './App.css';

// Apply saved dark mode immediately before first render
if (localStorage.getItem('moodquest_dark') === '1') {
  document.body.classList.add('dark');
}

function Spinner() {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      <p style={{ color: '#5A7A8C', fontSize: '0.95rem', marginTop: 8 }}>
        Loading MoodQuest…
      </p>
    </div>
  );
}

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? children : <Navigate to="/login" replace />;
}

function AppContent() {
  const { user, loading } = useAuth();

  // Sync dark mode preference whenever user data arrives
  useEffect(() => {
    if (user?.darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('moodquest_dark', '1');
    }
  }, [user]);

  if (loading) return <Spinner />;

  return (
    <>
      {/* Use solid colours — CSS vars don't resolve inside JS style objects */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#6B9C8B',
            color: '#fff',
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            borderRadius: '50px',
            padding: '14px 24px',
            fontSize: '0.92rem',
          },
          error: {
            style: { background: '#E07070', color: '#fff' },
          },
        }}
      />
      {user && <Navbar />}
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route path="/"             element={<PrivateRoute><Dashboard    /></PrivateRoute>} />
        <Route path="/challenges"   element={<PrivateRoute><Challenges   /></PrivateRoute>} />
        <Route path="/wellness"     element={<PrivateRoute><Wellness     /></PrivateRoute>} />
        <Route path="/achievements" element={<PrivateRoute><Achievements /></PrivateRoute>} />
        <Route path="/leaderboard"  element={<PrivateRoute><Leaderboard  /></PrivateRoute>} />
        <Route path="*"             element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
