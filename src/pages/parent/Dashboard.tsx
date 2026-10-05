import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { DIFFICULTY_LABEL, EXAM_DATE, SKILL, SKILLS, WORLDS, skillsOf } from '../../engine/catalog';
import { addDays, daysToExam, getDateOverride, phaseOf, prettyDate, SCHEDULE, setDateOverride, today } from '../../engine/dates';
import { allSkillStats, currentWorld, stageOf, STAGE_INFO, worldProgress } from '../../engine/mastery';
import { clearProgress, initialState, replaceState, update, useAppState } from '../../engine/store';
import type { AppState, SkillId } from '../../engine/types';
import { clearParentPass, hasParentPass } from './Gate';

const TABS = ['Overview', 'Skills', 'Training Needs', 'Activity', 'Mock Results', 'Settings'] as const;
type Tab = (typeof TABS)[number];

const pct = (x: number) => `${Math.round(x * 100)}%`;
const mins = (s: number) => (s < 60 ? `${Math.round(s)}s` : `${Math.round(s / 60)} min`);

export function Dashboard() {
  const state = useAppState();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>('Overview');
  if (!hasParentPass()) return <Navigate to="/parent" replace />;

  return (
    <div className="parent">
      <header className="parent-head">
        <div>
          <b>Mathosaur</b> · Parent Dashboard
        </div>
        <div className="parent-head-right">
          <span>
            {state.childName || 'Child'} · {daysToExam()} days to Olympiad (26 Nov 2026)
          </span>
          <button
            type="button"
            className="btn btn-soft"
            onClick={() => {
              clearParentPass();
              nav('/');
            }}
          >
            Exit to child mode
          </button>
        </div>
      </header>
      <nav className="parent-tabs" role="tablist">
        {TABS.map((t) => (
          <button type="button" role="tab" aria-selected={tab === t} key={t} className={tab === t ? 'tab-on' : ''} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </nav>
      <main className="parent-main">
        {tab === 'Overview' && <Overview state={state} />}
        {tab === 'Skills' && <Skills state={state} />}
        {tab === 'Training Needs' && <Needs state={state} />}
        {tab === 'Activity' && <Activity state={state} />}
        {tab === 'Mock Results' && <Mocks state={state} />}
        {tab === 'Settings' && <SettingsTab state={state} />}
      </main>
    </div>
  );
}

function learningAttempts(state: AppState) {
  return state.attempts.filter((a) => a.mode !== 'arena');
}

function recommendations(state: AppState): SkillId[] {
  const stats = allSkillStats(state).filter((s) => s.total > 0);
  const weak = stats.filter((s) => s.mastery < 0.75).sort((a, b) => a.mastery - b.mastery);
  if (weak.length >= 3) return weak.slice(0, 3).map((s) => s.id);
  const upcoming = skillsOf(currentWorld(state)).filter((id) => !weak.some((w) => w.id === id) && (state.skills[id]?.total ?? 0) < 5);
  return [...weak.map((w) => w.id), ...upcoming].slice(0, 3);
}

function Overview({ state }: { state: AppState }) {
  const atts = learningAttempts(state);
  const n = atts.length;
  const ind = atts.filter((a) => a.outcome === 'independent').length;
  const helped = atts.filter((a) => a.outcome === 'hint' || a.outcome === 'guided').length;
  const failed = atts.filter((a) => a.outcome === 'incorrect').length;
  const practiceDays = Object.values(state.days).filter((d) => d.questions > 0).length;
  const seconds = Object.values(state.days).reduce((a, d) => a + d.seconds, 0);
  const ph = phaseOf();
  const recs = recommendations(state);
  const stage = stageOf(state);
  const guessed = state.strategies['I guessed'] ?? 0;
  const strategyTotal = Object.values(state.strategies).reduce((a, b) => a + b, 0);

  return (
    <>
      <section className="stat-row">
        <Stat label="Practice days" value={String(practiceDays)} />
        <Stat label="Questions attempted" value={String(n)} />
        <Stat label="Independent accuracy" value={n ? pct(ind / n) : '—'} hint="Correct on the first try, no help" />
        <Stat label="Hint-assisted accuracy" value={helped + failed ? pct(helped / (helped + failed)) : '—'} hint="Solved after a hint or guided steps" />
        <Stat label="Total study time" value={mins(seconds)} />
      </section>

      <section className="card">
        <h2>Preparation plan</h2>
        <table className="table plan-table">
          <tbody>
            {[
              ['Foundation', SCHEDULE.start, addDays(SCHEDULE.phase2, -1)],
              ['Olympiad Skills', SCHEDULE.phase2, addDays(SCHEDULE.phase3, -1)],
              ['Olympiad Thinking', SCHEDULE.phase3, addDays(SCHEDULE.phase4, -1)],
              ['Final Preparation', SCHEDULE.phase4, addDays(SCHEDULE.castleAppears, 6)],
            ].map(([name, from, to]) => (
              <tr key={name} className={ph.name === name ? 'plan-now' : ''}>
                <th>{name}</th>
                <td>
                  {prettyDate(from)} – {prettyDate(to)}
                </td>
              </tr>
            ))}
            <tr>
              <th>Olympiad</th>
              <td>{prettyDate(EXAM_DATE)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2>Preparation phase</h2>
        <p>
          <b>
            Phase {Math.min(ph.phase, 4)} – {ph.name}
          </b>
          : {ph.focus}.
        </p>
        <p className="muted">
          Current world: {WORLDS.find((w) => w.id === currentWorld(state))!.name} · Crystals: {state.crystals.length}/8 · Dino stage: {STAGE_INFO[stage].name}
        </p>
      </section>

      <section className="card">
        <h2>Recommendations</h2>
        <p>Focus this week:</p>
        <ol>
          {recs.map((id) => (
            <li key={id}>
              <b>{SKILL[id].name}</b> <span className="muted">({WORLDS.find((w) => w.id === SKILL[id].world)!.name})</span>
            </li>
          ))}
        </ol>
        {guessed > 0 && strategyTotal >= 3 && guessed / strategyTotal > 0.3 && (
          <p className="warn">
            ⚠️ Your child said “I guessed” on {guessed} of {strategyTotal} “How did you think?” prompts. Encourage them to explain their thinking out loud.
          </p>
        )}
      </section>

      <section className="card">
        <h2>World progress</h2>
        <div className="world-bars">
          {WORLDS.map((w) => {
            const p = worldProgress(state, w.id);
            return (
              <div key={w.id} className="world-bar">
                <span>
                  {w.emoji} {w.name}
                </span>
                <div className="meter" role="meter" aria-valuenow={Math.round(p * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={`${w.name} progress`}>
                  <span style={{ width: pct(p) }} />
                </div>
                <span className="num">{pct(p)}</span>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="stat" title={hint}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function Skills({ state }: { state: AppState }) {
  const stats = allSkillStats(state);
  return (
    <section className="card">
      <h2>Skill Map</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Skill</th>
            <th className="num">Mastery</th>
            <th>Status</th>
            <th className="num">Attempts</th>
            <th className="num">Independent</th>
            <th>Current level</th>
          </tr>
        </thead>
        {WORLDS.map((w) => (
          <tbody key={w.id}>
            <tr className="group-row">
              <th colSpan={6}>
                {w.emoji} {w.name}
              </th>
            </tr>
            {stats
              .filter((s) => SKILL[s.id].world === w.id)
              .map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td className="num">{s.total ? pct(s.mastery) : '—'}</td>
                  <td>
                    <span className={`status status-${s.status.replace(/\s/g, '-').toLowerCase()}`}>
                      {s.status === 'Strong' ? '✔ ' : s.status === 'Needs Practice' ? '▲ ' : s.status === 'Developing' ? '◐ ' : ''}
                      {s.status}
                    </span>
                  </td>
                  <td className="num">{s.total}</td>
                  <td className="num">{s.total ? pct(s.independent) : '—'}</td>
                  <td>{DIFFICULTY_LABEL[state.skills[s.id]?.level ?? 1]}</td>
                </tr>
              ))}
          </tbody>
        ))}
      </table>
      <p className="muted small">
        Mastery weights recent answers more: independent 1.0, after retry 0.8, with hint 0.6, with guided help 0.35, incorrect 0. A skill counts as mastered at 75% with at least 5 attempts.
      </p>
    </section>
  );
}

function Needs({ state }: { state: AppState }) {
  const stats = allSkillStats(state).filter((s) => s.total > 0);
  const avg = stats.reduce((a, s) => a + s.avgSeconds * s.total, 0) / Math.max(1, stats.reduce((a, s) => a + s.total, 0));
  // Only judge skills with enough evidence; one answer is not a weakness.
  const weakest = stats.filter((s) => s.total >= 3).sort((a, b) => a.mastery - b.mastery).slice(0, 5);
  const repeated = stats.filter((s) => s.failures >= 2).sort((a, b) => b.failures - a.failures);
  const hinty = stats.filter((s) => s.total >= 3 && s.hintRate >= 0.35).sort((a, b) => b.hintRate - a.hintRate);
  const slow = stats.filter((s) => s.total >= 3 && s.avgSeconds > avg * 1.5).sort((a, b) => b.avgSeconds - a.avgSeconds);
  const queue = (Object.entries(state.revision) as [SkillId, NonNullable<AppState['revision'][SkillId]>][]).sort((a, b) => b[1].priority - a[1].priority);
  const tagCounts = new Map<string, { n: number; skills: Set<string> }>();
  for (const m of state.mistakes) {
    if (!m.tag) continue;
    const e = tagCounts.get(m.tag) ?? { n: 0, skills: new Set<string>() };
    e.n++;
    e.skills.add(SKILL[m.skill].name);
    tagCounts.set(m.tag, e);
  }
  const misconceptions = [...tagCounts.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 6);
  const recent = [...state.mistakes].reverse().slice(0, 12);

  if (!stats.length) return <Empty text="No practice yet. Training needs will appear after a few missions." />;
  return (
    <div className="grid-2">
      <ListCard title="Weakest skills" items={weakest.map((s) => [s.name, pct(s.mastery)])} empty="Not enough practice yet (needs 3+ answers per skill)." />
      <ListCard title="Repeated error concepts" items={repeated.map((s) => [s.name, `${s.failures}× failure`])} empty="None – great!" />
      <ListCard title="Concepts needing hints" items={hinty.map((s) => [s.name, `${pct(s.hintRate)} with help`])} empty="None – great!" />
      <ListCard title="Slow-solving topics" items={slow.map((s) => [s.name, `${Math.round(s.avgSeconds)}s avg (overall ${Math.round(avg)}s)`])} empty="None" />
      <section className="card span-2">
        <h2>Likely misconceptions</h2>
        {misconceptions.length ? (
          <ul className="kv">
            {misconceptions.map(([tag, e]) => (
              <li key={tag}>
                <span>
                  <b>{tag}</b> <span className="muted">· {[...e.skills].join(', ')}</span>
                </span>
                <span className="muted">{e.n}×</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No repeated mistake patterns yet.</p>
        )}
        <p className="muted small">Worked out from which wrong answer was chosen, e.g. picking 53 for 36 + 27 means the ten was not carried.</p>
      </section>
      <section className="card span-2">
        <h2>Recent mistakes</h2>
        {recent.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Chose</th>
                <th>Correct</th>
                <th>Why it might have happened</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((m, i) => (
                <tr key={i}>
                  <td>{m.prompt.replace(/\*\*/g, '')}</td>
                  <td>{m.picked}</td>
                  <td>{m.answer === 'done' ? '—' : m.answer}</td>
                  <td className="muted">{m.tag ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted">No mistakes recorded yet.</p>
        )}
      </section>
      <section className="card span-2">
        <h2>Revision queue (Training Camp)</h2>
        {queue.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Skill</th>
                <th className="num">Priority</th>
                <th>Next review</th>
                <th className="num">Interval</th>
                <th className="num">Failures</th>
              </tr>
            </thead>
            <tbody>
              {queue.map(([id, r]) => (
                <tr key={id}>
                  <td>{SKILL[id].name}</td>
                  <td className="num">{r.priority}</td>
                  <td>{r.nextReview}</td>
                  <td className="num">{r.intervalDays}d</td>
                  <td className="num">{r.failureCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted">The queue is empty.</p>
        )}
        <p className="muted small">After 3 failures on a concept, Training Camp drops to the simplest level with visual support instead of repeating the same question.</p>
      </section>
    </div>
  );
}

function ListCard({ title, items, empty = '—' }: { title: string; items: [string, string][]; empty?: string }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {items.length ? (
        <ul className="kv">
          {items.map(([k, v]) => (
            <li key={k}>
              <span>{k}</span>
              <span className="muted">{v}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">{empty}</p>
      )}
    </section>
  );
}

function Activity({ state }: { state: AppState }) {
  const t = today();
  const days = Array.from({ length: 14 }, (_, i) => addDays(t, i - 13));
  const rows = days.map((k) => ({ k, d: state.days[k] }));
  const max = Math.max(5, ...rows.map((r) => r.d?.questions ?? 0));
  const [table, setTable] = useState(false);
  return (
    <>
      <section className="card">
        <div className="card-head">
          <h2>Questions per day · last 14 days</h2>
          <button type="button" className="btn btn-soft" onClick={() => setTable((x) => !x)}>
            {table ? 'Show chart' : 'Show table'}
          </button>
        </div>
        {table ? (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th className="num">Questions</th>
                <th className="num">Time</th>
                <th className="num">Missions</th>
                <th className="num">Camps</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ k, d }) => (
                <tr key={k}>
                  <td>{k}</td>
                  <td className="num">{d?.questions ?? 0}</td>
                  <td className="num">{d ? mins(d.seconds) : '—'}</td>
                  <td className="num">{d?.missions ?? 0}</td>
                  <td className="num">{d?.camps ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="bar-chart" role="img" aria-label="Bar chart of questions answered per day over the last 14 days">
            <div className="bar-grid">
              {[1, 0.5, 0].map((f) => (
                <span key={f} style={{ bottom: `${f * 100}%` }}>
                  {Math.round(max * f)}
                </span>
              ))}
            </div>
            {rows.map(({ k, d }) => {
              const q = d?.questions ?? 0;
              return (
                <div key={k} className="bar-col" tabIndex={0}>
                  <div className="bar" style={{ height: `${(q / max) * 100}%` }} />
                  <span className="bar-label">{k.slice(8)}</span>
                  <span className="bar-tip" role="tooltip">
                    <b>{k}</b>
                    <br />
                    {q} questions · {d ? mins(d.seconds) : '0s'}
                    <br />
                    {d?.missions ?? 0} missions, {d?.camps ?? 0} camps
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <p className="muted small">Target: one 10–15 minute session a day. Missing a day is fine – there are no streaks to break.</p>
      </section>
      <section className="card">
        <h2>Recent missions</h2>
        {state.missions.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>World</th>
                <th className="num">Questions</th>
                <th className="num">Independent</th>
                <th className="num">Time</th>
              </tr>
            </thead>
            <tbody>
              {[...state.missions].reverse().slice(0, 15).map((m, i) => (
                <tr key={i}>
                  <td>{m.date}</td>
                  <td>{WORLDS.find((w) => w.id === m.world)!.name}</td>
                  <td className="num">{m.questions}</td>
                  <td className="num">{m.independent}</td>
                  <td className="num">{mins(m.seconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted">No missions yet.</p>
        )}
      </section>
    </>
  );
}

function Mocks({ state }: { state: AppState }) {
  if (!state.mocks.length) return <Empty text={`No mock exams yet. The Olympiad Arena opens on ${prettyDate(SCHEDULE.phase2)} (or enable it in Settings).`} />;
  return (
    <>
      {[...state.mocks].reverse().map((m, i) => {
        const wrongSkills = [...new Set(m.items.filter((x) => x.answered && !x.correct).map((x) => SKILL[x.skill].name))];
        const careless = m.items.filter((x) => x.careless).length;
        const unanswered = m.items.filter((x) => !x.answered).length;
        const slow = m.items.filter((x) => x.seconds > x.estSeconds * 2).length;
        return (
          <section className="card" key={i}>
            <h2>
              {m.kind === 'full' ? 'Full mock' : 'Practice battle'} · {m.date}
            </h2>
            <div className="stat-row">
              <Stat label="Score" value={`${m.score}/${m.maxScore}`} />
              <Stat label="Accuracy" value={pct(m.correct / m.total)} />
              <Stat label="Time" value={mins(m.seconds)} />
              <Stat label="Careless errors" value={String(careless)} hint="Quick wrong answers on usually-strong skills" />
              <Stat label="Unanswered" value={String(unanswered)} />
              <Stat label="Took too long" value={String(slow)} hint="More than 2× the expected time" />
            </div>
            {wrongSkills.length > 0 && (
              <p>
                <b>Weak concepts:</b> {wrongSkills.join(', ')}
              </p>
            )}
          </section>
        );
      })}
    </>
  );
}

function SettingsTab({ state }: { state: AppState }) {
  const [name, setName] = useState(state.childName);
  const [date, setDate] = useState(getDateOverride() ?? '');
  const [importError, setImportError] = useState(false);
  const s = state.settings;
  return (
    <div className="grid-2">
      <section className="card">
        <h2>Child & sound</h2>
        <label className="field">
          Child’s name
          <input value={name} onChange={(e) => setName(e.target.value)} onBlur={() => update((d) => void (d.childName = name.trim().slice(0, 20)))} maxLength={20} />
        </label>
        <label className="check">
          <input type="checkbox" checked={s.sound} onChange={(e) => update((d) => void (d.settings.sound = e.target.checked))} /> Sound on
        </label>
        <label className="check">
          <input type="checkbox" checked={s.autoRead !== false} onChange={(e) => update((d) => void (d.settings.autoRead = e.target.checked))} /> Read word problems aloud
          automatically
        </label>
      </section>
      <section className="card">
        <h2>Access</h2>
        <label className="check">
          <input type="checkbox" checked={s.unlockAll} onChange={(e) => update((d) => void (d.settings.unlockAll = e.target.checked))} /> Let my child choose any world
        </label>
        <label className="field">
          Olympiad Arena
          <select value={s.arena} onChange={(e) => update((d) => void (d.settings.arena = e.target.value as AppState['settings']['arena']))}>
            <option value="auto">Automatic (opens {prettyDate(SCHEDULE.phase2)})</option>
            <option value="on">Always available</option>
            <option value="off">Hidden</option>
          </select>
        </label>
      </section>
      <section className="card">
        <h2>Preview a date</h2>
        <p className="muted small">See how the plan changes closer to the Olympiad (phases, castle, final-week missions). Leave blank to use today’s real date.</p>
        <div className="row">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <button
            type="button"
            className="btn btn-soft"
            onClick={() => {
              setDateOverride(date || null);
              update(() => {});
            }}
          >
            Apply
          </button>
          <button
            type="button"
            className="btn btn-soft"
            onClick={() => {
              setDate('');
              setDateOverride(null);
              update(() => {});
            }}
          >
            Use real date
          </button>
        </div>
        {getDateOverride() && <p className="warn small">Previewing {getDateOverride()}. Progress you make is still saved.</p>}
      </section>
      <section className="card">
        <h2>Data</h2>
        <p className="muted small">Progress is stored only in this browser.</p>
        <div className="row">
          <button
            type="button"
            className="btn btn-soft"
            onClick={() => downloadBackup(state)}
          >
            Export progress
          </button>
          <label className="btn btn-soft">
            Import
            <input
              type="file"
              accept="application/json"
              hidden
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  const data = JSON.parse(await f.text());
                  if (data.version !== 1) throw new Error('bad version');
                  replaceState({ ...initialState(), ...data });
                  setImportError(false);
                } catch {
                  setImportError(true);
                }
                e.target.value = '';
              }}
            />
          </label>
        </div>
      </section>
      {importError && <p className="warn small span-2">That file is not a Mathosaur progress file.</p>}
      <ClearProgress state={state} />
      <section className="card span-2">
        <h2>Skills covered</h2>
        <p className="muted small">
          {SKILLS.length} skills across 8 worlds, following the IMO Class 2 syllabus (numbers to 100, two-digit addition and subtraction, with three-digit stretch
          questions at the top level only). Each skill has 5 invisible difficulty levels (Explorer → Boss Puzzle), and questions are generated fresh every time.
          Mock exams follow the sample paper: 50 questions in 60 minutes (20 Logical Reasoning, 20 Mathematical Reasoning, 10 Everyday Mathematics).
        </p>
        <p className="small">
          <Link to="/">← Back to the game</Link>
        </p>
      </section>
    </div>
  );
}

function downloadBackup(state: AppState) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `mathosaur-${state.childName || 'progress'}-${today()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** Two-step "clear everything" so it can't happen by accident. */
function ClearProgress({ state }: { state: AppState }) {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [sure, setSure] = useState(false);
  const answered = state.attempts.length;
  const days = Object.values(state.days).filter((d) => d.questions > 0).length;
  return (
    <section className="card span-2 danger-card">
      <h2>🗑️ Clear progress on this device</h2>
      <p className="muted small">
        Removes everything saved in this browser: {state.childName ? `${state.childName}’s` : 'the'} name, stars, eggs, dinos, skill progress, mistakes and mock results
        ({answered} answers over {days} {days === 1 ? 'day' : 'days'}). Use this to start fresh or hand the device to another child.
      </p>
      {!open ? (
        <button type="button" className="btn btn-danger" onClick={() => setOpen(true)}>
          Clear progress…
        </button>
      ) : (
        <div className="danger-confirm">
          <p>
            <b>This cannot be undone.</b> Download a backup first if you might want this progress back later.
          </p>
          <div className="row">
            <button type="button" className="btn btn-soft" onClick={() => downloadBackup(state)}>
              ⬇ Download backup
            </button>
          </div>
          <label className="check">
            <input type="checkbox" checked={sure} onChange={(e) => setSure(e.target.checked)} /> Yes, delete all progress on this device
          </label>
          <div className="row">
            <button
              type="button"
              className="btn btn-danger-solid"
              disabled={!sure}
              onClick={() => {
                clearProgress();
                nav('/', { replace: true });
              }}
            >
              Clear everything
            </button>
            <button
              type="button"
              className="btn btn-soft"
              onClick={() => {
                setOpen(false);
                setSure(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <section className="card">
      <p className="muted">{text}</p>
    </section>
  );
}
