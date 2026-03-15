import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { spawnConfetti } from '../utils/confetti';
import './Challenges.css';

const CHALLENGES = [
  { id:'c1',  title:'5-Minute Meditation', desc:'Sit quietly and focus on your breath for 5 minutes.',         pts:20, icon:'🧘', cat:'mindfulness' },
  { id:'c2',  title:'Gratitude Journal',   desc:"Write down 3 things you're grateful for today.",              pts:15, icon:'📝', cat:'gratitude'   },
  { id:'c3',  title:'Drink Water',         desc:'Drink 8 glasses of water throughout the day.',                pts:10, icon:'💧', cat:'mindfulness' },
  { id:'c4',  title:'Mindful Walk',        desc:'Take a 15-minute walk outside without your phone.',           pts:25, icon:'🚶', cat:'exercise'    },
  { id:'c5',  title:'Deep Breathing',      desc:'Do 5 minutes of slow, intentional deep breathing.',           pts:20, icon:'🌬️', cat:'breathing'   },
  { id:'c6',  title:'Digital Detox',       desc:'Go 1 hour without opening social media.',                     pts:30, icon:'📵', cat:'mindfulness' },
  { id:'c7',  title:'Kindness Act',        desc:'Do something kind and unexpected for someone.',               pts:25, icon:'💝', cat:'kindness'    },
  { id:'c8',  title:'Morning Stretch',     desc:'10 minutes of gentle stretching to wake your body.',          pts:15, icon:'🤸', cat:'exercise'    },
  { id:'c9',  title:'Read 10 Pages',       desc:'Read 10 pages of any book — fiction or nonfiction.',          pts:20, icon:'📚', cat:'mindfulness' },
  { id:'c10', title:'No Caffeine Today',   desc:'Skip caffeine for one full day and drink herbal tea instead.',pts:25, icon:'🍵', cat:'mindfulness' },
];

const FILTERS = [
  { key:'all',         label:'All'             },
  { key:'mindfulness', label:'🧘 Mindfulness'  },
  { key:'exercise',    label:'🏃 Exercise'     },
  { key:'gratitude',   label:'💝 Gratitude'    },
  { key:'breathing',   label:'🌬️ Breathing'   },
  { key:'kindness',    label:'🤗 Kindness'     },
];

export default function Challenges() {
  const { user, updateUser } = useAuth();
  const [filter, setFilter]  = useState('all');
  const [loading, setLoading] = useState(null); // id of challenge being submitted

  const completed = user?.completedToday || [];

  const handleComplete = async (challenge) => {
    if (completed.includes(challenge.id)) return;
    setLoading(challenge.id);
    try {
      const { data } = await api.post('/users/challenge', {
        challengeId: challenge.id,
        points: challenge.pts,
      });
      updateUser({
        points: data.points,
        level: data.level,
        achievements: data.achievements,
        completedToday: data.completedToday,
      });
      toast.success(`+${challenge.pts} points! Keep it up 🌿`);
      spawnConfetti();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not complete challenge');
    } finally {
      setLoading(null);
    }
  };

  const visible = filter === 'all'
    ? CHALLENGES
    : CHALLENGES.filter(c => c.cat === filter);

  return (
    <div className="page-wrap fade-up">
      <div className="page-header">
        <h1>Daily Challenges</h1>
        <p>Complete these activities to earn points and level up.</p>
      </div>

      {/* Filters */}
      <div className="ch-filters">
        {FILTERS.map(f => (
          <button
            key={f.key}
            className={`ch-filter${filter === f.key ? ' active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="challenges-grid">
        {visible.map(c => {
          const done = completed.includes(c.id);
          const busy = loading === c.id;
          return (
            <div key={c.id} className={`challenge-card${done ? ' done' : ''}`}>
              <div className="ch-header">
                <span className="ch-big-icon">{c.icon}</span>
                <div>
                  <div className="ch-title">{c.title}</div>
                  <div className="ch-cat">{c.cat}</div>
                </div>
              </div>
              <p className="ch-desc">{c.desc}</p>
              <div className="ch-footer">
                <span className="pts-badge">+{c.pts} pts</span>
                <button
                  className={`complete-btn${done ? ' done-btn' : ''}`}
                  onClick={() => handleComplete(c)}
                  disabled={done || busy}
                >
                  {busy ? '…' : done ? '✓ Completed' : 'Complete'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
