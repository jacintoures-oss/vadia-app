import { useEffect, useState } from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Admin({ onBack }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('transactions')
      .select('*, profiles(full_name, phone), packages(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    setTransactions(data || []);
    setLoading(false);
  }

  async function resolve(id, status) {
    setBusyId(id);
    await supabase.from('transactions').update({ status }).eq('id', id);
    await load();
    setBusyId(null);
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 text-sm mb-8 w-fit">
        <ArrowLeft size={16} /> Volver
      </button>

      <h1 className="font-display font-700 text-2xl mb-1">Panel admin</h1>
      <p className="text-white/50 text-sm mb-8">Solicitudes pendientes</p>

      {loading && <p className="text-white/40 text-sm">Cargando…</p>}

      {!loading && transactions.length === 0 && (
        <p className="text-white/40 text-sm">No hay solicitudes pendientes.</p>
      )}

      <div className="space-y-3">
        {transactions.map((tx) => (
          <div key={tx.id} className="card-glow rounded-2xl p-5 bg-[#0F0D14]">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-mono uppercase px-2 py-0.5 rounded-full ${
                tx.type === 'deposit' ? 'bg-[#2FE0B0]/15 text-[#2FE0B0]' : 'bg-[#F5A623]/15 text-[#F5A623]'
              }`}>
                {tx.type === 'deposit' ? 'Depósito' : 'Retiro'}
              </span>
              <span className="font-mono text-lg font-700">${Number(tx.amount).toLocaleString('es-MX')}</span>
            </div>
            <p className="text-sm">{tx.profiles?.full_name || 'Sin nombre'}</p>
            <p className="text-white/40 text-xs mb-4">
              {tx.profiles?.phone} {tx.packages?.name ? `· ${tx.packages.name}` : ''}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => resolve(tx.id, 'completed')}
                disabled={busyId === tx.id}
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#2FE0B0] text-black text-sm font-semibold py-2.5 rounded-xl disabled:opacity-40"
              >
                <Check size={15} /> Aprobar
              </button>
              <button
                onClick={() => resolve(tx.id, 'rejected')}
                disabled={busyId === tx.id}
                className="flex-1 flex items-center justify-center gap-1.5 bg-white/10 text-sm font-semibold py-2.5 rounded-xl disabled:opacity-40"
              >
                <X size={15} /> Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
