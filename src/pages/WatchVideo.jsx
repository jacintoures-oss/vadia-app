import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function WatchVideo({ onBack, onDone }) {
  const [video, setVideo] = useState(null);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [phase, setPhase] = useState('playing'); // 'playing' | 'ready' | 'claiming' | 'done' | 'error'
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Elegimos un video al azar de tu catálogo activo
  useEffect(() => {
    supabase.from('ad_videos').select('*').eq('is_active', true).then(({ data }) => {
      if (data && data.length > 0) {
        const pick = data[Math.floor(Math.random() * data.length)];
        setVideo(pick);
        setSecondsLeft(pick.duration_seconds);
      }
      setLoadingVideo(false);
    });
  }, []);

  useEffect(() => {
    if (phase !== 'playing' || loadingVideo) return;
    if (secondsLeft <= 0) {
      setPhase('ready');
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, secondsLeft, loadingVideo]);

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
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 text-sm mb-6 w-fit">
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="flex-1 flex flex-col items-center justify-center">
        {loadingVideo && <p className="text-white/40 text-sm">Cargando anuncio…</p>}

        {!loadingVideo && !video && (
          <p className="text-white/40 text-sm text-center">No hay videos disponibles por ahora. Intenta más tarde.</p>
        )}

        {video && (
          <>
            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black mb-5 relative">
              <iframe
                key={video.id}
                className="w-full h-full pointer-events-none"
                src={`https://www.youtube-nocookie.com/embed/${video.youtube_id}?autoplay=1&controls=0&modestbranding=1&rel=0&playsinline=1`}
                title={video.title}
                allow="autoplay; encrypted-media"
                allowFullScreen={false}
              />
            </div>

            {phase === 'playing' && (
              <p className="font-mono text-lg text-white/70">{secondsLeft}s</p>
            )}

            {(phase === 'ready' || phase === 'claiming' || phase === 'error') && (
              <div className="text-center">
                <h2 className="font-display font-700 text-lg mb-4">¡Anuncio completo!</h2>
                <button
                  onClick={claimReward}
                  disabled={phase === 'claiming'}
                  className="bg-gradient-to-r from-[#7C2FE0] via-[#E0299B] to-[#F5A623] font-semibold px-8 py-3.5 rounded-full disabled:opacity-50"
                >
                  {phase === 'claiming' ? 'Registrando…' : 'Reclamar recompensa'}
                </button>
                {error && <p className="text-[#E0299B] text-xs mt-4">{error}</p>}
              </div>
            )}

            {phase === 'done' && (
              <div className="text-center">
                <p className="text-[#2FE0B0] font-display font-700 text-2xl mb-2">¡Ganancia acreditada!</p>
                <p className="font-mono text-4xl font-700 mb-2">
                  ${Number(result?.new_balance || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-white/40 text-sm mb-8">Saldo disponible</p>
                <button onClick={onDone} className="bg-white text-black font-semibold px-8 py-3.5 rounded-full">
                  Volver al panel
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
