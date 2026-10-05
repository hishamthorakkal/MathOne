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
            <Blocks key={i} n={n} />
          ))}
        </div>
      ) : null;
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

export function Blocks({ n }: { n: number }) {
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const o = n % 10;
  return (
    <figure className="blocks" aria-label={`${n} = ${h ? `${h} hundreds, ` : ''}${t} tens and ${o} ones`}>
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
      <figcaption>
        <b>{n}</b> = {h ? `${h} hundreds + ` : ''}
        {t} tens + {o} ones
      </figcaption>
    </figure>
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
