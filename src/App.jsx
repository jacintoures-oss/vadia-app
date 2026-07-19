import { useEffect, useState } from 'react';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import { supabase } from './lib/supabaseClient';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'auth' | 'dashboard'
  const [authMode, setAuthMode] = useState('register');
  const [userId, setUserId] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Al cargar la app, revisa si ya hay una sesión activa
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUserId(data.session.user.id);
        setView('dashboard');
      }
      setCheckingSession(false);
    });
  }, []);

  function handleAuthed(id) {
    setUserId(id);
    setView('dashboard');
  }

  function handleLogout() {
    setUserId(null);
    setView('landing');
  }

  if (checkingSession) {
    return <div className="min-h-screen flex items-center justify-center text-white/50">Cargando…</div>;
  }

  if (view === 'dashboard' && userId) {
    return <Dashboard userId={userId} onLogout={handleLogout} />;
  }

  if (view === 'auth') {
    return (
      <Auth
        mode={authMode}
        onBack={() => setView('landing')}
        onAuthed={handleAuthed}
      />
    );
  }

  return (
    <Landing
      onGetStarted={() => { setAuthMode('register'); setView('auth'); }}
      onLogin={() => { setAuthMode('login'); setView('auth'); }}
    />
  );
}
