import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Star, Gem, Coins, Banknote, Gift } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const PALETTE = ['#7C2FE0', '#E0299B', '#F5A623', '#2FE0B0', '#FFC93C', '#4A4458', '#2F6FE0', '#E0592F'];

function iconFor(amount) {
  if (amount >= 10000) return Gift;
  if (amount >= 1000) return Gem;
  if (amount >= 100) return Banknote;
  return Coins;
}

export default function Roulette({ onBack, onDone }) {
  const [prizes, setPrizes] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.from('roulette_prizes').select('*').eq('is_active', true).order('amount')
      .then(({ data }) => setPrizes(data || []));
  }, []);

  const n = prizes.length || 1;
  const segAngle = 360 / n;

  const gradient = useMemo(
    () => prizes.map((_, i) => `${PALETTE[i % PALETTE.length]} ${i * segAngle}deg ${(i + 1) * segAngle}deg`).join(','),
    [prizes, segAngle]
  );

  // Puntitos de luz alrededor del aro dorado
  const lights = Array.from({ length: 20 });

  async function spin() {
    if (spinning) return;
    setError('');
    setSpinning(true);
    setResult(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('spin_roulette');
      if (rpcError) throw rpcError;
      const prize = data?.[0];

      const extraSpins = 5 * 360;
      const finalAngle = extraSpins + Math.floor(Math.random() * 360);
      setRotation((r) => r + finalAngle);

      setTimeout(() => {
        setResult(prize);
        setSpinning(false);
      }, 3200);
    } catch (err) {
      setError(err.message || 'No se pudo girar la ruleta.');
      setSpinning(false);
    }
  }

  return (
    <div className="min-h-screen px-6 py-8 flex flex-col relative overflow-hidden">
      {/* Confeti decorativo */}
      <div className="pointer-events-none absolute inset-0 opacity-40 text-lg leading-none">
        <span className="absolute top-10 left-8">🎉</span>
        <span className="absolute top-24 right-10">✨</span>
        <span className="absolute top-64 left-4">💎</span>
        <span className="absolute top-96 right-6">⭐</span>
      </div>

      <button onClick={onBack} className="flex items-center gap-2 text-white/50 text-sm mb-4 w-fit relative z-10">
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        {/* Título con estrellas */}
        <div className="flex items-center gap-1 mb-1 text-[#FFC93C]">
          <Star size={12} fill="currentColor" />
          <Star size={16} fill="currentColor" />
          <Star size={20} fill="currentColor" />
          <Star size={16} fill="currentColor" />
          <Star size={12} fill="currentColor" />
        </div>
        <h1 className="font-display font-800 text-3xl text-center leading-none mb-1">
          RULETA <span className="gradient-text">VADIA</span>
        </h1>
        <p className="text-white/40 text-sm mb-8">Gira y gana premios reales</p>

        {/* Rueda */}
        <div className="relative w-72 h-72 mb-6">
          {/* Aro dorado con luces */}
          <div className="absolute -inset-3 rounded-full" style={{
            background: 'conic-gradient(from 0deg, #FFE9A8, #F5A623, #C9820F, #F5A623, #FFE9A8, #C9820F, #F5A623, #FFE9A8)',
            boxShadow: '0 0 30px rgba(245,166,35,0.55), inset 0 0 14px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.5)',
          }}>
            {lights.map((_, i) => (
              <span
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-white"
                style={{
                  top: '50%', left: '50%',
                  transform: `rotate(${(360 / lights.length) * i}deg) translate(0, -140px)`,
                  boxShadow: '0 0 6px 1px rgba(255,255,255,0.8)',
                }}
              />
            ))}
          </div>

          {/* Disco de premios */}
          <div
            className="absolute inset-3 rounded-full border-4 border-black/30 transition-transform duration-[3200ms] ease-out overflow-hidden"
            style={{ transform: `rotate(${rotation}deg)`, background: prizes.length ? `conic-gradient(${gradient})` : '#1a1720' }}
          >
            {prizes.map((p, i) => {
              const mid = i * segAngle + segAngle / 2;
              const Icon = iconFor(p.amount);
              return (
                <div
                  key={p.id}
                  className="absolute top-1/2 left-1/2 flex flex-col items-center gap-1 text-white"
                  style={{ transform: `rotate(${mid}deg) translate(0, -74px) rotate(${-mid}deg)`, marginLeft: '-28px', marginTop: '-28px', width: 56 }}
                >
                  {p.image_url ? (
                    <img src={p.image_url} alt="" className="w-11 h-11 rounded-full object-cover border-2 border-white/40 shadow-lg" />
                  ) : (
                    <Icon size={20} />
                  )}
                  <span className="text-[11px] font-display font-700 drop-shadow">{p.label}</span>
                </div>
              );
            })}
          </div>

          {/* Brillo y relieve fijo (no gira, simula luz reflejando en la superficie) */}
          <div
            className="absolute inset-3 rounded-full pointer-events-none"
            style={{
              background: `
                radial-gradient(circle at 32% 24%, rgba(255,255,255,0.45), rgba(255,255,255,0) 42%),
                radial-gradient(circle at 68% 78%, rgba(0,0,0,0.4), rgba(0,0,0,0) 55%)
              `,
              boxShadow: 'inset 0 0 36px rgba(0,0,0,0.5), inset 0 0 3px rgba(255,255,255,0.4)',
            }}
          />

          {/* Puntero */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[11px] border-l-transparent border-r-[11px] border-r-transparent border-t-[18px] border-t-white drop-shadow" />

          {/* Centro / botón de girar */}
          <button
            onClick={spin}
            disabled={spinning || prizes.length === 0}
            className="absolute inset-0 m-auto w-20 h-20 rounded-full flex items-center justify-center font-display font-800 text-sm text-black disabled:opacity-60"
            style={{
              background: 'radial-gradient(circle at 35% 30%, #FFE9A8, #F5A623 60%, #C9820F 100%)',
              boxShadow: '0 0 0 4px #07060A, 0 0 18px rgba(245,166,35,0.6)',
            }}
          >
            {spinning ? '...' : 'GIRAR'}
          </button>
        </div>

        {/* Lista de premios posibles */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-xs">
          {prizes.map((p, i) => (
            <div key={p.id} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full pl-1 pr-2.5 py-1">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
              <span className="text-[11px] font-mono text-white/60">{p.label}</span>
            </div>
          ))}
        </div>

        {result && (
          <div className="text-center mb-4">
            {result.amount > 0 ? (
              <p className="font-mono text-2xl text-[#2FE0B0]">¡Ganaste ${Number(result.amount).toLocaleString('es-MX')}!</p>
            ) : (
              <p className="text-white/50">Esta vez no hubo suerte. ¡Vuelve mañana!</p>
            )}
          </div>
        )}

        {error && <p className="text-[#E0299B] text-xs mb-4 text-center max-w-xs">{error}</p>}

        <button
          onClick={spin}
          disabled={spinning || prizes.length === 0}
          className="w-full max-w-xs flex flex-col items-center justify-center gap-0.5 bg-gradient-to-r from-[#7C2FE0] via-[#E0299B] to-[#F5A623] font-semibold py-3.5 rounded-full disabled:opacity-50"
        >
          <span>{spinning ? 'Girando…' : 'GIRAR'}</span>
          <span className="text-[11px] font-normal opacity-80 flex items-center gap-1">
            <Star size={10} fill="currentColor" /> Buena suerte <Star size={10} fill="currentColor" />
          </span>
        </button>

        {result && (
          <button onClick={onDone} className="text-white/40 text-sm mt-6">
            Volver al panel
          </button>
        )}
      </div>
    </div>
  );
}
