import { HashRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { EvolutionWatcher } from './components/EvolutionWatcher';
import { Arena } from './pages/child/Arena';
import { Dinos } from './pages/child/Dinos';
import { Home } from './pages/child/Home';
import { MissionPage } from './pages/child/Mission';
import { WorldMap } from './pages/child/WorldMap';
import { Dashboard } from './pages/parent/Dashboard';
import { ParentGate } from './pages/parent/Gate';

function ChildFooter() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/parent') || pathname.startsWith('/mission') || pathname.startsWith('/camp') || pathname.startsWith('/arena')) return null;
  return (
    <footer className="child-footer">
      <Link to="/parent" className="grownups">
        🔒 Grown-ups
      </Link>
    </footer>
  );
}

export function App() {
  return (
    <HashRouter>
      <div className="app">
        <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<WorldMap />} />
          <Route path="/mission" element={<MissionPage kind="daily" />} />
          <Route path="/camp" element={<MissionPage kind="camp" />} />
          <Route path="/dinos" element={<Dinos />} />
          <Route path="/arena" element={<Arena />} />
          <Route path="/parent" element={<ParentGate />} />
          <Route path="/parent/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Home />} />
        </Routes>
        </ErrorBoundary>
        <EvolutionWatcher />
        <ChildFooter />
      </div>
    </HashRouter>
  );
}
