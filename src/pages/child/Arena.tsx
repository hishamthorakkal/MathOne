import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SKILL, type Section } from '../../engine/catalog';
import { daysToExam, today } from '../../engine/dates';
import { masteryOf, recordOutcome } from '../../engine/mastery';
import { buildMock, MOCK_SHAPE, type MockQuestion } from '../../engine/session';
import { getState, update } from '../../engine/store';
import type { MockQuestionResult, MockResult, SkillId } from '../../engine/types';
import { RichText } from '../../components/RichText';
import { VisualView } from '../../components/Visuals';

type Kind = 'mini' | 'full';

export function Arena() {
  const [exam, setExam] = useState<{ kind: Kind; qs: MockQuestion[] } | null>(null);
  const [result, setResult] = useState<{ res: MockResult; qs: MockQuestion[]; answers: (string | null)[] } | null>(null);

  if (result) return <ArenaResult {...result} onAgain={() => setResult(null)} />;
  if (exam)
    return (
      <Exam
        kind={exam.kind}
        qs={exam.qs}
        onSubmit={(res, answers) => {
          setResult({ res, qs: exam.qs, answers });
          setExam(null);
        }}
      />
    );

  const left = daysToExam();
  return (
    <div className="screen arena arena-lobby">
      <header className="page-head">
        <Link to="/" className="btn btn-ghost">
          ← Home
        </Link>
        <h1>🏆 Olympiad Arena</h1>
        <span />
      </header>
      <p className="lead">Exam practice: no hints, a real timer, and questions just like the Olympiad. You can flag questions and come back to them.</p>
      {left === 3 && <div className="banner-note">⚔️ Today is the day for the Major Mock Battle! Try the full Olympiad mock.</div>}
      <div className="arena-choices">
        {(['mini', 'full'] as Kind[]).map((k) => {
          const shape = MOCK_SHAPE[k];
          const total = Object.values(shape.sections).reduce((a, b) => a + b, 0);
          return (
            <div key={k} className="arena-card">
              <h2>{k === 'mini' ? 'Practice Battle' : 'Full Olympiad Mock'}</h2>
              <p>
                {total} questions · {shape.minutes} minutes
              </p>
              <ul className="small">
                {Object.entries(shape.sections).map(([s, n]) => (
                  <li key={s}>
                    {s}: {n}
                  </li>
                ))}
              </ul>
              <button type="button" className="btn btn-primary btn-big" onClick={() => setExam({ kind: k, qs: buildMock(k) })}>
                Start
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Exam({ kind, qs, onSubmit }: { kind: Kind; qs: MockQuestion[]; onSubmit: (r: MockResult, answers: (string | null)[]) => void }) {
  const limit = MOCK_SHAPE[kind].minutes * 60;
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(() => qs.map(() => null));
  const [flags, setFlags] = useState<boolean[]>(() => qs.map(() => false));
  const [remaining, setRemaining] = useState(limit);
  const times = useRef<number[]>(qs.map(() => 0));
  const shownAt = useRef(Date.now());
  const started = useRef(Date.now());
  const submitted = useRef(false);

  const stamp = () => {
    const now = Date.now();
    times.current[idx] += (now - shownAt.current) / 1000;
    shownAt.current = now;
  };
  const go = (i: number) => {
    stamp();
    setIdx(Math.max(0, Math.min(qs.length - 1, i)));
  };

  const submit = () => {
    if (submitted.current) return;
    submitted.current = true;
    stamp();
    const s = getState();
    const items: MockQuestionResult[] = qs.map((m, i) => {
      const answered = answers[i] != null;
      const correct = answers[i] === m.q.answer;
      const seconds = Math.round(times.current[i]);
      return {
        skill: m.q.skill,
        section: m.section,
        correct,
        answered,
        seconds,
        estSeconds: m.q.estSeconds,
        // Fast wrong answers on skills the child is usually good at.
        careless: answered && !correct && seconds < m.q.estSeconds * 0.4 && masteryOf(s.skills[m.q.skill]) >= 0.6,
      };
    });
    const score = qs.reduce((a, m, i) => a + (items[i].correct ? m.marks : 0), 0);
    const res: MockResult = {
      date: today(),
      kind,
      score,
      maxScore: qs.reduce((a, m) => a + m.marks, 0),
      correct: items.filter((x) => x.correct).length,
      total: qs.length,
      seconds: Math.round((Date.now() - started.current) / 1000),
      items,
    };
    update((d) => {
      d.mocks.push(res);
      items.forEach((it, i) => {
        if (it.answered) recordOutcome(d, it.skill, qs[i].q.difficulty, it.correct ? 'independent' : 'incorrect', it.seconds, 'arena');
      });
    });
    onSubmit(res, answers);
  };

  useEffect(() => {
    const id = setInterval(() => {
      const r = limit - Math.floor((Date.now() - started.current) / 1000);
      setRemaining(r);
      if (r <= 0) submit();
    }, 1000);
    return () => clearInterval(id);
  });

  const m = qs[idx];
  const mm = Math.max(0, Math.floor(remaining / 60));
  const ss = Math.max(0, remaining % 60);
  const answeredCount = answers.filter((a) => a != null).length;

  return (
    <div className="screen arena exam">
      <header className="exam-head">
        <b>OLYMPIAD ARENA</b>
        <span>
          Question {idx + 1} / {qs.length}
        </span>
        <span className={`timer ${remaining < 120 ? 'timer-low' : ''}`} aria-label="Time left">
          ⏱ {mm}:{String(ss).padStart(2, '0')}
        </span>
      </header>
      <div className="exam-section">{m.section}</div>
      <div className="exam-q">
        <h2>
          <RichText text={m.q.prompt} />
        </h2>
        {m.q.data?.type === 'mystery' && (
          <ul className="exam-clues">
            {m.q.data.clues.map((c, i) => (
              <li key={i}>
                <RichText text={c} />
              </li>
            ))}
          </ul>
        )}
        {m.q.data?.type === 'pattern' && <div className="exam-pattern">{m.q.data.items.join('  ')}</div>}
        {m.q.data?.type === 'train' && <div className="exam-pattern">{m.q.data.seq.map((x) => x ?? '?').join(' → ')}</div>}
        {m.q.visual && <VisualView v={m.q.visual} />}
        <div className="exam-options">
          {m.q.options.map((o, i) => (
            <button
              type="button"
              key={o}
              className={`exam-option ${answers[idx] === o ? 'exam-picked' : ''}`}
              onClick={() => setAnswers((a) => a.map((x, j) => (j === idx ? o : x)))}
            >
              <span className="opt-letter">{'ABCD'[i]}.</span> {o}
            </button>
          ))}
        </div>
      </div>
      <div className="exam-nav">
        <button type="button" className="btn btn-soft" onClick={() => go(idx - 1)} disabled={idx === 0}>
          ◀ Back
        </button>
        <button type="button" className={`btn ${flags[idx] ? 'btn-flagged' : 'btn-soft'}`} onClick={() => setFlags((f) => f.map((x, j) => (j === idx ? !x : x)))}>
          🚩 {flags[idx] ? 'Flagged' : 'Flag'}
        </button>
        {idx < qs.length - 1 ? (
          <button type="button" className="btn btn-primary" onClick={() => go(idx + 1)}>
            Next ▶
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => window.confirm(`Submit? You answered ${answeredCount} of ${qs.length}.`) && submit()}
          >
            Submit ✔
          </button>
        )}
      </div>
      <div className="palette" aria-label="Question palette">
        {qs.map((_, i) => (
          <button
            type="button"
            key={i}
            className={`pal ${i === idx ? 'pal-now' : ''} ${answers[i] != null ? 'pal-done' : ''} ${flags[i] ? 'pal-flag' : ''}`}
            onClick={() => go(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="link"
        onClick={() => window.confirm(`Submit now? You answered ${answeredCount} of ${qs.length}.`) && submit()}
      >
        Finish and submit
      </button>
    </div>
  );
}

function ArenaResult({ res, qs, answers, onAgain }: { res: MockResult; qs: MockQuestion[]; answers: (string | null)[]; onAgain: () => void }) {
  const [review, setReview] = useState(false);
  const bySkill = new Map<SkillId, { c: number; n: number }>();
  res.items.forEach((it) => {
    const e = bySkill.get(it.skill) ?? { c: 0, n: 0 };
    e.n++;
    if (it.correct) e.c++;
    bySkill.set(it.skill, e);
  });
  const ranked = [...bySkill.entries()].sort((a, b) => b[1].c / b[1].n - a[1].c / a[1].n || b[1].n - a[1].n);
  const strongest = ranked[0];
  const weakest = [...ranked].reverse().find(([, v]) => v.c < v.n);
  const sections = new Map<Section, { c: number; n: number }>();
  qs.forEach((m, i) => {
    const e = sections.get(m.section) ?? { c: 0, n: 0 };
    e.n++;
    if (res.items[i].correct) e.c++;
    sections.set(m.section, e);
  });

  return (
    <div className="screen arena center-col">
      <h1>🦖 Great Battle!</h1>
      <div className="reward-row">
        <div className="reward-card">
          <span className="big">
            {res.score}/{res.maxScore}
          </span>
          <span>Score</span>
        </div>
        <div className="reward-card">
          <span className="big">
            {Math.floor(res.seconds / 60)}m {res.seconds % 60}s
          </span>
          <span>Time</span>
        </div>
      </div>
      {strongest && (
        <p className="lead">
          💪 Strongest Power: <b>{SKILL[strongest[0]].name}</b>
        </p>
      )}
      {weakest && (
        <p className="lead">
          🎯 Practise Next: <b>{SKILL[weakest[0]].name}</b>
        </p>
      )}
      <table className="table section-table">
        <tbody>
          {[...sections.entries()].map(([s, v]) => (
            <tr key={s}>
              <th>{s}</th>
              <td>
                {v.c} / {v.n}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="row-center">
        <button type="button" className="btn btn-soft" onClick={() => setReview((r) => !r)}>
          {review ? 'Hide answers' : '🔍 Review answers'}
        </button>
        <button type="button" className="btn btn-soft" onClick={onAgain}>
          🏆 Arena
        </button>
        <Link to="/" className="btn btn-primary">
          🏠 Home
        </Link>
      </div>
      {review && (
        <ol className="review-list">
          {qs.map((m, i) => (
            <li key={i} className={res.items[i].correct ? 'rev-right' : 'rev-wrong'}>
              <RichText text={m.q.prompt} />
              {m.q.data?.type === 'mystery' && <span className="small"> ({m.q.data.clues.map((c) => c.replace(/\*\*/g, '')).join(' ')})</span>}
              <div className="small">
                Your answer: <b>{answers[i] ?? '—'}</b> · Correct: <b>{m.q.answer}</b>
              </div>
              {!res.items[i].correct && <div className="small">💡 {m.q.steps.join(' ')}</div>}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
