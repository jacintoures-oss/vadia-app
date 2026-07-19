import { useEffect, useState } from 'react';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import BuyPackage from './pages/BuyPackage';
import WatchVideo from './pages/WatchVideo';
import Withdraw from './pages/Withdraw';
import Admin from './pages/Admin';
import { supabase } from './lib/supabaseClient';

export default function App() {
  const [view, setView] = useState('landing');
  const [authMode, setAuthMode] = useState('register');
  const [userId, setUserId] = useState(null);
  const [balance, setBalance] = useState(0);
  const [checkingSession, setCheckingSession] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUserId(data.session.user.id);
        setView('dashboard');
      }
      setCheckingSession(false);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    supabase.from('profiles').select('available_balance').eq('id', userId).single()
      .then(({ data }) => setBalance(data?.available_balance || 0));
  }, [userId, refreshKey]);

  function handleAuthed(id) {
    setUserId(id);
    setView('dashboard');
  }

  function handleLogout() {
    setUserId(null);
    setView('landing');
  }

  function goDashboard() {
    setRefreshKey((k) => k + 1);
    setView('dashboard');
  }

  if (checkingSession) {
    return <div className="min-h-screen flex items-center justify-center text-white/50">Cargando…</div>;
  }

  if (userId) {
    if (view === 'buy') return <BuyPackage userId={userId} onBack={goDashboard} onRequested={goDashboard} />;
    if (view === 'watch') return <WatchVideo onBack={goDashboard} onDone={goDashboard} />;
    if (view === 'withdraw') return <Withdraw balance={balance} onBack={goDashboard} onDone={goDashboard} />;
    if (view === 'admin') return <Admin onBack={goDashboard} />;
    return <Dashboard key={refreshKey} userId={userId} onLogout={handleLogout} onNavigate={setView} />;
  }

  if (view === 'auth') {
    return <Auth mode={authMode} onBack={() => setView('landing')} onAuthed={handleAuthed} />;
  }

  return (
    <Landing
      onGetStarted={() => { setAuthMode('register'); setView('auth'); }}
      onLogin={() => { setAuthMode('login'); setView('auth'); }}
    />
  );
}
