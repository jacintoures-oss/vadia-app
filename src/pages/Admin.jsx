import { useEffect, useState } from 'react';
import { ArrowLeft, Check, X, Users, Clock, History } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Admin({ onBack }) {
  const [tab, setTab] = useState('pending'); // 'pending' | 'users' | 'history'
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    load();
  }, [tab]);

  async function load() {
    setLoading(true);
    if (tab === 'pending') {
      const { data } = await supabase
        .from('transactions')
        .select('*, profiles(full_name, phone), packages(name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      setTransactions(data || []);
    } else if (tab === 'users') {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      setUsers(data || []);
    } else if (tab === 'history') {
      const { data } = await supabase
        .from('transactions')
        .select('*, profiles(full_name, phone), packages(name)')
        .neq('status', 'pending')
        .order('updated_at', { ascending: false })
        .limit(100);
      setHistory(data || []);
    }
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
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 text-sm mb-6 w-fit">
        <ArrowLeft size={16} /> Volver
      </button>

      <h1 className="font-display font-700 text-2xl mb-6">Panel admin</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/10">
        {[
          { key: 'pending', label: 'Pendientes', icon: Clock },
          { key: 'users', label: 'Usuarios', icon: Users },
          { key: 'history', label: 'Historial', icon: History },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 text-sm px-3 py-2.5 border-b-2 -mb-px ${
              tab === key ? 'border-[#E0299B] text-white' : 'border-transparent text-white/40'
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {loading && <p className="text-white/40 text-sm">Cargando…</p>}

      {/* Pendientes */}
      {!loading && tab === 'pending' && (
        <div className="space-y-3">
          {transactions.length === 0 && <p className="text-white/40 text-sm">No hay solicitudes pendientes.</p>}
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
      )}

      {/* Usuarios */}
      {!loading && tab === 'users' && (
        <div className="space-y-2">
          {users.length === 0 && <p className="text-white/40 text-sm">No hay usuarios todavía.</p>}
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between bg-[#0F0D14] border border-white/10 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm">{u.full_name || 'Sin nombre'} {u.is_admin && <span className="text-[#F5A623] text-[10px] ml-1">ADMIN</span>}</p>
                <p className="text-white/40 text-xs font-mono">{u.phone}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm text-[#2FE0B0]">${Number(u.available_balance).toLocaleString('es-MX')}</p>
                <p className="text-white/30 text-[11px]">Total: ${Number(u.total_earned).toLocaleString('es-MX')}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Historial */}
      {!loading && tab === 'history' && (
        <div className="space-y-2">
          {history.length === 0 && <p className="text-white/40 text-sm">Sin movimientos todavía.</p>}
          {history.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between bg-[#0F0D14] border border-white/10 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm">{tx.profiles?.full_name || 'Sin nombre'}</p>
                <p className="text-white/40 text-xs">
                  {tx.type === 'deposit' ? 'Depósito' : 'Retiro'} {tx.packages?.name ? `· ${tx.packages.name}` : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm">${Number(tx.amount).toLocaleString('es-MX')}</p>
                <p className={`text-[11px] ${tx.status === 'completed' ? 'text-[#2FE0B0]' : 'text-[#E0299B]'}`}>
                  {tx.status === 'completed' ? 'Aprobado' : 'Rechazado'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
