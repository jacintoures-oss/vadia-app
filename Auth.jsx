import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Auth({ mode: initialMode, onBack, onAuthed }) {
  const [mode, setMode] = useState(initialMode || 'register'); // 'register' | 'login'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [refCode, setRefCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Captura ?ref=CODIGO de la URL al cargar
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setRefCode(ref);
  }, []);

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;

      const userId = authData.user?.id;
      if (!userId) throw new Error('No se pudo crear el usuario.');

      // 2. Resolver referred_by a partir del código, si viene
      let referredBy = null;
      if (refCode) {
        const { data: refProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('referral_code', refCode)
          .maybeSingle();
        if (refProfile) referredBy = refProfile.id;
      }

      // 3. Crear el perfil
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        full_name: fullName,
        email,
        phone,
        referred_by: referredBy,
      });
      if (profileError) throw profileError;

      onAuthed(userId);
    } catch (err) {
      setError(err.message || 'Ocurrió un error al registrarte.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (loginError) throw loginError;
      onAuthed(data.user.id);
    } catch (err) {
      setError(err.message || 'Correo o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 text-sm mb-10 w-fit">
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="max-w-sm w-full mx-auto flex-1 flex flex-col justify-center">
        <h1 className="font-display font-800 text-2xl mb-1">
          {mode === 'register' ? 'Crea tu cuenta' : 'Bienvenido de vuelta'}
        </h1>
        <p className="text-white/50 text-sm mb-8">
          {mode === 'register' ? 'Empieza a ganar viendo anuncios.' : 'Inicia sesión para ver tu panel.'}
        </p>

        <form onSubmit={mode === 'register' ? handleRegister : handleLogin} className="space-y-4">
          {mode === 'register' && (
            <input
              type="text" placeholder="Nombre completo" required
              value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7C2FE0]"
            />
          )}
          <input
            type="email" placeholder="Correo electrónico" required
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7C2FE0]"
          />
          {mode === 'register' && (
            <input
              type="tel" placeholder="Teléfono (10 dígitos)" required
              value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7C2FE0]"
            />
          )}
          <input
            type="password" placeholder="Contraseña" required minLength={6}
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7C2FE0]"
          />
          {mode === 'register' && (
            <input
              type="text" placeholder="Código de referido (opcional)"
              value={refCode} onChange={(e) => setRefCode(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7C2FE0] font-mono"
            />
          )}

          {error && <p className="text-[#E0299B] text-xs">{error}</p>}

          <button
            type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-[#7C2FE0] via-[#E0299B] to-[#F5A623] font-semibold py-3.5 rounded-xl disabled:opacity-50"
          >
            {loading ? 'Procesando…' : mode === 'register' ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === 'register' ? 'login' : 'register')}
          className="text-white/50 text-sm mt-6 mx-auto"
        >
          {mode === 'register' ? '¿Ya tienes cuenta? Inicia sesión' : '¿Nuevo en Vadia? Regístrate'}
        </button>
      </div>
    </div>
  );
}
