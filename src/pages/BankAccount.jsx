import { useEffect, useState } from 'react';
import { ArrowLeft, Landmark, Lock, LifeBuoy, Check } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const BANKS = [
  'BBVA México', 'Banco Azteca', 'BanCoppel', 'Nu México', 'STP',
  'Santander', 'Banorte', 'Banamex', 'Mercado Pago W', 'Banregio',
  'HSBC', 'Bankaool', 'Consubanco', 'Banjercito', 'Banco del Bajío', 'Oxxo',
];

export default function BankAccount({ userId, onBack, onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [clabe, setClabe] = useState('');
  const [bank, setBank] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase.from('profiles').select('full_name, bank_clabe, bank_name').eq('id', userId).single();
    setProfile(data);
    setLoading(false);
  }

  async function submit(e) {
    e.preventDefault();
    setMsg('');
    const digits = clabe.replace(/\D/g, '');
    if (digits.length !== 18) {
      setMsg('La CLABE debe tener exactamente 18 dígitos.');
      return;
    }
    if (!bank) {
      setMsg('Selecciona tu banco.');
      return;
    }
    setSaving(true);
    const { error } = await supabase.rpc('set_bank_account', { p_clabe: digits, p_bank_name: bank });
    if (error) {
      setMsg(error.message);
    } else {
      await load();
    }
    setSaving(false);
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white/50">Cargando…</div>;
  }

  const configured = !!profile?.bank_clabe;

  return (
    <div className="min-h-screen px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 text-sm mb-6 w-fit">
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="flex items-center gap-2 mb-1">
        <Landmark size={20} className="text-[#2FE0B0]" />
        <h1 className="font-display font-700 text-2xl">Cuenta bancaria</h1>
      </div>

      {configured ? (
        <>
          <p className="text-white/40 text-sm mb-8">
            Ya tienes una cuenta configurada. Por seguridad, no se puede editar desde la app.
          </p>

          <div className="card-glow rounded-2xl p-6 bg-[#0F0D14] space-y-4 mb-6">
            <div>
              <p className="text-white/40 text-xs mb-1">Nombre del titular</p>
              <p className="text-sm">{profile.full_name}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-1">CLABE</p>
              <p className="font-mono text-sm">{profile.bank_clabe}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-1">Banco</p>
              <p className="text-sm">{profile.bank_name}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
            <Lock size={16} className="text-white/40 shrink-0 mt-0.5" />
            <p className="text-white/50 text-xs">
              ¿Necesitas cambiarla? Escríbenos por soporte y un administrador la libera para que puedas
              configurar una nueva.
            </p>
          </div>

          <button
            onClick={() => onNavigate('support')}
            className="w-full flex items-center justify-center gap-2 bg-white/10 font-semibold py-3.5 rounded-xl"
          >
            <LifeBuoy size={16} /> Contactar soporte
          </button>
        </>
      ) : (
        <>
          <p className="text-white/40 text-sm mb-8">
            Configúrala una sola vez. Se usará para todos tus retiros.
          </p>

          <form onSubmit={submit} className="space-y-3">
            <div>
              <p className="text-white/40 text-xs mb-1.5">Nombre del titular</p>
              <input
                disabled value={profile?.full_name || ''}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/50"
              />
            </div>

            <div>
              <p className="text-white/40 text-xs mb-1.5">CLABE (18 dígitos)</p>
              <input
                value={clabe} onChange={(e) => setClabe(e.target.value)} placeholder="18 dígitos"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-[#7C2FE0]"
              />
            </div>

            <div>
              <p className="text-white/40 text-xs mb-1.5">Banco</p>
              <select
                value={bank} onChange={(e) => setBank(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7C2FE0]"
              >
                <option value="" className="bg-[#0F0D14]">Selecciona tu banco</option>
                {BANKS.map((b) => (
                  <option key={b} value={b} className="bg-[#0F0D14]">{b}</option>
                ))}
              </select>
            </div>

            {msg && <p className="text-[#E0299B] text-xs">{msg}</p>}

            <button
              type="submit" disabled={saving}
              className="w-full bg-gradient-to-r from-[#7C2FE0] via-[#E0299B] to-[#F5A623] font-semibold py-3.5 rounded-xl disabled:opacity-50"
            >
              {saving ? 'Guardando…' : 'Guardar cuenta bancaria'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
