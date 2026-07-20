import { useState } from 'react';
import { Play, Wallet, Users } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const SLIDES = [
  {
    icon: Play,
    title: 'Mira anuncios',
    text: 'Ve los videos publicitarios que te asigna tu paquete cada día.',
  },
  {
    icon: Wallet,
    title: 'Gana dinero real',
    text: 'Cada video visto suma directo a tu saldo disponible. Retira cuando quieras.',
  },
  {
    icon: Users,
    title: 'Invita y gana más',
    text: 'Comparte tu código y gana comisión de hasta 3 niveles de referidos.',
  },
];

export default function Onboarding({ userId, onFinish }) {
  const [step, setStep] = useState(0);
  const isLast = step === SLIDES.length - 1;
  const Slide = SLIDES[step];

  async function finish() {
    await supabase.from('profiles').update({ has_seen_onboarding: true }).eq('id', userId);
    onFinish();
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-8">
          <Slide.icon size={30} className="text-[#2FE0B0]" />
        </div>
        <h1 className="font-display font-700 text-2xl mb-3">{Slide.title}</h1>
        <p className="text-white/50 text-sm max-w-xs">{Slide.text}</p>
      </div>

      <div className="flex items-center justify-center gap-2 mb-8">
        {SLIDES.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-[#E0299B]' : 'w-1.5 bg-white/15'}`} />
        ))}
      </div>

      <button
        onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
        className="w-full bg-gradient-to-r from-[#7C2FE0] via-[#E0299B] to-[#F5A623] font-semibold py-3.5 rounded-xl"
      >
        {isLast ? 'Empezar' : 'Siguiente'}
      </button>
      {!isLast && (
        <button onClick={finish} className="text-white/30 text-sm mt-4 mx-auto">
          Omitir
        </button>
      )}
    </div>
  );
}
