import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BADGES, WORLDS, type DinoInfo } from '../../engine/catalog';
import { gemsOf } from '../../engine/collection';
import { STAGE_INFO, STAGE_ORDER, stageIndex, stageProgress } from '../../engine/mastery';
import { hatch } from '../../engine/rewards';
import { update, useAppState } from '../../engine/store';
import type { BadgeId, DinoId } from '../../engine/types';
import { Dino } from '../../components/Dino';
import { DiscoveryBook } from '../../components/DiscoveryBook';
import { WardrobePanel } from '../../components/WardrobePanel';
import { EvolutionOverlay, GrowthMeter, growthSteps } from '../../components/Evolution';
import { useCompanion } from '../../components/useCompanion';

export function Dinos() {
  const state = useAppState();
  const companion = useCompanion();
  const stage = companion.stage;
  const growth = stageProgress(state);
  const [hatching, setHatching] = useState<DinoInfo | null>(null);
  const [replay, setReplay] = useState(false);
  const [factFor, setFactFor] = useState<DinoId | null>(null);

  const doHatch = (d: DinoInfo) => {
    let ok = false;
    update((s) => void (ok = hatch(s, d.id as DinoId)));
    if (ok) setHatching(d); // the hatching scene plays its own sound
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

      {replay && (
        <EvolutionOverlay steps={growthSteps('egg', stage)} dino={{ species: companion.id, name: companion.name, color: companion.color, belly: companion.belly, outfit: companion.outfit }} onDone={() => setReplay(false)} />
      )}
      {hatching && (
        <EvolutionOverlay
          steps={[['egg', 'baby']]}
          dino={{ species: hatching.id, name: hatching.name, color: hatching.color, belly: hatching.belly }}
          messageFor={() => `Welcome to your Dino family, ${hatching.name}! 💚`}
          onDone={() => {
            setFactFor(hatching.id); // show the new dino's fact card straight away
            setHatching(null);
          }}
        />
      )}

      <section className="companion-card">
        <Dino size={180} species={companion.id} color={companion.color} belly={companion.belly} stage={stage} outfit={companion.outfit} mood="happy" />
        <div>
          <h2>
            {companion.name} · {STAGE_INFO[stage].name}
          </h2>
          <div className="journey" aria-label="Growth journey">
            {STAGE_ORDER.map((s, i) => {
              const reached = stageIndex(s) <= stageIndex(stage);
              return (
                <span key={s} style={{ display: 'contents' }}>
                  {i > 0 && <span className="journey-arrow">›</span>}
                  <span className={`journey-step ${reached ? '' : 'journey-locked'} ${s === stage ? 'journey-now' : ''}`}>
                    <Dino size={30 + i * 6} species={companion.id} color={companion.color} belly={companion.belly} stage={s} mood={s === stage ? 'happy' : 'sleep'} className={s === stage ? '' : 'dino-still'} />
                    {reached ? STAGE_INFO[s].name.replace(' Dino', '') : '?'}
                  </span>
                </span>
              );
            })}
          </div>
          <GrowthMeter pct={growth.pct} next={growth.next} />
          <p className="small">Next: {STAGE_INFO[stage].next}</p>
          {stage !== 'egg' && (
            <button type="button" className="btn btn-soft" onClick={() => setReplay(true)}>
              ▶ Watch {companion.name} grow
            </button>
          )}
        </div>
      </section>

      <DiscoveryBook state={state} selected={factFor} onSelect={setFactFor} onHatch={doHatch} />

      <WardrobePanel state={state} />

      <Link to="/crystals" className="new-egg-banner crystal-link">
        💎 Crystal Cave: {state.crystals.length} of {WORLDS.length} world crystals · {gemsOf(state).length} skill gems · {(state.bonusCrystals ?? []).length} bonus crystals ▶
      </Link>

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
