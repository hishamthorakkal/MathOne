import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SKILL, WORLD } from '../../engine/catalog';
import { daysToExam, daysToStart, phaseOf, prettyDate, SCHEDULE, today, weekStart } from '../../engine/dates';
import { currentWorld, isMastered, readyToHatch, STAGE_INFO, stageProgress } from '../../engine/mastery';
import { GrowthMeter } from '../../components/Evolution';
import { adventureDays, DAILY_MISSION_LIMIT, missionLimit } from '../../engine/rewards';
import { arenaAvailable } from '../../engine/session';
import { skillsOf } from '../../engine/catalog';
import { update, useAppState } from '../../engine/store';
import { Dino } from '../../components/Dino';
import { useCompanion } from '../../components/useCompanion';

export function Home() {
  const state = useAppState();
  const companion = useCompanion();
  const t = today();
  const left = daysToExam(t);
  const phase = phaseOf(t);

  if (!state.childName) return <Welcome />;

  const world = WORLD[currentWorld(state)];
  const nextSkill = skillsOf(world.id).find((id) => !isMastered(state.skills[id])) ?? skillsOf(world.id)[0];
  const missionsToday = state.days[t]?.missions ?? 0;
  const doneToday = missionsToday >= 1;
  const week = adventureDays(state, weekStart(t), t);
  const hatchable = readyToHatch(state).length;
  const campDue = Object.values(state.revision).some((r) => r && r.priority > 0 && r.nextReview <= t);

  if (left === 0) {
    return (
      <div className="screen center-col home">
        <Dino size={220} species={companion.id} color={companion.color} belly={companion.belly} mood="cheer" stage={companion.stage} accessory={companion.accessory} />
        <h1>Today is Olympiad Day! 🏅</h1>
        <p className="lead">You practised so well, {state.childName}. Take a deep breath, read each question carefully, and do your best. Dino is cheering for you! 🍀</p>
      </div>
    );
  }

  return (
    <div className="screen home">
      <section className="home-hero">
        <div className="home-dino">
          <Dino size={200} species={companion.id} color={companion.color} belly={companion.belly} mood={doneToday ? 'sleep' : 'happy'} stage={companion.stage} accessory={companion.accessory} />
          <div className="stage-chip">{STAGE_INFO[companion.stage].name}</div>
          <GrowthMeter pct={stageProgress(state).pct} next={stageProgress(state).next} compact />
        </div>
        <div className="home-hello">
          <h1>🦖 Hi {state.childName}!</h1>
          <p className="lead">{doneToday ? `${companion.name} is resting after today’s adventure. 😴` : `${companion.name} is ready for an adventure!`}</p>
        </div>
      </section>

      <section className="today-card" style={{ ['--world' as string]: world.color }}>
        <div className="today-label">{left === 1 ? 'TODAY’S TINY MISSION' : 'TODAY’S ADVENTURE'}</div>
        {left === 1 ? (
          <div className="today-world">🌤️ 5 easy questions + 2 puzzles</div>
        ) : (
          <>
            <div className="today-world">
              {world.emoji} {world.name}
            </div>
            <div className="today-skill">{SKILL[nextSkill].name} Mission</div>
          </>
        )}
        {missionsToday < missionLimit(state, t) ? (
          <Link to="/mission" className="btn btn-play">
            ▶ {missionsToday >= DAILY_MISSION_LIMIT ? 'NEXT DAY’S ADVENTURE' : doneToday ? 'BONUS ADVENTURE' : 'PLAY'}
          </Link>
        ) : (
          <div className="today-done">✅ All done for today! See you tomorrow.</div>
        )}
      </section>

      <section className="wallet">
        <span>⭐ {state.stars} Stars</span>
        <span>🥚 {state.eggs} Eggs</span>
        <span>🌟 {week} Adventure {week === 1 ? 'Day' : 'Days'} this week</span>
      </section>

      <nav className="home-nav">
        <Link to="/dinos" className="nav-tile">
          <span className="nav-emoji">🦕</span>
          My Dinos
          {hatchable > 0 && <span className="pip">{hatchable}</span>}
        </Link>
        <Link to="/map" className="nav-tile">
          <span className="nav-emoji">🗺️</span>
          Adventure Map
        </Link>
        <Link to="/camp" className="nav-tile">
          <span className="nav-emoji">🏋️</span>
          Training Camp
          {campDue && <span className="pip">!</span>}
        </Link>
        {arenaAvailable(state) && (
          <Link to="/arena" className="nav-tile">
            <span className="nav-emoji">🏆</span>
            Olympiad Arena
          </Link>
        )}
      </nav>

      {daysToStart(t) > 0 && (
        <p className="countdown start-note">
          🗓️ The big adventure starts on <b>{prettyDate(SCHEDULE.start)}</b>. You can explore with {companion.name} before then!
        </p>
      )}
      <p className="countdown">
        🏰 {left > 0 ? `${left} ${left === 1 ? 'day' : 'days'} until the Olympiad · ${phase.name}` : 'The Olympiad is over – well done!'}
      </p>
    </div>
  );
}

function Welcome() {
  const [name, setName] = useState('');
  return (
    <div className="screen center-col welcome">
      <div className="brand">
        <span className="brand-name">Mathosaur</span>
        <span className="brand-sub">Learn. Play. Think. Conquer.</span>
      </div>
      <Dino size={200} mood="happy" stage="egg" />
      <p className="lead">
        Professor Zero has scattered the magic <b>Math Crystals</b>! Will you help Rexy find them before the Olympiad Castle opens?
      </p>
      <form
        className="welcome-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) update((d) => void (d.childName = name.trim().slice(0, 20)));
        }}
      >
        <label htmlFor="name">What’s your name?</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="off" maxLength={20} />
        <button className="btn btn-primary btn-big" type="submit" disabled={!name.trim()}>
          ▶ Start the adventure
        </button>
      </form>
    </div>
  );
}
