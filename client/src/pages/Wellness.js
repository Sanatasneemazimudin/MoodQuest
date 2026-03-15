import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { spawnConfetti } from '../utils/confetti';
import './Wellness.css';

const MOODS = [
  { emoji: '😁', label: 'Amazing', score: 5 },
  { emoji: '😊', label: 'Good',    score: 4 },
  { emoji: '😐', label: 'Okay',    score: 3 },
  { emoji: '😔', label: 'Low',     score: 2 },
  { emoji: '😤', label: 'Stressed',score: 1 },
];

const BREATH_PHASES = [
  { name: 'Inhale',   dur: 4000, scale: 1.5, hint: 'Breathe in slowly…'  },
  { name: 'Hold',     dur: 4000, scale: 1.5, hint: 'Hold still…'          },
  { name: 'Exhale',   dur: 4000, scale: 1.0, hint: 'Release gently…'      },
  { name: 'Hold',     dur: 4000, scale: 1.0, hint: 'Hold still…'          },
];
const CYCLES_NEEDED = 4;

// ── Mood Tracker ──────────────────────────────────────────────
function MoodPanel({ onPointsEarned }) {
  const [selected, setSelected] = useState(null);
  const [logging, setLogging]   = useState(false);
  const [history, setHistory]   = useState([]);

  useEffect(() => {
    api.get('/moods').then(r => setHistory(r.data)).catch(() => {});
  }, []);

  const logMood = async () => {
    if (!selected) { toast.error('Pick a mood first!'); return; }
    setLogging(true);
    try {
      const { data } = await api.post('/moods', { emoji: selected.emoji, mood: selected.label });
      setHistory(prev => [data.entry, ...prev]);
      onPointsEarned({ points: data.points, level: data.level, achievements: data.achievements });
      toast.success('Mood logged! +10 points 😊');
      setSelected(null);
    } catch (err) {
      toast.error('Failed to log mood');
    } finally {
      setLogging(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h2>How are you feeling right now?</h2>
        <div className="mood-grid">
          {MOODS.map(m => (
            <button
              key={m.label}
              className={`mood-btn${selected?.label === m.label ? ' selected' : ''}`}
              onClick={() => setSelected(m)}
            >
              <span className="mood-emoji">{m.emoji}</span>
              <span className="mood-label">{m.label}</span>
            </button>
          ))}
        </div>
        <button
          className="btn btn-primary"
          style={{ width: 'auto', marginTop: 8 }}
          onClick={logMood}
          disabled={logging || !selected}
        >
          {logging ? 'Logging…' : 'Log Mood +10 pts'}
        </button>
      </div>

      <div className="card">
        <h2>Recent Mood Log</h2>
        {history.length === 0
          ? <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No moods logged yet. Pick one above!</p>
          : (
            <div className="mood-history">
              {history.slice(0, 12).map(e => (
                <div key={e._id} className="mood-chip">
                  {e.emoji} <strong>{e.mood}</strong>
                  <span>{e.time} · {e.date}</span>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
}

// ── Journal ───────────────────────────────────────────────────
function JournalPanel({ onPointsEarned }) {
  const [text, setText]       = useState('');
  const [mood, setMood]       = useState(null);
  const [saving, setSaving]   = useState(false);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    api.get('/journal').then(r => setEntries(r.data)).catch(() => {});
  }, []);

  const save = async () => {
    if (!text.trim()) { toast.error('Write something first!'); return; }
    setSaving(true);
    try {
      const { data } = await api.post('/journal', {
        text,
        mood: mood ? `${mood.emoji} ${mood.label}` : null,
      });
      setEntries(prev => [data.entry, ...prev]);
      onPointsEarned({ points: data.points, level: data.level, achievements: data.achievements });
      toast.success('Entry saved! +15 points 📓');
      spawnConfetti();
      setText('');
      setMood(null);
    } catch (err) {
      toast.error('Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (id) => {
    try {
      await api.delete(`/journal/${id}`);
      setEntries(prev => prev.filter(e => e._id !== id));
      toast.success('Entry deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div>
      <div className="card">
        <h2>Write a Journal Entry</h2>
        <div className="field-group">
          <label>How are you feeling? (optional)</label>
          <div className="mood-grid">
            {MOODS.map(m => (
              <button
                key={m.label}
                className={`mood-btn${mood?.label === m.label ? ' selected' : ''}`}
                onClick={() => setMood(prev => prev?.label === m.label ? null : m)}
              >
                <span className="mood-emoji">{m.emoji}</span>
                <span className="mood-label">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="field-group">
          <label>Your thoughts</label>
          <textarea
            placeholder="What's on your mind today? Reflect, vent, or celebrate…"
            value={text}
            onChange={e => setText(e.target.value)}
            rows={4}
          />
        </div>
        <button
          className="btn btn-primary"
          style={{ width: 'auto' }}
          onClick={save}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save Entry +15 pts'}
        </button>
      </div>

      <div className="card">
        <h2>Past Entries</h2>
        {entries.length === 0
          ? <p className="journal-empty">✏️ No entries yet. Start writing — it's good for you!</p>
          : (
            <div className="journal-list">
              {entries.map(e => (
                <div key={e._id} className="journal-entry">
                  <div className="je-meta">
                    <span className="je-date">{e.date} at {e.time}</span>
                    {e.mood && <span className="je-mood">{e.mood}</span>}
                  </div>
                  <p className="je-text">{e.text}</p>
                  <button className="je-delete" onClick={() => deleteEntry(e._id)}>🗑️</button>
                </div>
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
}

// ── Breathing ─────────────────────────────────────────────────
function BreathPanel({ onPointsEarned }) {
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [cycle, setCycle]       = useState(0);
  const [scale, setScale]       = useState(1);
  const timerRef = useRef(null);
  const stateRef = useRef({ phaseIdx: 0, cycle: 0, running: false });

  const stop = (finished = false) => {
    clearTimeout(timerRef.current);
    setRunning(false);
    setPhaseIdx(0);
    setCycle(0);
    setScale(1);
    stateRef.current = { phaseIdx: 0, cycle: 0, running: false };
    if (finished) {
      api.post('/users/breathing').then(({ data }) => {
        onPointsEarned({ points: data.points, level: data.level, achievements: data.achievements });
        toast.success('Breathing complete! +20 points 🌬️');
        spawnConfetti();
      }).catch(() => toast.error('Failed to record session'));
    }
  };

  const runPhase = () => {
    const { phaseIdx: pi, cycle: ci } = stateRef.current;
    if (!stateRef.current.running) return;

    const phase = BREATH_PHASES[pi];
    setPhaseIdx(pi);
    setScale(phase.scale);

    timerRef.current = setTimeout(() => {
      if (!stateRef.current.running) return;
      const nextPi = (pi + 1) % BREATH_PHASES.length;
      const nextCi = nextPi === 0 ? ci + 1 : ci;

      if (nextCi >= CYCLES_NEEDED) {
        stop(true);
        return;
      }

      stateRef.current = { ...stateRef.current, phaseIdx: nextPi, cycle: nextCi };
      setCycle(nextCi);
      runPhase();
    }, phase.dur);
  };

  const start = () => {
    stateRef.current = { phaseIdx: 0, cycle: 0, running: true };
    setRunning(true);
    setPhaseIdx(0);
    setCycle(0);
    runPhase();
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const phase = BREATH_PHASES[phaseIdx];

  return (
    <div className="card">
      <h2>Guided Breathing Exercise</h2>
      <p style={{ color:'var(--muted)', fontSize:'0.9rem', marginBottom:20 }}>
        Box breathing: 4s inhale → 4s hold → 4s exhale → 4s hold.
        Complete {CYCLES_NEEDED} cycles to earn +20 points.
      </p>

      <div className="breath-wrap">
        <div className="breath-outer">
          <div
            className="breath-inner"
            style={{
              transform: `scale(${scale})`,
              transition: running ? `transform ${phase.dur}ms ease-in-out` : 'transform 0.5s ease',
            }}
          >
            <span>🌬️</span>
          </div>
        </div>

        <div className="breath-label">{running ? phase.name : (cycle === 0 ? 'Ready' : '🎉 Complete!')}</div>
        <div className="breath-hint">{running ? phase.hint : (cycle === 0 ? 'Press Start to begin' : 'Amazing work!')}</div>
        {running && (
          <div className="breath-count">Cycle {cycle + 1} of {CYCLES_NEEDED}</div>
        )}

        <div className="breath-controls">
          {!running
            ? <button className="btn btn-primary" onClick={start}>▶ Start</button>
            : <button className="btn btn-secondary" onClick={() => stop(false)}>■ Stop</button>
          }
        </div>
      </div>
    </div>
  );
}

// ── Wellness Page ─────────────────────────────────────────────
export default function Wellness() {
  const [tab, setTab] = useState('mood');
  const { updateUser } = useAuth();

  const onPointsEarned = (patch) => updateUser(patch);

  const tabs = [
    { key: 'mood',    label: '😊 Mood Tracker' },
    { key: 'journal', label: '📓 Journal'       },
    { key: 'breath',  label: '🌬️ Breathing'    },
  ];

  return (
    <div className="page-wrap fade-up">
      <div className="page-header">
        <h1>Wellness Hub 🌱</h1>
        <p>Track your mood, write in your journal, and practice breathing.</p>
      </div>

      <div className="inner-tabs">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`inner-tab${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'mood'    && <MoodPanel    onPointsEarned={onPointsEarned} />}
      {tab === 'journal' && <JournalPanel onPointsEarned={onPointsEarned} />}
      {tab === 'breath'  && <BreathPanel  onPointsEarned={onPointsEarned} />}
    </div>
  );
}
