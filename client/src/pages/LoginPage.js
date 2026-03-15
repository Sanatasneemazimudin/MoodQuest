import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './LoginPage.css';

const ADJECTIVES = ['Calm','Happy','Zen','Peace','Bright','Kind','Wise','Gentle','Serene','Bliss'];
const NOUNS      = ['Tiger','Lotus','Ocean','Mountain','Star','Moon','Sun','Tree','River','Cloud'];

function randomUsername() {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${a}${n}${Math.floor(Math.random() * 100)}`;
}

export default function LoginPage() {
  const [mode, setMode]         = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const { login, register }     = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Both fields are required');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'register') {
        await register(username.trim(), password);
        toast.success(`Welcome, ${username.trim()}! 🌿`);
      } else {
        const user = await login(username.trim(), password);
        toast.success(`Welcome back, ${user.username}! 🌟`);
      }
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleRandom = () => setUsername(randomUsername());

  return (
    <div className="login-screen">
      <div className="login-wrap">
        <div className="login-card">
          <div className="login-logo">
            <span className="logo-icon">🌿</span>
            <h1>MoodQuest</h1>
            <p>Your mental wellness journey starts here</p>
          </div>

          <div className="login-divider" />

          {/* Mode toggle */}
          <div className="mode-toggle">
            <button
              className={mode === 'login' ? 'active' : ''}
              onClick={() => setMode('login')}
            >
              Sign In
            </button>
            <button
              className={mode === 'register' ? 'active' : ''}
              onClick={() => setMode('register')}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="e.g. CalmTiger42"
                value={username}
                onChange={e => setUsername(e.target.value)}
                maxLength={30}
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="field-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full"
              disabled={loading}
            >
              {loading
                ? (mode === 'register' ? 'Creating account…' : 'Signing in…')
                : (mode === 'register' ? 'Create Account 🌿' : 'Continue →')}
            </button>
          </form>

          {mode === 'register' && (
            <button
              className="btn btn-secondary btn-full"
              style={{ marginTop: 10 }}
              onClick={handleRandom}
              type="button"
            >
              🎲 Generate Random Username
            </button>
          )}

          <p className="login-note">
            {mode === 'login'
              ? "Don't have an account? "
              : 'Already have an account? '}
            <button
              className="link-btn"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? 'Register here' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
