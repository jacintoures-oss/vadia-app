import { useEffect, useState } from 'react';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Withdraw({ balance, onBack, onDone, onNavigate }) {
  const [amount, setAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [bankName, setBankName] = useState('');
  const [withdrawalPassword, setWithdrawalPassword] = useState('');
  const [hasWithdrawalPw, setHasWithdrawalPw] = useState(null); // null = cargando
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    supabase.rpc('has_withdrawal_password').then(({ data }) => setHasWithdrawalPw(!!data));
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError('');

    const value = Number(amount);
    if (!value || value <= 0) {
      setError('Ingresa un monto válido.');
      return;
    }
    const digits = bankAccount.replace(/\D/g, '');
    if (digits.length < 16 || digits.length > 18) {
      setError('El número de cuenta debe tener entre 16 y 18 dígitos.');
      return;
    }
    if (!accountHolder.trim()) {
      setError('Ingresa el nombre del titular de la cuenta.');
      return;
    }
    if (!bankName.trim()) {
      setError('Ingresa el nombre del banco.');
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
        p_bank_account: bankAccount,
        p_account_holder: accountHolder.trim(),
        p_bank_name: bankName.trim(),
      });
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
      <p className="text-white/50 text-sm mb-6">
        Saldo disponible: <span className="font-mono text-[#2FE0B0]">${Number(balance).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
      </p>

      {hasWithdrawalPw === false && (
        <div className="flex items-start gap-3 bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-xl p-4 mb-6">
          <ShieldAlert size={16} className="text-[#F5A623] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-[#F5A623] text-xs mb-2">
              Antes de retirar, necesitas configurar tu clave de retiro.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('withdrawal-password')}
              className="text-xs font-semibold bg-[#F5A623] text-black px-3 py-1.5 rounded-lg"
            >
              Configurar ahora
            </button>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="space-y-3">
        <input
          type="number" step="0.01" placeholder="Monto a retirar" required
          value={amount} onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7C2FE0] font-mono"
        />
        <input
          type="text" placeholder="Número de cuenta (16 a 18 dígitos)" required
          value={bankAccount} onChange={(e) => setBankAccount(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7C2FE0] font-mono"
        />
        <input
          type="text" placeholder="Nombre del titular de la cuenta" required
          value={accountHolder} onChange={(e) => setAccountHolder(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7C2FE0]"
        />
        <input
          type="text" placeholder="Nombre del banco" required
          value={bankName} onChange={(e) => setBankName(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7C2FE0]"
        />
        <input
          type="password" placeholder="Clave de retiro" required
          value={withdrawalPassword} onChange={(e) => setWithdrawalPassword(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7C2FE0]"
        />

        {error && <p className="text-[#E0299B] text-xs">{error}</p>}

        <button
          type="submit" disabled={loading || hasWithdrawalPw === false}
          className="w-full bg-gradient-to-r from-[#7C2FE0] via-[#E0299B] to-[#F5A623] font-semibold py-3.5 rounded-xl disabled:opacity-50"
        >
          {loading ? 'Procesando…' : 'Solicitar retiro'}
        </button>
      </form>
    </div>
  );
}
