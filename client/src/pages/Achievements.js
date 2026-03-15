import { useAuth } from '../context/AuthContext';
import './Achievements.css';

const ACHIEVEMENTS_DEF = [
  { name: 'Beginner',       icon: '🌱', desc: 'Started the journey',        req: 'Join MoodQuest'                       },
  { name: 'Mind Explorer',  icon: '🧭', desc: 'Reached 100 points',         req: 'Earn 100 points'                      },
  { name: 'Calm Achiever',  icon: '😌', desc: 'Reached 300 points',         req: 'Earn 300 points'                      },
  { name: 'Zen Master',     icon: '🧘', desc: 'Reached 600 points',         req: 'Earn 600 points'                      },
  { name: 'Week Warrior',   icon: '⚔️',  desc: '7-day streak',               req: 'Complete challenges 7 days in a row'  },
  { name: 'Monthly Master', icon: '📅', desc: '30-day streak',               req: 'Complete challenges 30 days in a row' },
  { name: 'Mood Tracker',   icon: '😊', desc: 'Logged 7 moods',             req: 'Log your mood 7 times'                },
  { name: 'Dear Diary',     icon: '📓', desc: 'Wrote 5 journal entries',    req: 'Save 5 journal entries'               },
  { name: 'Breathe Easy',   icon: '🌬️', desc: 'Completed breathing session', req: 'Finish a full breathing exercise'     },
];

export default function Achievements() {
  const { user } = useAuth();
  const earned = user?.achievements || [];

  return (
    <div className="page-wrap fade-up">
      <div className="page-header">
        <h1>Achievements</h1>
        <p>Badges earned on your wellness journey.</p>
      </div>

      {/* Summary */}
      <div className="achiev-summary">
        <div className="achiev-stat">
          <span className="as-icon">🏆</span>
          <div>
            <div className="as-count">{earned.length}</div>
            <div className="as-label">Unlocked</div>
          </div>
        </div>
        <div className="achiev-stat">
          <span className="as-icon">🔒</span>
          <div>
            <div className="as-count">{ACHIEVEMENTS_DEF.length - earned.length}</div>
            <div className="as-label">Locked</div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="achiev-grid">
        {ACHIEVEMENTS_DEF.map(a => {
          const unlocked = earned.includes(a.name);
          return (
            <div key={a.name} className={`achiev-card${unlocked ? ' unlocked' : ' locked'}`}>
              <div className="achiev-icon">{a.icon}</div>
              <div className="achiev-name">{a.name}</div>
              <div className="achiev-desc">{a.desc}</div>
              <div className="achiev-req">{a.req}</div>
              <span className="achiev-status">
                {unlocked ? '✓ Unlocked' : '🔒 Locked'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
