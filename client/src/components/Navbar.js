import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('See you soon! 👋');
  };

  const toggleDark = async () => {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('moodquest_dark', isDark ? '1' : '0');
    updateUser({ darkMode: isDark });
    try { await api.put('/users/darkmode', { darkMode: isDark }); } catch (_) {}
  };

  const isDark = document.body.classList.contains('dark');

  const tabs = [
    { to: '/',             label: 'Dashboard'    },
    { to: '/challenges',   label: 'Challenges'   },
    { to: '/wellness',     label: 'Wellness'     },
    { to: '/achievements', label: 'Achievements' },
    { to: '/leaderboard',  label: 'Leaderboard'  },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">🌿 MoodQuest</div>

        <div className="nav-tabs">
          {tabs.map(t => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.to === '/'}
              className={({ isActive }) => 'nav-tab' + (isActive ? ' active' : '')}
            >
              {t.label}
            </NavLink>
          ))}
        </div>

        <div className="nav-right">
          <span className="nav-username">👤 {user?.username}</span>
          <button className="dark-toggle" onClick={toggleDark} title="Toggle dark mode">
            {isDark ? '☀️' : '🌙'}
          </button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="mobile-nav">
        {tabs.map(t => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === '/'}
            className={({ isActive }) => 'mobile-tab' + (isActive ? ' active' : '')}
          >
            <span className="mt-icon">
              {t.to === '/'             ? '🏠' :
               t.to === '/challenges'   ? '⚡' :
               t.to === '/wellness'     ? '🌱' :
               t.to === '/achievements' ? '🏆' : '📊'}
            </span>
            <span>{t.label.replace('Achievements','Awards')}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
