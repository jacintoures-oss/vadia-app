import { useState, useEffect } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function BuyPackage({ userId, onBack, onRequested }) {
  const [packages, setPackages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    supabase.from('packages').select('*').eq('is_active', true).order('price').then(({ data }) => {
      setPackages(data || []);
    });
  }, []);

  async function confirmPurchase() {
    if (!selected) return;
    setLoading(true);
    setError('');
    try {
      const { error: insertError } = await supabase.from('transactions').insert({
        user_id: userId,
        type: 'deposit',
        amount: selected.price,
        package_id: selected.id,
        status: 'pending',
      });
      if (insertError) throw insertError;
      setRequested(true);
    } catch (err) {
      setError(err.message || 'No se pudo crear la solicitud.');
    } finally {
      setLoading(false);
    }
  }

  if (requested) {
    return (
      <div className="min-h-screen px-6 py-8 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-full bg-[#2FE0B0]/15 flex items-center justify-center mb-6">
          <Check size={26} className="text-[#2FE0B0]" />
        </div>
        <h2 className="font-display font-700 text-xl mb-2">Solicitud enviada</h2>
        <p className="text-white/50 text-sm max-w-xs mb-8">
          Realiza tu depósito por ${selected.price.toLocaleString('es-MX')} y envíanos tu comprobante.
          En cuanto se confirme, tu paquete <b>{selected.name}</b> se activa automáticamente.
        </p>
        <button onClick={onRequested} className="bg-white text-black font-semibold px-8 py-3.5 rounded-full">
          Volver al panel
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 text-sm mb-8 w-fit">
        <ArrowLeft size={16} /> Volver
      </button>

      <h1 className="font-display font-700 text-2xl mb-6">Elige tu paquete</h1>

      <div className="space-y-3">
        {packages.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p)}
            className={`w-full text-left rounded-2xl p-5 border transition ${
              selected?.id === p.id ? 'border-[#E0299B] bg-[#E0299B]/10' : 'border-white/10 bg-[#0F0D14]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-700">{p.name}</h3>
                <p className="text-white/40 text-xs mt-1">{p.videos_per_day} videos/día · ${p.price_per_video} c/u</p>
              </div>
              <p className="font-mono text-xl font-700">${p.price.toLocaleString('es-MX')}</p>
            </div>
          </button>
        ))}
      </div>

      {error && <p className="text-[#E0299B] text-xs mt-4">{error}</p>}

      <button
        onClick={confirmPurchase}
        disabled={!selected || loading}
        className="w-full bg-gradient-to-r from-[#7C2FE0] via-[#E0299B] to-[#F5A623] font-semibold py-3.5 rounded-xl mt-8 disabled:opacity-30"
      >
        {loading ? 'Procesando…' : 'Confirmar compra'}
      </button>
    </div>
  );
}
