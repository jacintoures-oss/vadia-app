import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const COLORS = ['#7C2FE0', '#E0299B', '#F5A623', '#2FE0B0', '#FFC93C', '#4A4458'];

export default function Roulette({ onBack, onDone }) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function spin() {
    if (spinning) return;
    setError('');
    setSpinning(true);
    setResult(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('spin_roulette');
      if (rpcError) throw rpcError;
      const prize = data?.[0];

      // Gira varias vueltas completas + una posición "aleatoria" visual
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
    <div className="min-h-screen px-6 py-8 flex flex-col">
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 text-sm mb-8 w-fit">
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="font-display font-700 text-2xl mb-1">Ruleta diaria</h1>
        <p className="text-white/40 text-sm mb-10">Un giro gratis cada día</p>

        <div className="relative w-64 h-64 mb-10">
          <div
            className="w-full h-full rounded-full border-4 border-white/10 transition-transform duration-[3200ms] ease-out"
            style={{
              transform: `rotate(${rotation}deg)`,
              background: `conic-gradient(${COLORS.map((c, i) => `${c} ${i * 60}deg ${(i + 1) * 60}deg`).join(',')})`,
            }}
          />
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[16px] border-t-white" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-[#07060A] border-2 border-white/20" />
          </div>
        </div>

        {result && (
          <div className="text-center mb-6">
            {result.amount > 0 ? (
              <p className="font-mono text-2xl text-[#2FE0B0]">¡Ganaste ${result.amount}!</p>
            ) : (
              <p className="text-white/50">Esta vez no hubo suerte. ¡Vuelve mañana!</p>
            )}
          </div>
        )}

        {error && <p className="text-[#E0299B] text-xs mb-4 text-center max-w-xs">{error}</p>}

        <button
          onClick={spin}
          disabled={spinning}
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
