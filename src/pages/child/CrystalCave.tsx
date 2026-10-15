import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BONUS_CRYSTAL_EGGS, BONUS_CRYSTALS, WORLDS, skillsOf, type BonusCrystal } from '../../engine/catalog';
import { checkBonusCrystals, gemsOf } from '../../engine/collection';
import { update, useAppState } from '../../engine/store';
import { play } from '../../engine/audio';

/** Crystal Cave: the 8 world crystals and 8 bonus crystals, grey until won. */
export function CrystalCave() {
  const state = useAppState();
  const [justWon, setJustWon] = useState<BonusCrystal[]>([]);
  const gems = gemsOf(state);
  const bonusWon = state.bonusCrystals ?? [];
  const total = state.crystals.length + bonusWon.length;

  // Award anything already earned (e.g. from before crystals existed), once.
  useEffect(() => {
    let won: BonusCrystal[] = [];
    update((d) => {
      won = checkBonusCrystals(d);
      d.gems = gemsOf(d);
    });
    if (won.length) {
      setJustWon(won);
      play('hatch');
    }
  }, []);

  return (
    <div className="screen crystal-cave">
      <header className="page-head">
        <Link to="/" className="btn btn-ghost">
          ← Home
        </Link>
        <h1>💎 Crystal Cave</h1>
        <span className="crystal-count">🥚 {state.eggs}</span>
      </header>
      <p className="lead center-text">
        You have won <b>{total}</b> of <b>{WORLDS.length + BONUS_CRYSTALS.length}</b> crystals!
      </p>

      {justWon.length > 0 && (
        <div className="banner-note crystal-note center-text">
          ✨ You won the {justWon.map((b) => b.name).join(' and ')}! +{justWon.length * BONUS_CRYSTAL_EGGS} 🥚
        </div>
      )}

      <h2 className="section-title">Math Crystals</h2>
      <p className="small">Finish a world to win its crystal.</p>
      <div className="cave-grid">
        {WORLDS.map((w) => {
          const won = state.crystals.includes(w.id);
          const skills = skillsOf(w.id);
          const got = skills.filter((s) => gems.includes(s)).length;
          return (
            <div key={w.id} className="cave-tile">
              <span className={`crystal ${won ? 'crystal-on' : ''}`} style={{ ['--world' as string]: w.color }}>
                {w.crystal.split(' ')[0]}
              </span>
              <b>{w.crystal.split(' ').slice(1).join(' ')}</b>
              <span className="small">{won ? '✓ Won!' : `${got} of ${skills.length} skills`}</span>
            </div>
          );
        })}
      </div>

      <h2 className="section-title">Bonus Crystals</h2>
      <p className="small">Won for great habits. Each one gives +{BONUS_CRYSTAL_EGGS} 🥚.</p>
      <div className="cave-grid">
        {BONUS_CRYSTALS.map((b) => {
          const won = bonusWon.includes(b.id);
          return (
            <div key={b.id} className="cave-tile">
              <span className={`crystal ${won ? 'crystal-on' : ''}`} style={{ ['--world' as string]: b.color === 'rainbow' ? '#a855f7' : b.color }}>
                {b.emoji}
              </span>
              <b>{b.name}</b>
              <span className="small">{won ? '✓ Won!' : b.how}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
