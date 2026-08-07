import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Crown } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function BuyPackage({ userId, onBack, onRequested }) {
  const [packages, setPackages] = useState([]);
  const [activePackage, setActivePackage] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requestedPkg, setRequestedPkg] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const [{ data: pkgs }, { data: pkgData }] = await Promise.all([
      supabase.from('packages').select('*').eq('is_active', true).order('price'),
      supabase.from('user_packages').select('package_id').eq('user_id', userId).eq('is_active', true).maybeSingle(),
    ]);
    setPackages(pkgs || []);
    setActivePackage(pkgData);
  }

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.firstChild?.offsetWidth || 1;
    const gap = 12;
    const index = Math.round(el.scrollLeft / (cardWidth + gap));
    setActiveIndex(Math.min(Math.max(index, 0), packages.length - 1));
  }

  async function confirmPurchase(pkg) {
    setLoading(true);
    setError('');
    try {
      const { error: insertError } = await supabase.from('transactions').insert({
        user_id: userId,
        type: 'deposit',
        amount: pkg.price,
        package_id: pkg.id,
        status: 'pending',
      });
      if (insertError) throw insertError;
      setRequestedPkg(pkg);
    } catch (err) {
      setError(err.message || 'No se pudo crear la solicitud.');
    } finally {
      setLoading(false);
    }
  }

  if (requestedPkg) {
    return (
      <div className="min-h-screen px-6 py-8 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-full bg-[#2FE0B0]/15 flex items-center justify-center mb-6">
          <Check size={26} className="text-[#2FE0B0]" />
        </div>
        <h2 className="font-display font-700 text-xl mb-2">Solicitud enviada</h2>
        <p className="text-white/50 text-sm max-w-xs mb-8">
          Realiza tu depósito por ${requestedPkg.price.toLocaleString('es-MX')} y envíanos tu comprobante.
          En cuanto se confirme, tu paquete <b>{requestedPkg.name}</b> se activa automáticamente.
        </p>
        <button onClick={onRequested} className="bg-white text-black font-semibold px-8 py-3.5 rounded-full">
          Volver al panel
        </button>
      </div>
    );
  }

  const selected = packages[activeIndex];
  const dailyEarning = selected ? selected.videos_per_day * selected.price_per_video : 0;

  return (
    <div className="min-h-screen px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 text-sm mb-6 w-fit">
        <ArrowLeft size={16} /> Volver
      </button>

      <h1 className="font-display font-700 text-2xl text-center mb-6">Centro Vadia</h1>

      {/* Puntitos de progreso */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {packages.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${i === activeIndex ? 'w-6 bg-[#E0299B]' : 'w-1.5 bg-white/15'}`}
          />
        ))}
      </div>

      {/* Carrusel deslizable */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-6 px-6"
        style={{ scrollbarWidth: 'none' }}
      >
        {packages.map((pkg) => {
          const isCurrent = activePackage?.package_id === pkg.id;
          return (
            <div
              key={pkg.id}
              className="snap-center shrink-0 w-[85%] rounded-3xl p-6 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #1a1220, #0F0D14 60%)' }}
            >
              <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 85% 0%, #E0299B, transparent 60%)' }} />

              {isCurrent && (
                <span className="relative z-10 inline-block text-[10px] font-mono uppercase bg-[#2FE0B0]/15 text-[#2FE0B0] px-2 py-1 rounded-full mb-3">
                  Nivel actual
                </span>
              )}

              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h2 className="font-display font-800 text-3xl gradient-text">{pkg.name}</h2>
                  <p className="text-white/60 text-sm mt-2">Tareas diarias: <b className="text-white">{pkg.videos_per_day}</b></p>
                  <p className="text-[#F5A623] text-xs mt-1">Válido por 1 año</p>
                </div>
                <Crown size={40} className="text-[#F5A623] opacity-80" />
              </div>

              <button
                onClick={() => confirmPurchase(pkg)}
                disabled={loading}
                className="relative z-10 w-full mt-6 bg-gradient-to-r from-[#7C2FE0] via-[#E0299B] to-[#F5A623] font-semibold py-3 rounded-full disabled:opacity-50"
              >
                ${pkg.price.toLocaleString('es-MX')} · {isCurrent ? 'Renovar' : 'Actualizar'}
              </button>
            </div>
          );
        })}
      </div>

      {error && <p className="text-[#E0299B] text-xs text-center mt-4">{error}</p>}

      {/* Estadísticas del paquete seleccionado */}
      {selected && (
        <div className="grid grid-cols-2 gap-3 mt-8">
          <div className="card-glow rounded-2xl p-5 bg-[#0F0D14] text-center">
            <p className="font-mono text-2xl font-700 text-[#2FE0B0]">${dailyEarning.toLocaleString('es-MX')}</p>
            <p className="text-white/40 text-xs mt-1">Ganancias diarias</p>
          </div>
          <div className="card-glow rounded-2xl p-5 bg-[#0F0D14] text-center">
            <p className="font-mono text-2xl font-700 text-[#F5A623]">${Number(selected.price_per_video).toLocaleString('es-MX')}</p>
            <p className="text-white/40 text-xs mt-1">Pago por video</p>
          </div>
        </div>
      )}
    </div>
  );
}
