import { useEffect, useState } from 'react';
import { ArrowLeft, ShieldCheck, Check } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function WithdrawalPassword({ onBack }) {
  const [hasPassword, setHasPassword] = useState(null);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    supabase.rpc('has_withdrawal_password').then(({ data }) => setHasPassword(!!data));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setMsg('');

    if (newPw.length < 4) {
      setMsg('La nueva clave debe tener al menos 4 caracteres.');
      return;
    }
    if (newPw !== confirmPw) {
      setMsg('Las dos claves nuevas no coinciden.');
      return;
    }
    if (hasPassword && !currentPw) {
      setMsg('Ingresa tu clave de retiro actual.');
      return;
    }

    setBusy(true);
    const { error } = await supabase.rpc('set_withdrawal_password', {
      p_current_password: hasPassword ? currentPw : null,
      p_new_password: newPw,
    });

    if (error) {
      setMsg(error.message || 'No se pudo guardar. Intenta de nuevo.');
    } else {
      setMsg('¡Clave de retiro guardada!');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setHasPassword(true);
    }
    setBusy(false);
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 text-sm mb-6 w-fit">
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck size={20} className="text-[#2FE0B0]" />
        <h1 className="font-display font-700 text-2xl">Clave de retiro</h1>
      </div>
      <p className="text-white/40 text-sm mb-8">
        {hasPassword
          ? 'Ya tienes una clave configurada. Ingresa la actual para cambiarla.'
          : 'Esta clave se te pedirá cada vez que solicites un retiro, además de tu contraseña de inicio de sesión.'}
      </p>

      <form onSubmit={submit} className="space-y-3">
        {hasPassword && (
          <input
            type="password" placeholder="Clave de retiro actual"
            value={currentPw} onChange={(e) => setCurrentPw(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7C2FE0]"
          />
        )}
        <input
          type="password" placeholder="Nueva clave de retiro"
          value={newPw} onChange={(e) => setNewPw(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7C2FE0]"
        />
        <input
          type="password" placeholder="Confirmar nueva clave de retiro"
          value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7C2FE0]"
        />

        {msg && (
          <p className={`text-xs flex items-center gap-1 ${msg.startsWith('¡') ? 'text-[#2FE0B0]' : 'text-[#E0299B]'}`}>
            {msg.startsWith('¡') && <Check size={12} />} {msg}
          </p>
        )}

        <button
          type="submit" disabled={busy}
          className="w-full bg-gradient-to-r from-[#7C2FE0] via-[#E0299B] to-[#F5A623] font-semibold py-3.5 rounded-xl disabled:opacity-50"
        >
          {busy ? 'Guardando…' : 'Guardar clave de retiro'}
        </button>
      </form>
    </div>
  );
}
