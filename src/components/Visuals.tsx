import type { ShapeName, Visual } from '../engine/types';

export function VisualView({ v }: { v: Visual }) {
  switch (v.kind) {
    case 'clock':
      return <Clock h={v.h} m={v.m} />;
    case 'shape':
      return (
        <div className="visual-center">
          <ShapeSvg shape={v.shape} size={150} />
        </div>
      );
    case 'shapes':
      return (
        <div className="shape-grid">
          {v.items.map((s, i) => (
            <ShapeSvg key={i} shape={s} size={52} color={PALETTE[i % PALETTE.length]} />
          ))}
        </div>
      );
    case 'pictograph':
      return (
        <table className="pictograph">
          <tbody>
            {v.rows.map((r) => (
              <tr key={r.label}>
                <th>{r.label}</th>
                <td>{v.icon.repeat(r.count / v.key)}</td>
              </tr>
            ))}
          </tbody>
          <caption>
            Key: {v.icon} = {v.key} {v.key === 1 ? 'fruit' : 'fruits'}
          </caption>
        </table>
      );
    case 'blocks':
      return v.numbers.length ? (
        <div className="blocks-row">
          {v.numbers.map((n, i) => (
            <Blocks key={i} n={n} hideLabel={v.hideLabel} />
          ))}
        </div>
      ) : null;
    case 'objects':
      return (
        <div className="objects" aria-label="Picture of the objects">
          {v.parts.map((p, i) => (
            <span key={i} className="objects-part">
              {i > 0 && v.op && <span className="objects-op">{v.op}</span>}
              <span className="objects-group">
                {Array.from({ length: p.n }, (_, j) => (
                  <span key={j} className={p.crossed && j >= p.n - p.crossed ? 'obj-crossed' : ''}>
                    {p.icon}
                  </span>
                ))}
              </span>
            </span>
          ))}
        </div>
      );
    case 'numberline':
      return <NumberLine from={v.from} to={v.to} step={v.step} />;
    case 'regroup':
      return <Regroup n={v.n} />;
    case 'abacus':
      return <Abacus h={v.h} t={v.t} o={v.o} />;
    case 'thermometer':
      return <Thermometer value={v.value} />;
    case 'venn':
      return (
        <div className="venn" role="img" aria-label={`Venn diagram: ${v.left} and ${v.right}`}>
          <div className="venn-circle venn-left" />
          <div className="venn-circle venn-right" />
          <span className="venn-label venn-label-left">{v.left}</span>
          <span className="venn-label venn-label-right">{v.right}</span>
          <div className="venn-region venn-lo">
            {v.leftOnly.map((x, i) => (
              <span key={i}>{x}</span>
            ))}
          </div>
          <div className="venn-region venn-both">
            {v.both.map((x, i) => (
              <span key={i}>{x}</span>
            ))}
          </div>
          <div className="venn-region venn-ro">
            {v.rightOnly.map((x, i) => (
              <span key={i}>{x}</span>
            ))}
          </div>
        </div>
      );
    case 'grid':
      return (
        <div className={`grid-visual ${v.compass ? 'grid-compass' : ''}`}>
          {v.compass && <span className="compass-n">North ⬆</span>}
          {v.compass && <span className="compass-s">South ⬇</span>}
          {v.compass && <span className="compass-w">⬅ West</span>}
          {v.compass && <span className="compass-e">East ➡</span>}
          <div className="grid-cells" style={{ gridTemplateColumns: `repeat(${v.cols}, 1fr)` }}>
            {v.cells.map((c, i) => (
              <span key={i} className="grid-cell">
                {c}
              </span>
            ))}
          </div>
        </div>
      );
    case 'row':
      return (
        <div className="obj-row">
          <span className="row-label">First ➡</span>
          {v.items.map((x, i) => (
            <span key={i} className="row-item">
              {x}
            </span>
          ))}
          <span className="row-label">⬅ Last</span>
        </div>
      );
    case 'fold':
      return (
        <div className="fold-row">
          {v.items.map((x, i) => (
            <span key={i} className="fold-letter">
              {x}
            </span>
          ))}
        </div>
      );
    case 'groups':
      return (
        <div className="groups">
          {Array.from({ length: v.groups }, (_, g) => (
            <div className="nest" key={g}>
              {v.icon.repeat(v.each)}
            </div>
          ))}
        </div>
      );
    case 'emoji':
      return <div className="visual-emoji">{v.text}</div>;
  }
}

const PALETTE = ['#4b7be5', '#e8603c', '#3fae5a', '#f2b233', '#8b5cf6', '#14a39a'];

export function Blocks({ n, hideLabel = false }: { n: number; hideLabel?: boolean }) {
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const o = n % 10;
  return (
    <figure className="blocks" aria-label={hideLabel ? 'Place value blocks' : `${n} = ${h ? `${h} hundreds, ` : ''}${t} tens and ${o} ones`}>
      <div className="blocks-pieces">
        {Array.from({ length: h }, (_, i) => (
          <span key={`h${i}`} className="block-hundred" />
        ))}
        {Array.from({ length: t }, (_, i) => (
          <span key={`t${i}`} className="block-ten" />
        ))}
        <span className="block-ones">
          {Array.from({ length: o }, (_, i) => (
            <span key={`o${i}`} className="block-one" />
          ))}
        </span>
      </div>
      {hideLabel ? (
        <figcaption className="small">Rod = 10 · Cube = 1</figcaption>
      ) : (
        <figcaption>
          <b>{n}</b> = {h ? `${h} hundreds + ` : ''}
          {t} tens + {o} ones
        </figcaption>
      )}
    </figure>
  );
}

/** Number line with jump arcs from `from` to `to` in steps of `step`. */
export function NumberLine({ from, to, step }: { from: number; to: number; step: number }) {
  const s = Math.abs(step) || 1;
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  const min = Math.max(0, lo - s);
  const max = hi + s;
  const ticks: number[] = [];
  for (let x = min; x <= max; x += s) ticks.push(x);
  if (ticks.length > 16) return null;
  const W = 600;
  const X = (v: number) => 30 + ((v - min) / (max - min || 1)) * (W - 60);
  const dir = to >= from ? 1 : -1;
  const jumps: number[] = [];
  for (let x = from; dir > 0 ? x < to : x > to; x += dir * s) jumps.push(x);
  return (
    <div className="visual-center">
      <svg viewBox={`0 0 ${W} 110`} width="100%" style={{ maxWidth: W }} role="img" aria-label={`Number line from ${from} to ${to} in jumps of ${s}`}>
        <defs>
          <marker id="nl-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="#e8603c" />
          </marker>
        </defs>
        <line x1="14" y1="70" x2={W - 14} y2="70" stroke="#1f2a44" strokeWidth="3" />
        {ticks.map((x) => (
          <g key={x}>
            <line x1={X(x)} y1="62" x2={X(x)} y2="78" stroke="#1f2a44" strokeWidth="2" />
            <text x={X(x)} y="100" textAnchor="middle" fontSize="18" fontWeight={x === from || x === to ? 800 : 500} fill={x === to ? '#1f7a41' : '#1f2a44'}>
              {x}
            </text>
          </g>
        ))}
        {jumps.map((x, i) => {
          const x1 = X(x);
          const x2 = X(x + dir * s);
          return <path key={i} d={`M${x1} 62 Q${(x1 + x2) / 2} 22 ${x2} 62`} fill="none" stroke="#e8603c" strokeWidth="3" markerEnd="url(#nl-arrow)" />;
        })}
      </svg>
    </div>
  );
}

/** Shows breaking one ten into ten ones, for subtraction with borrowing. */
export function Regroup({ n }: { n: number }) {
  const t = Math.floor(n / 10);
  const o = n % 10;
  return (
    <div className="regroup">
      <Blocks n={n} />
      <span className="regroup-arrow">➡ break 1 ten ➡</span>
      <figure className="blocks">
        <div className="blocks-pieces">
          {Array.from({ length: t - 1 }, (_, i) => (
            <span key={i} className="block-ten" />
          ))}
          <span className="block-ones block-ones-wide">
            {Array.from({ length: o + 10 }, (_, i) => (
              <span key={i} className={`block-one ${i >= o ? 'block-new' : ''}`} />
            ))}
          </span>
        </div>
        <figcaption>
          <b>{n}</b> = {t - 1} tens + {o + 10} ones
        </figcaption>
      </figure>
    </div>
  );
}

export function Abacus({ h, t, o }: { h: number; t: number; o: number }) {
  const rods: [string, number][] = h > 0 ? [['H', h], ['T', t], ['O', o]] : [['T', t], ['O', o]];
  const W = rods.length * 90 + 20;
  const colors = ['#e8603c', '#4b7be5', '#3fae5a'];
  return (
    <div className="visual-center">
      <svg viewBox={`0 0 ${W} 220`} width={W} role="img" aria-label="Abacus">
        <rect x="6" y="186" width={W - 12} height="26" rx="6" fill="#c8a06a" />
        {rods.map(([label, n], i) => {
          const x = 55 + i * 90;
          return (
            <g key={label}>
              <line x1={x} y1="20" x2={x} y2="186" stroke="#555" strokeWidth="4" />
              {Array.from({ length: n }, (_, b) => (
                <ellipse key={b} cx={x} cy={176 - b * 16} rx="24" ry="8" fill={colors[(i + 3 - rods.length) % 3]} stroke="#333" strokeWidth="1.5" />
              ))}
              <text x={x} y="206" textAnchor="middle" fontWeight="800" fontSize="16" fill="#3b2a12">
                {label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function Thermometer({ value }: { value: number }) {
  const top = 20;
  const bottom = 220;
  const Y = (v: number) => bottom - (v / 50) * (bottom - top);
  return (
    <div className="visual-center">
      <svg viewBox="0 0 140 270" width="130" role="img" aria-label="Thermometer">
        <rect x="52" y="10" width="26" height="220" rx="13" fill="#fff" stroke="#555" strokeWidth="3" />
        <rect x="58" y={Y(value)} width="14" height={bottom - Y(value) + 14} fill="#e63946" />
        <circle cx="65" cy="240" r="20" fill="#e63946" stroke="#555" strokeWidth="3" />
        {Array.from({ length: 11 }, (_, i) => i * 5).map((v) => (
          <g key={v}>
            <line x1="78" y1={Y(v)} x2={v % 10 === 0 ? 94 : 88} y2={Y(v)} stroke="#333" strokeWidth="2" />
            {v % 10 === 0 && (
              <text x="98" y={Y(v) + 5} fontSize="14" fontWeight="700" fill="#333">
                {v}
              </text>
            )}
          </g>
        ))}
        <text x="20" y="24" fontSize="14" fontWeight="800" fill="#333">
          °C
        </text>
      </svg>
    </div>
  );
}

export function Clock({ h, m, size = 190 }: { h: number; m: number; size?: number }) {
  const minAngle = m * 6;
  const hourAngle = ((h % 12) + m / 60) * 30;
  return (
    <div className="visual-center">
      <svg viewBox="0 0 200 200" width={size} height={size} role="img" aria-label="Clock face">
        <circle cx="100" cy="100" r="92" fill="#fffdf5" stroke="#8b5cf6" strokeWidth="8" />
        {Array.from({ length: 60 }, (_, i) => (
          <line
            key={i}
            x1="100"
            y1={i % 5 === 0 ? 16 : 14}
            x2="100"
            y2={i % 5 === 0 ? 26 : 20}
            stroke={i % 5 === 0 ? '#444' : '#bbb'}
            strokeWidth={i % 5 === 0 ? 3 : 1.5}
            transform={`rotate(${i * 6} 100 100)`}
          />
        ))}
        {Array.from({ length: 12 }, (_, i) => {
          const a = ((i + 1) * 30 * Math.PI) / 180;
          return (
            <text key={i} x={100 + 62 * Math.sin(a)} y={100 - 62 * Math.cos(a) + 7} textAnchor="middle" fontSize="20" fontWeight="700" fill="#333">
              {i + 1}
            </text>
          );
        })}
        <line x1="100" y1="100" x2="100" y2="54" stroke="#e8603c" strokeWidth="8" strokeLinecap="round" transform={`rotate(${hourAngle} 100 100)`} />
        <line x1="100" y1="100" x2="100" y2="28" stroke="#4b7be5" strokeWidth="5" strokeLinecap="round" transform={`rotate(${minAngle} 100 100)`} />
        <circle cx="100" cy="100" r="7" fill="#333" />
      </svg>
    </div>
  );
}

export function ShapeSvg({ shape, size = 100, color = '#4b7be5' }: { shape: ShapeName; size?: number; color?: string }) {
  const stroke = '#1e2a4a';
  const poly = (n: number, rot = -90) =>
    Array.from({ length: n }, (_, i) => {
      const a = ((rot + (360 / n) * i) * Math.PI) / 180;
      return `${50 + 42 * Math.cos(a)},${52 + 42 * Math.sin(a)}`;
    }).join(' ');
  let el: JSX.Element;
  switch (shape) {
    case 'circle':
      el = <circle cx="50" cy="50" r="42" />;
      break;
    case 'oval':
      el = <ellipse cx="50" cy="50" rx="44" ry="28" />;
      break;
    case 'square':
      el = <rect x="12" y="12" width="76" height="76" />;
      break;
    case 'rectangle':
      el = <rect x="6" y="26" width="88" height="48" />;
      break;
    case 'triangle':
      el = <polygon points={poly(3)} />;
      break;
    case 'pentagon':
      el = <polygon points={poly(5)} />;
      break;
    case 'hexagon':
      el = <polygon points={poly(6, 0)} />;
      break;
  }
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={shape}>
      <g fill={color} fillOpacity="0.85" stroke={stroke} strokeWidth="4" strokeLinejoin="round">
        {el}
      </g>
    </svg>
  );
}
