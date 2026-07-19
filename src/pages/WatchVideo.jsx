import { useState, useEffect } from 'react';
import { ArrowLeft, Play } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const WATCH_SECONDS = 15;

export default function WatchVideo({ onBack, onDone }) {
  const [phase, setPhase] = useState('playing'); // 'playing' | 'ready' | 'claiming' | 'done' | 'error'
  const [secondsLeft, setSecondsLeft] = useState(WATCH_SECONDS);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (phase !== 'playing') return;
    if (secondsLeft <= 0) {
      setPhase('ready');
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, secondsLeft]);

  async function claimReward() {
    setPhase('claiming');
    setError('');
    try {
      const { data, error: rpcError } = await supabase.rpc('watch_video');
      if (rpcError) throw rpcError;
      setResult(data?.[0]);
      setPhase('done');
    } catch (err) {
      setError(err.message || 'No se pudo registrar el video.');
      setPhase('error');
    }
  }

  return (
    <div className="min-h-screen px-6 py-8 flex flex-col">
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 text-sm mb-10 w-fit">
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        {phase === 'playing' && (
          <>
            <div className="w-40 h-40 rounded-full bg-white/5 flex items-center justify-center mb-8 relative">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                <circle
                  cx="50" cy="50" r="46" fill="none" stroke="#2FE0B0" strokeWidth="4"
                  strokeDasharray={2 * Math.PI * 46}
                  strokeDashoffset={2 * Math.PI * 46 * (secondsLeft / WATCH_SECONDS)}
                  strokeLinecap="round"
                />
              </svg>
              <Play size={40} fill="currentColor" className="text-white/70" />
            </div>
            <p className="font-mono text-3xl">{secondsLeft}s</p>
            <p className="text-white/40 text-sm mt-2">Espera a que termine el anuncio…</p>
          </>
        )}

        {(phase === 'ready' || phase === 'claiming' || phase === 'error') && (
          <>
            <h2 className="font-display font-700 text-xl mb-6">¡Anuncio completo!</h2>
            <button
              onClick={claimReward}
              disabled={phase === 'claiming'}
              className="bg-gradient-to-r from-[#7C2FE0] via-[#E0299B] to-[#F5A623] font-semibold px-8 py-3.5 rounded-full disabled:opacity-50"
            >
              {phase === 'claiming' ? 'Registrando…' : 'Reclamar recompensa'}
            </button>
            {error && <p className="text-[#E0299B] text-xs mt-4">{error}</p>}
          </>
        )}

        {phase === 'done' && (
          <>
            <p className="text-[#2FE0B0] font-display font-700 text-2xl mb-2">
              ¡Ganancia acreditada!
            </p>
            <p className="font-mono text-4xl font-700 mb-2">
              ${Number(result?.new_balance || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-white/40 text-sm mb-8">Saldo disponible</p>
            <button
              onClick={onDone}
              className="bg-white text-black font-semibold px-8 py-3.5 rounded-full"
            >
              Volver al panel
            </button>
          </>
        )}
      </div>

    </div>
  );
}
