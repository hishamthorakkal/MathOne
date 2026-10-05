import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const KEY = 'mathosaur:parentPass';
const VALID_MS = 15 * 60 * 1000;

export const hasParentPass = () => {
  const t = Number(sessionStorage.getItem(KEY) ?? 0);
  return Date.now() - t < VALID_MS;
};
export const clearParentPass = () => sessionStorage.removeItem(KEY);

/** Hold for 3 seconds, then solve a small adult prompt. */
export function ParentGate() {
  const nav = useNavigate();
  const [progress, setProgress] = useState(0);
  const [held, setHeld] = useState(false);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(false);
  const timer = useRef<number | null>(null);
  const [puzzle] = useState(() => {
    const a = 11 + Math.floor(Math.random() * 9);
    const b = 3 + Math.floor(Math.random() * 6);
    const c = 10 + Math.floor(Math.random() * 40);
    return { text: `${a} × ${b} + ${c}`, value: a * b + c };
  });

  useEffect(() => {
    if (hasParentPass()) nav('/parent/dashboard', { replace: true });
  }, [nav]);

  const startHold = () => {
    if (held || timer.current) return;
    const t0 = Date.now();
    timer.current = window.setInterval(() => {
      const p = Math.min(1, (Date.now() - t0) / 3000);
      setProgress(p);
      if (p >= 1) {
        stopHold();
        setHeld(true);
      }
    }, 50);
  };
  const stopHold = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setProgress((p) => (p >= 1 ? 1 : 0));
  };

  return (
    <div className="screen center-col parent-gate">
      <h1>👨‍👩‍👧 Grown-ups only</h1>
      {!held ? (
        <>
          <p className="lead">Press and hold the button for 3 seconds.</p>
          <button
            type="button"
            className="hold-btn"
            style={{ ['--p' as string]: `${progress * 360}deg` }}
            onPointerDown={startHold}
            onPointerUp={stopHold}
            onPointerLeave={stopHold}
            onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && startHold()}
            onKeyUp={stopHold}
            onContextMenu={(e) => e.preventDefault()}
          >
            <span>🔒 Hold</span>
          </button>
        </>
      ) : (
        <form
          className="welcome-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (Number(answer) === puzzle.value) {
              sessionStorage.setItem(KEY, String(Date.now()));
              nav('/parent/dashboard', { replace: true });
            } else setError(true);
          }}
        >
          <label htmlFor="gate">What is {puzzle.text}?</label>
          <input id="gate" inputMode="numeric" value={answer} onChange={(e) => setAnswer(e.target.value.replace(/\D/g, ''))} autoFocus autoComplete="off" />
          {error && <p className="small error">That’s not right – try again.</p>}
          <button className="btn btn-primary" type="submit">
            Enter
          </button>
        </form>
      )}
      <Link to="/" className="link">
        ← Back to the game
      </Link>
    </div>
  );
}
