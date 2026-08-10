import { useEffect, useState } from 'react';
import { ArrowLeft, ShieldAlert, Landmark } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Withdraw({ userId, balance, onBack, onDone, onNavigate }) {
  const [amount, setAmount] = useState('');
  const [withdrawalPassword, setWithdrawalPassword] = useState('');
  const [hasWithdrawalPw, setHasWithdrawalPw] = useState(null);
  const [bankInfo, setBankInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    check();
  }, []);

  async function check() {
    setChecking(true);
    const [{ data: hasPw }, { data: profile }] = await Promise.all([
      supabase.rpc('has_withdrawal_password'),
      supabase.from('profiles').select('bank_clabe, bank_name, full_name').eq('id', userId).single(),
    ]);
    setHasWithdrawalPw(!!hasPw);
    setBankInfo(profile);
    setChecking(false);
  }

  async function submit(e) {
    e.preventDefault();
    setError('');

    const value = Number(amount);
    if (!value || value <= 0) {
      setError('Ingresa un monto válido.');
      return;
    }
    if (!withdrawalPassword) {
      setError('Ingresa tu clave de retiro.');
      return;
    }

    setLoading(true);
    try {
      const { error: rpcError } = await supabase.rpc('request_withdrawal', {
        p_amount: value,
        p_withdrawal_password: withdrawalPassword,
      });
      if (rpcError) throw rpcError;
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'No se pudo solicitar el retiro.');
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center text-white/50">Cargando…</div>;
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

  const bankConfigured = !!bankInfo?.bank_clabe;
  const canWithdraw = hasWithdrawalPw && bankConfigured;

  return (
    <div className="min-h-screen px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 text-sm mb-8 w-fit">
        <ArrowLeft size={16} /> Volver
      </button>

      <h1 className="font-display font-700 text-2xl mb-1">Solicitar retiro</h1>
      <p className="text-white/50 text-sm mb-6">
        Saldo disponible: <span className="font-mono text-[#2FE0B0]">${Number(balance).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
      </p>

      {!hasWithdrawalPw && (
        <div className="flex items-start gap-3 bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-xl p-4 mb-4">
          <ShieldAlert size={16} className="text-[#F5A623] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[#F5A623] text-xs mb-2">Necesitas configurar tu clave de retiro.</p>
            <button
              type="button" onClick={() => onNavigate('withdrawal-password')}
              className="text-xs font-semibold bg-[#F5A623] text-black px-3 py-1.5 rounded-lg"
            >
              Configurar ahora
            </button>
          </div>
        </div>
      )}

      {hasWithdrawalPw && !bankConfigured && (
        <div className="flex items-start gap-3 bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-xl p-4 mb-4">
          <Landmark size={16} className="text-[#F5A623] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[#F5A623] text-xs mb-2">Necesitas configurar tu cuenta bancaria.</p>
            <button
              type="button" onClick={() => onNavigate('bank-account')}
              className="text-xs font-semibold bg-[#F5A623] text-black px-3 py-1.5 rounded-lg"
            >
              Configurar ahora
            </button>
          </div>
        </div>
      )}

      {bankConfigured && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-xs">
          <p className="text-white/40 mb-1">Se depositará a:</p>
          <p className="text-white/70">{bankInfo.bank_name} · {bankInfo.full_name}</p>
          <p className="text-white/50 font-mono mt-0.5">{bankInfo.bank_clabe}</p>
        </div>
      )}

      <form onSubmit={submit} className="space-y-3">
        <input
          type="number" step="0.01" placeholder="Monto a retirar" required
          value={amount} onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7C2FE0] font-mono"
        />
        <input
          type="password" placeholder="Clave de retiro" required
          value={withdrawalPassword} onChange={(e) => setWithdrawalPassword(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7C2FE0]"
        />

        {error && <p className="text-[#E0299B] text-xs">{error}</p>}

        <button
          type="submit" disabled={loading || !canWithdraw}
          className="w-full bg-gradient-to-r from-[#7C2FE0] via-[#E0299B] to-[#F5A623] font-semibold py-3.5 rounded-xl disabled:opacity-50"
        >
          {loading ? 'Procesando…' : 'Solicitar retiro'}
        </button>
      </form>
    </div>
  );
}
