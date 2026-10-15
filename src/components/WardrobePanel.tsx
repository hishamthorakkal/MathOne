import { useState } from 'react';
import { play } from '../engine/audio';
import { COSMETICS, SLOTS } from '../engine/catalog';
import { buyItem, canWear, outfitOf, toggleWear } from '../engine/collection';
import { STAGE_INFO } from '../engine/mastery';
import { update } from '../engine/store';
import type { AppState, Slot } from '../engine/types';
import { Dino } from './Dino';
import { useCompanion } from './useCompanion';

/** Mix-and-match wardrobe: one item per spot, bought once with Dino Eggs. */
export function WardrobePanel({ state }: { state: AppState }) {
  const companion = useCompanion();
  const [slot, setSlot] = useState<Slot>('head');
  const outfit = outfitOf(state);
  const items = COSMETICS.filter((c) => c.slot === slot);

  return (
    <section className="wardrobe-panel" aria-label="Dino Wardrobe">
      <h2 className="section-title">👕 Dino Wardrobe</h2>
      <div className="wardrobe-layout">
        <div className="wardrobe-preview">
          <Dino size={200} species={companion.id} color={companion.color} belly={companion.belly} stage={companion.stage} outfit={outfit} mood="happy" />
          <div className="outfit-list">
            {SLOTS.map((s) => {
              const worn = COSMETICS.find((c) => c.id === outfit[s.id]);
              return (
                <span key={s.id} className={`outfit-chip ${worn ? 'outfit-on' : ''}`}>
                  {s.emoji} {worn ? worn.name : `No ${s.name.toLowerCase()} item`}
                </span>
              );
            })}
          </div>
        </div>
        <div className="wardrobe-shop">
          <div className="discovery-tabs" role="tablist">
            {SLOTS.map((s) => (
              <button key={s.id} type="button" role="tab" aria-selected={slot === s.id} className={`chip-btn ${slot === s.id ? 'chip-on' : ''}`} onClick={() => setSlot(s.id)}>
                {s.emoji} {s.name}
              </button>
            ))}
          </div>
          <div className="wardrobe-items">
            {items.map((c) => {
              const owned = state.cosmetics.includes(c.id);
              const wearing = outfit[c.slot] === c.id;
              const allowed = canWear(state, c);
              return (
                <div key={c.id} className={`ward-card ${wearing ? 'ward-wearing' : ''}`}>
                  <Dino size={92} species={companion.id} color={companion.color} belly={companion.belly} stage="baby" outfit={{ [c.slot]: c.id }} mood="happy" className="dino-still" />
                  <b>{c.name}</b>
                  {!allowed ? (
                    <span className="small">{STAGE_INFO[c.minStage!].name}s only</span>
                  ) : owned ? (
                    <button
                      type="button"
                      className={`btn ${wearing ? 'btn-primary' : 'btn-soft'}`}
                      onClick={() => {
                        play('tap');
                        update((d) => void toggleWear(d, c.id));
                      }}
                    >
                      {wearing ? '✓ Wearing' : 'Wear'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-soft"
                      disabled={state.eggs < c.cost}
                      onClick={() => {
                        let ok = false;
                        update((d) => void (ok = buyItem(d, c.id)));
                        if (ok) play('correct');
                      }}
                    >
                      🥚 {c.cost}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <p className="small">Wear one item on the head, eyes, neck and back at the same time. Tap an item you are wearing to take it off.</p>
        </div>
      </div>
    </section>
  );
}
