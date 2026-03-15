import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Leaderboard.css';

export default function Leaderboard() {
  const { user }         = useAuth();
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/leaderboard')
      .then(r => setBoard(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const myRank = board.findIndex(u => u.username === user?.username) + 1;

  const rankIcon = (i) =>
    i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;

  return (
    <div className="page-wrap fade-up">
      <div className="page-header">
        <h1>Leaderboard</h1>
        <p>Top wellness champions of MoodQuest.</p>
      </div>

      {/* My rank hero */}
      <div className="my-rank-card">
        <div>
          <div className="my-rank-label">Your Rank</div>
          <div className="my-rank-val">{myRank > 0 ? `#${myRank}` : '—'}</div>
        </div>
        <div>
          <div className="my-rank-label">Your Points</div>
          <div className="my-rank-pts">{user?.points || 0} pts</div>
        </div>
        <div>
          <div className="my-rank-label">Level</div>
          <div className="my-rank-pts">{user?.level || 'Beginner'}</div>
        </div>
      </div>

      {/* Board list */}
      {loading ? (
        <div className="spinner-wrap" style={{ minHeight: 200 }}>
          <div className="spinner" />
        </div>
      ) : board.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--muted)' }}>
          No players yet — be the first! 🌿
        </div>
      ) : (
        <div className="lb-list">
          {board.map((u, i) => {
            const isMe = u.username === user?.username;
            return (
              <div key={u._id} className={`lb-row${isMe ? ' me' : ''}`}>
                <div className="lb-rank">{rankIcon(i)}</div>
                <div className="lb-info">
                  <span className="lb-name">{u.username}</span>
                  <span className="lb-level">{u.level || 'Beginner'}</span>
                </div>
                <div className="lb-pts">
                  <span className="lb-pts-num">{u.points}</span>
                  <span className="lb-pts-label"> pts</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
