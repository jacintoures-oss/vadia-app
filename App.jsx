import { useState } from 'react';
import Landing from './pages/Landing';
import Auth from './pages/Auth';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'auth'
  const [authMode, setAuthMode] = useState('register');

  function handleAuthed(userId) {
    // Aquí rediriges al dashboard una vez armado (siguiente paso)
    console.log('Usuario autenticado:', userId);
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
