import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SKILL, WORLDS, skillsOf } from '../../engine/catalog';
import { today } from '../../engine/dates';
import { bossReady, CASTLE_APPEARS, currentWorld, isUnlocked, masteryOf, worldProgress } from '../../engine/mastery';
import { useAppState } from '../../engine/store';
import type { WorldId } from '../../engine/types';

const starsFor = (m: number) => (m >= 0.75 ? 3 : m >= 0.5 ? 2 : m > 0.15 ? 1 : 0);

export function WorldMap() {
  const state = useAppState();
  const current = currentWorld(state);
  const [sel, setSel] = useState<WorldId>(current);
  const t = today();
  const castleHidden = !state.settings.unlockAll && t < CASTLE_APPEARS && !isUnlocked(state, 'olympiad_castle');
  const w = WORLDS.find((x) => x.id === sel)!;
  const unlocked = isUnlocked(state, sel);

  return (
    <div className="screen map-screen">
      <header className="page-head">
        <Link to="/" className="btn btn-ghost">
          ← Home
        </Link>
        <h1>🗺️ Adventure Map</h1>
        <span className="crystal-count">💎 {state.crystals.length} / 8</span>
      </header>

      <div className="map-path">
        {WORLDS.map((x, i) => {
          const open = isUnlocked(state, x.id);
          const hidden = x.id === 'olympiad_castle' && castleHidden;
          const p = worldProgress(state, x.id);
          return (
            <button
              type="button"
              key={x.id}
              className={`map-node ${sel === x.id ? 'map-sel' : ''} ${open ? '' : 'map-locked'} ${x.id === current ? 'map-current' : ''}`}
              style={{ ['--world' as string]: x.color, ['--p' as string]: `${Math.round(p * 100)}%`, ['--i' as string]: i }}
              onClick={() => setSel(x.id)}
              aria-label={`${hidden ? 'Hidden castle' : x.name}${open ? '' : ' (locked)'}`}
            >
              <span className="map-ring">
                <span className="map-emoji">{hidden ? '🌫️' : open ? x.emoji : '🔒'}</span>
              </span>
              <span className="map-name">{hidden ? '???' : x.name}</span>
              <span className="map-meta">
                {state.crystals.includes(x.id) ? '💎' : ''}
                {state.bosses.includes(x.id) ? '⚔️' : ''}
                {x.id === current ? '🦖' : ''}
              </span>
            </button>
          );
        })}
      </div>

      <section className="world-panel" style={{ ['--world' as string]: w.color }}>
        {sel === 'olympiad_castle' && castleHidden ? (
          <>
            <h2>🌫️ A mysterious castle…</h2>
            <p>The Olympiad Castle will appear 7 days before the Olympiad. Keep collecting crystals!</p>
          </>
        ) : (
          <>
            <h2>
              {w.emoji} {w.name}
            </h2>
            <p>{w.story}</p>
            <ul className="skill-stars">
              {skillsOf(sel).map((id) => (
                <li key={id}>
                  <span>{SKILL[id].name}</span>
                  <span className="stars" aria-label={`${starsFor(masteryOf(state.skills[id]))} of 3 stars`}>
                    {'★'.repeat(starsFor(masteryOf(state.skills[id])))}
                    <span className="stars-empty">{'★'.repeat(3 - starsFor(masteryOf(state.skills[id])))}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="small">
              {state.crystals.includes(sel)
                ? `💎 ${w.crystal} recovered!`
                : state.bosses.includes(sel)
                  ? `⚔️ ${w.boss.name} beaten! Keep practising to recover the ${w.crystal}.`
                  : bossReady(state, sel)
                    ? `${w.boss.emoji} ${w.boss.name} is waiting at the end of your next mission here!`
                    : `Master more skills to meet ${w.boss.name} ${w.boss.emoji}.`}
            </p>
            {unlocked ? (
              <Link to={`/mission?world=${sel}`} className="btn btn-primary btn-big">
                ▶ Adventure here
              </Link>
            ) : (
              <p className="locked-note">🔒 Explore the land before this one to open it.</p>
            )}
          </>
        )}
      </section>
    </div>
  );
}
