import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Filler, Tooltip,
} from 'chart.js';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const QUOTES = [
  { text: "The present moment is the only moment available to us.", author: "Thich Nhat Hanh" },
  { text: "You don't have to control your thoughts. Just stop letting them control you.", author: "Dan Millman" },
  { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
  { text: "Within you there is a stillness and a sanctuary to which you can retreat at any time.", author: "Hermann Hesse" },
  { text: "Happiness is not something ready-made. It comes from your own actions.", author: "Dalai Lama" },
  { text: "The mind is everything. What you think, you become.", author: "Buddha" },
  { text: "Peace begins with a smile.", author: "Mother Teresa" },
];

const THRESHOLDS = [100, 300, 600, Infinity];
const PREV_PTS   = [0, 100, 300, 600];

function computeProgress(points) {
  const li   = THRESHOLDS.findIndex(t => points < t);
  const prev = PREV_PTS[li];
  const next = THRESHOLDS[li];
  const pct  = next === Infinity ? 100 : Math.min(100, ((points - prev) / (next - prev)) * 100);
  const label = next === Infinity
    ? `${points} pts — Max level reached! 🏆`
    : `${points - prev} / ${next - prev} pts to next level`;
  return { pct, label };
}

export default function Dashboard() {
  const { user } = useAuth();
  const [weeklyMoods, setWeeklyMoods] = useState([]);
  const [loadingChart, setLoadingChart] = useState(true);

  const quote = QUOTES[new Date().getDay() % QUOTES.length];
  const isDark = document.body.classList.contains('dark');

  useEffect(() => {
    api.get('/moods/weekly')
      .then(r => setWeeklyMoods(r.data))
      .catch(() => {})
      .finally(() => setLoadingChart(false));
  }, []);

  const { pct, label } = computeProgress(user?.points || 0);

  const chartData = {
    labels: weeklyMoods.map(d => d.label),
    datasets: [{
      label: 'Mood',
      data: weeklyMoods.map(d => d.score),
      borderColor: '#6B9C8B',
      backgroundColor: 'rgba(107,156,139,0.12)',
      borderWidth: 2.5,
      pointBackgroundColor: '#6B9C8B',
      pointRadius: 5,
      pointHoverRadius: 7,
      tension: 0.4,
      fill: true,
      spanGaps: true,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        min: 0, max: 5.5,
        ticks: {
          stepSize: 1,
          color: isDark ? '#8BADA0' : '#5A7A8C',
          callback: v => ['', '😤', '😔', '😐', '😊', '😁'][v] || '',
        },
        grid: { color: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' },
      },
      x: {
        ticks: { color: isDark ? '#8BADA0' : '#5A7A8C' },
        grid: { color: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' },
      },
    },
  };

  const CHALLENGES_PREVIEW = [
    { icon: '🧘', title: '5-Minute Meditation', pts: 20 },
    { icon: '📝', title: 'Gratitude Journal',   pts: 15 },
    { icon: '💧', title: 'Drink Water',         pts: 10 },
  ];

  return (
    <div className="page-wrap fade-up">
      <div className="page-header">
        <h1>Welcome back, {user?.username}! 🌟</h1>
        <p>Here's your wellness overview for today.</p>
      </div>

      {/* Daily Quote */}
      <div className="quote-card">
        <p className="quote-text">"{quote.text}"</p>
        <p className="quote-author">— {quote.author}</p>
      </div>

      {/* Stat cards */}
      <div className="stats-row">
        {[
          { icon: '⭐', label: 'Total Points',  value: user?.points || 0      },
          { icon: '📊', label: 'Level',         value: user?.level || '—'     },
          { icon: '🔥', label: 'Day Streak',    value: user?.streak || 0      },
          { icon: '🏆', label: 'Achievements',  value: (user?.achievements || []).length },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <span className="stat-icon">{s.icon}</span>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="card">
        <h2>Level Progress</h2>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <p className="progress-label">{label}</p>
      </div>

      {/* Chart + Today's challenges side by side */}
      <div className="dash-grid">
        <div className="card">
          <h2>Mood This Week 📈</h2>
          <div className="chart-wrap">
            {loadingChart
              ? <div className="spinner" style={{ margin: 'auto' }} />
              : <Line data={chartData} options={chartOptions} />
            }
          </div>
        </div>

        <div className="card">
          <h2>Today's Challenges</h2>
          <div className="mini-challenges">
            {CHALLENGES_PREVIEW.map(c => (
              <div className="mini-challenge" key={c.title}>
                <span className="mc-icon">{c.icon}</span>
                <div>
                  <div className="mc-name">{c.title}</div>
                  <div className="mc-pts">{c.pts} pts</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
