import { useState } from 'react';
import { Link } from 'react-router-dom';
import { play } from '../../engine/audio';
import { BADGES, COSMETICS, DINOS, HATCH_COST, WORLDS } from '../../engine/catalog';
import { dinoReady, STAGE_INFO, stageOf } from '../../engine/mastery';
import { hatch } from '../../engine/rewards';
import { update, useAppState } from '../../engine/store';
import type { BadgeId, DinoId } from '../../engine/types';
import { Dino } from '../../components/Dino';
import { useCompanion } from '../../components/useCompanion';

const STAGES = ['egg', 'baby', 'explorer', 'champion', 'olympiad'] as const;

export function Dinos() {
  const state = useAppState();
  const companion = useCompanion();
  const stage = stageOf(state);
  const [hatching, setHatching] = useState<DinoId | null>(null);

  const doHatch = (id: DinoId) => {
    let ok = false;
    update((d) => void (ok = hatch(d, id)));
    if (ok) {
      play('hatch');
      setHatching(id);
      setTimeout(() => setHatching(null), 1800);
    }
  };

  return (
    <div className="screen dinos-screen">
      <header className="page-head">
        <Link to="/" className="btn btn-ghost">
          ← Home
        </Link>
        <h1>🦕 My Dinos</h1>
        <span className="crystal-count">🥚 {state.eggs}</span>
      </header>

      <section className="companion-card">
        <Dino size={180} color={companion.color} belly={companion.belly} stage={stage} accessory={state.equipped} mood="happy" />
        <div>
          <h2>
            {companion.name} · {STAGE_INFO[stage].name}
          </h2>
          <ol className="evolution">
            {STAGES.map((s) => (
              <li key={s} className={STAGES.indexOf(s) <= STAGES.indexOf(stage) ? 'evo-done' : ''}>
                {STAGE_INFO[s].name}
              </li>
            ))}
          </ol>
          <p className="small">Next: {STAGE_INFO[stage].next}</p>
        </div>
      </section>

      <h2 className="section-title">Dino Collection</h2>
      <div className="dino-grid">
        {DINOS.map((d) => {
          const owned = state.hatched.includes(d.id);
          const ready = !owned && dinoReady(state, d);
          return (
            <div key={d.id} className={`dino-card ${owned ? '' : 'dino-unowned'} ${hatching === d.id ? 'hatching' : ''}`}>
              {owned ? (
                <Dino size={110} color={d.color} belly={d.belly} mood={hatching === d.id ? 'cheer' : 'happy'} stage="baby" />
              ) : (
                <div className={`mystery-egg ${ready ? 'egg-wobble' : ''}`}>🥚</div>
              )}
              <b>{owned || ready ? d.name : '???'}</b>
              {owned ? (
                state.companion === d.id ? (
                  <span className="chip">My companion</span>
                ) : (
                  <button type="button" className="btn btn-soft" onClick={() => update((s) => void (s.companion = d.id))}>
                    Choose
                  </button>
                )
              ) : ready ? (
                <button type="button" className="btn btn-primary" disabled={state.eggs < HATCH_COST} onClick={() => doHatch(d.id)}>
                  Hatch (🥚 {HATCH_COST})
                </button>
              ) : (
                <span className="small">{d.requirement}</span>
              )}
            </div>
          );
        })}
      </div>

      <h2 className="section-title">Dino Wardrobe</h2>
      <div className="wardrobe">
        {COSMETICS.map((c) => {
          const owned = state.cosmetics.includes(c.id);
          const locked = c.id === 'crown' && stage !== 'champion' && stage !== 'olympiad';
          return (
            <div key={c.id} className="ward-item">
              <span className="ward-emoji">{c.emoji}</span>
              <span>{c.name}</span>
              {owned ? (
                <button
                  type="button"
                  className={`btn ${state.equipped === c.id ? 'btn-primary' : 'btn-soft'}`}
                  onClick={() => update((s) => void (s.equipped = s.equipped === c.id ? null : c.id))}
                >
                  {state.equipped === c.id ? 'Wearing' : 'Wear'}
                </button>
              ) : locked ? (
                <span className="small">Champion Dinos only</span>
              ) : (
                <button
                  type="button"
                  className="btn btn-soft"
                  disabled={state.eggs < c.cost}
                  onClick={() =>
                    update((s) => {
                      if (s.eggs < c.cost) return;
                      s.eggs -= c.cost;
                      s.cosmetics.push(c.id);
                      s.equipped = c.id;
                    })
                  }
                >
                  🥚 {c.cost}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <h2 className="section-title">Math Crystals</h2>
      <div className="crystals">
        {WORLDS.map((w) => (
          <span key={w.id} className={`crystal ${state.crystals.includes(w.id) ? 'crystal-on' : ''}`} style={{ ['--world' as string]: w.color }} title={w.crystal}>
            {w.crystal.split(' ')[0]}
          </span>
        ))}
      </div>

      <h2 className="section-title">Badges</h2>
      <div className="badge-shelf">
        {(Object.keys(BADGES) as BadgeId[]).map((b) => (
          <div key={b} className={`badge ${state.badges[b] ? '' : 'badge-off'}`} title={BADGES[b].desc}>
            <span className="badge-emoji">{BADGES[b].emoji}</span>
            <span>{BADGES[b].name}</span>
            {state.badges[b] ? <span className="chip">×{state.badges[b]}</span> : <span className="small">{BADGES[b].desc}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
