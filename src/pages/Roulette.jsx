import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const PALETTE = ['#7C2FE0', '#E0299B', '#F5A623', '#2FE0B0', '#FFC93C', '#4A4458', '#2F6FE0', '#E0592F'];

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

  const n = prizes.length || 1;
  const segAngle = 360 / n;
  const gradient = prizes
    .map((_, i) => `${PALETTE[i % PALETTE.length]} ${i * segAngle}deg ${(i + 1) * segAngle}deg`)
    .join(',');

  return (
    <div className="min-h-screen px-6 py-8 flex flex-col">
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 text-sm mb-6 w-fit">
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="font-display font-700 text-2xl mb-1">Ruleta diaria</h1>
        <p className="text-white/40 text-sm mb-8">Un giro gratis cada día</p>

        <div className="relative w-64 h-64 mb-6">
          <div
            className="w-full h-full rounded-full border-4 border-white/10 transition-transform duration-[3200ms] ease-out"
            style={{ transform: `rotate(${rotation}deg)`, background: prizes.length ? `conic-gradient(${gradient})` : '#1a1720' }}
          />
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[16px] border-t-white" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-[#07060A] border-2 border-white/20" />
          </div>
        </div>

        {/* Lista de premios posibles */}
        <div className="flex flex-wrap justify-center gap-2 mb-6 max-w-xs">
          {prizes.map((p, i) => (
            <div key={p.id} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full pl-1 pr-2.5 py-1">
              {p.image_url ? (
                <img src={p.image_url} alt="" className="w-5 h-5 rounded-full object-cover" />
              ) : (
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
              )}
              <span className="text-[11px] font-mono text-white/60">{p.label}</span>
            </div>
          ))}
        </div>

        {result && (
          <div className="text-center mb-6">
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
          className="bg-gradient-to-r from-[#7C2FE0] via-[#E0299B] to-[#F5A623] font-semibold px-10 py-3.5 rounded-full disabled:opacity-50"
        >
          {spinning ? 'Girando…' : 'Girar'}
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
