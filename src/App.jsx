import { useEffect, useState } from 'react';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import BuyPackage from './pages/BuyPackage';
import WatchVideo from './pages/WatchVideo';
import Withdraw from './pages/Withdraw';
import Admin from './pages/Admin';
import Referrals from './pages/Referrals';
import Account from './pages/Account';
import Company from './pages/Company';
import { supabase } from './lib/supabaseClient';

const isAdminRoute = window.location.pathname.startsWith('/admin');

export default function App() {
  const [view, setView] = useState('landing');
  const [authMode, setAuthMode] = useState('login');
  const [userId, setUserId] = useState(null);
  const [adminStatus, setAdminStatus] = useState('checking'); // 'checking' | 'admin' | 'denied' | 'error'
  const [debugMsg, setDebugMsg] = useState('');
  const [balance, setBalance] = useState(0);
  const [checkingSession, setCheckingSession] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        setUserId(data.session.user.id);
        if (!isAdminRoute) setView('dashboard');
      }
      setCheckingSession(false);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    supabase.from('profiles').select('available_balance, is_admin').eq('id', userId).single()
      .then(({ data, error }) => {
        if (error) {
          setAdminStatus('error');
          setDebugMsg(error.message);
          return;
        }
        setBalance(data?.available_balance || 0);
        if (isAdminRoute) {
          setAdminStatus(data?.is_admin ? 'admin' : 'denied');
          setDebugMsg(`is_admin recibido: ${JSON.stringify(data?.is_admin)} · id consultado: ${userId}`);
        }
      });
  }, [userId, refreshKey]);

  function handleAuthed(id) {
    setUserId(id);
    setView('dashboard');
  }

  function handleLogout() {
    setUserId(null);
    setIsAdmin(false);
    setView('landing');
  }

  function goDashboard() {
    setRefreshKey((k) => k + 1);
    setView('dashboard');
  }

  if (checkingSession) {
    return <div className="min-h-screen flex items-center justify-center text-white/50">Cargando…</div>;
  }

  // ---- Ruta /admin: completamente separada del flujo normal ----
  if (isAdminRoute) {
    if (!userId) {
      return <Auth mode="login" onBack={() => {}} onAuthed={handleAuthed} />;
    }
    if (adminStatus === 'checking') {
      return <div className="min-h-screen flex items-center justify-center text-white/50 text-sm">Verificando permisos…</div>;
    }
    if (adminStatus === 'admin') {
      return <Admin onBack={() => window.location.href = '/'} />;
    }
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white/50 text-sm px-6 text-center gap-4">
        <p>No tienes acceso a esta sección.</p>
        <p className="text-white/25 text-xs font-mono break-all">{debugMsg}</p>
      </div>
    );
  }

  // ---- Flujo normal de usuario ----
  if (userId) {
    if (view === 'buy') return <BuyPackage userId={userId} onBack={goDashboard} onRequested={goDashboard} />;
    if (view === 'watch') return <WatchVideo onBack={goDashboard} onDone={goDashboard} />;
    if (view === 'withdraw') return <Withdraw balance={balance} onBack={goDashboard} onDone={goDashboard} />;
    if (view === 'referrals') return <Referrals userId={userId} onNavigate={setView} />;
    if (view === 'account') return <Account userId={userId} onLogout={handleLogout} onNavigate={setView} />;
    if (view === 'company') return <Company onNavigate={setView} />;
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
