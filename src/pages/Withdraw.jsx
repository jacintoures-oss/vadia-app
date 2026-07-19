import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Withdraw({ balance, onBack, onDone }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    const value = Number(amount);
    if (!value || value <= 0) {
      setError('Ingresa un monto válido.');
      return;
    }
    setLoading(true);
    try {
      const { error: rpcError } = await supabase.rpc('request_withdrawal', { p_amount: value });
      if (rpcError) throw rpcError;
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'No se pudo solicitar el retiro.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen px-6 py-8 flex flex-col items-center justify-center text-center">
        <h2 className="font-display font-700 text-xl mb-2">Retiro solicitado</h2>
        <p className="text-white/50 text-sm max-w-xs mb-8">
          Tu solicitud de ${Number(amount).toLocaleString('es-MX')} está en revisión. Te llegará a tu cuenta en cuanto se apruebe.
        </p>
        <button onClick={onDone} className="bg-white text-black font-semibold px-8 py-3.5 rounded-full">
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

      <h1 className="font-display font-700 text-2xl mb-1">Solicitar retiro</h1>
      <p className="text-white/50 text-sm mb-8">
        Saldo disponible: <span className="font-mono text-[#2FE0B0]">${Number(balance).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
      </p>

      <form onSubmit={submit} className="space-y-4">
        <input
          type="number" step="0.01" placeholder="Monto a retirar" required
          value={amount} onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7C2FE0] font-mono"
        />
        {error && <p className="text-[#E0299B] text-xs">{error}</p>}
        <button
          type="submit" disabled={loading}
          className="w-full bg-gradient-to-r from-[#7C2FE0] via-[#E0299B] to-[#F5A623] font-semibold py-3.5 rounded-xl disabled:opacity-50"
        >
          {loading ? 'Procesando…' : 'Solicitar retiro'}
        </button>
      </form>
    </div>
  );
}
