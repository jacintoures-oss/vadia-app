import { useEffect, useState } from 'react';
import { ArrowLeft, Check, X, Users, Clock, History, LayoutGrid, Package, Settings, Wallet } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const TABS = [
  { key: 'overview', label: 'Resumen', icon: LayoutGrid },
  { key: 'pending', label: 'Pendientes', icon: Clock },
  { key: 'users', label: 'Usuarios', icon: Users },
  { key: 'history', label: 'Historial', icon: History },
  { key: 'packages', label: 'Paquetes', icon: Package },
  { key: 'settings', label: 'Config', icon: Settings },
];

export default function Admin({ onBack }) {
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [history, setHistory] = useState([]);
  const [packages, setPackages] = useState([]);
  const [settings, setSettings] = useState(null);

  const [busyId, setBusyId] = useState(null);
  const [adjustUserId, setAdjustUserId] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState('');

  useEffect(() => {
    load();
  }, [tab]);

  async function load() {
    setLoading(true);
    if (tab === 'overview') await loadOverview();
    if (tab === 'pending') await loadPending();
    if (tab === 'users') await loadUsers();
    if (tab === 'history') await loadHistory();
    if (tab === 'packages') await loadPackages();
    if (tab === 'settings') await loadSettings();
    setLoading(false);
  }

  async function loadOverview() {
    const [{ count: totalUsers }, { data: profilesAgg }, { data: deposits }, { data: withdrawals }, { count: activePkgs }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('available_balance, total_earned'),
      supabase.from('transactions').select('amount').eq('type', 'deposit').eq('status', 'completed'),
      supabase.from('transactions').select('amount').eq('type', 'withdrawal').eq('status', 'completed'),
      supabase.from('user_packages').select('*', { count: 'exact', head: true }).eq('is_active', true),
    ]);
    const totalBalance = (profilesAgg || []).reduce((s, p) => s + Number(p.available_balance), 0);
    const totalEarned = (profilesAgg || []).reduce((s, p) => s + Number(p.total_earned), 0);
    const totalDeposited = (deposits || []).reduce((s, t) => s + Number(t.amount), 0);
    const totalWithdrawn = (withdrawals || []).reduce((s, t) => s + Number(t.amount), 0);
    setStats({ totalUsers, totalBalance, totalEarned, totalDeposited, totalWithdrawn, activePkgs });
  }

  async function loadPending() {
    const { data } = await supabase
      .from('transactions')
      .select('*, profiles(full_name, phone), packages(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    setTransactions(data || []);
  }

  async function loadUsers() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
  }

  async function loadHistory() {
    const { data } = await supabase
      .from('transactions')
      .select('*, profiles(full_name, phone), packages(name)')
      .neq('status', 'pending')
      .order('updated_at', { ascending: false })
      .limit(100);
    setHistory(data || []);
  }

  async function loadPackages() {
    const { data } = await supabase.from('packages').select('*').order('price');
    setPackages(data || []);
  }

  async function loadSettings() {
    const { data } = await supabase.from('settings').select('*');
    const map = {};
    (data || []).forEach((s) => { map[s.key] = s.value; });
    setSettings(map);
  }

  async function resolve(id, status) {
    setBusyId(id);
    await supabase.from('transactions').update({ status }).eq('id', id);
    await loadPending();
    setBusyId(null);
  }

  async function savePackage(pkg) {
    setBusyId(pkg.id);
    await supabase.from('packages').update({
      price: pkg.price,
      videos_per_day: pkg.videos_per_day,
      price_per_video: pkg.price_per_video,
      is_active: pkg.is_active,
    }).eq('id', pkg.id);
    setBusyId(null);
  }

  async function saveSettings() {
    setBusyId('settings');
    await supabase.from('settings').update({ value: settings.referral_rates }).eq('key', 'referral_rates');
    await supabase.from('settings').update({ value: settings.min_withdrawal }).eq('key', 'min_withdrawal');
    setBusyId(null);
  }

  async function submitAdjustment(userId) {
    const value = Number(adjustAmount);
    if (!value) return;
    setBusyId(userId);
    await supabase.rpc('admin_adjust_balance', { p_user_id: userId, p_amount: value, p_note: 'Ajuste manual desde panel admin' });
    setAdjustUserId(null);
    setAdjustAmount('');
    await loadUsers();
    setBusyId(null);
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 text-sm mb-6 w-fit">
        <ArrowLeft size={16} /> Volver
      </button>

      <h1 className="font-display font-700 text-2xl mb-6">Panel admin</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-white/10 overflow-x-auto">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-2.5 border-b-2 -mb-px whitespace-nowrap ${
              tab === key ? 'border-[#E0299B] text-white' : 'border-transparent text-white/40'
            }`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {loading && <p className="text-white/40 text-sm">Cargando…</p>}

      {/* Resumen */}
      {!loading && tab === 'overview' && stats && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Usuarios totales" value={stats.totalUsers} />
          <StatCard label="Paquetes activos" value={stats.activePkgs} />
          <StatCard label="Saldo en el sistema" value={`$${stats.totalBalance.toLocaleString('es-MX')}`} />
          <StatCard label="Total ganado (usuarios)" value={`$${stats.totalEarned.toLocaleString('es-MX')}`} />
          <StatCard label="Depositado (aprobado)" value={`$${stats.totalDeposited.toLocaleString('es-MX')}`} accent="#2FE0B0" />
          <StatCard label="Retirado (aprobado)" value={`$${stats.totalWithdrawn.toLocaleString('es-MX')}`} accent="#F5A623" />
        </div>
      )}

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
            <div key={u.id} className="bg-[#0F0D14] border border-white/10 rounded-xl px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">{u.full_name || 'Sin nombre'} {u.is_admin && <span className="text-[#F5A623] text-[10px] ml-1">ADMIN</span>}</p>
                  <p className="text-white/40 text-xs font-mono">{u.phone}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-[#2FE0B0]">${Number(u.available_balance).toLocaleString('es-MX')}</p>
                  <p className="text-white/30 text-[11px]">Total: ${Number(u.total_earned).toLocaleString('es-MX')}</p>
                </div>
              </div>

              {adjustUserId === u.id ? (
                <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                  <input
                    type="number" step="0.01" placeholder="+/- monto" autoFocus
                    value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono outline-none"
                  />
                  <button
                    onClick={() => submitAdjustment(u.id)}
                    disabled={busyId === u.id}
                    className="bg-[#2FE0B0] text-black text-xs font-semibold px-3 rounded-lg"
                  >
                    Aplicar
                  </button>
                  <button onClick={() => setAdjustUserId(null)} className="text-white/40 text-xs px-2">Cancelar</button>
                </div>
              ) : (
                <button
                  onClick={() => setAdjustUserId(u.id)}
                  className="flex items-center gap-1.5 text-white/40 text-[11px] mt-2 pt-2 border-t border-white/10 w-full"
                >
                  <Wallet size={12} /> Ajustar saldo manualmente
                </button>
              )}
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

      {/* Paquetes */}
      {!loading && tab === 'packages' && (
        <div className="space-y-3">
          {packages.map((pkg, i) => (
            <div key={pkg.id} className="card-glow rounded-2xl p-5 bg-[#0F0D14]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-700">{pkg.name}</h3>
                <label className="flex items-center gap-2 text-xs text-white/50">
                  <input
                    type="checkbox" checked={pkg.is_active}
                    onChange={(e) => {
                      const copy = [...packages]; copy[i].is_active = e.target.checked; setPackages(copy);
                    }}
                  />
                  Activo
                </label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Field label="Precio">
                  <input type="number" value={pkg.price} onChange={(e) => {
                    const copy = [...packages]; copy[i].price = Number(e.target.value); setPackages(copy);
                  }} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono" />
                </Field>
                <Field label="Videos/día">
                  <input type="number" value={pkg.videos_per_day} onChange={(e) => {
                    const copy = [...packages]; copy[i].videos_per_day = Number(e.target.value); setPackages(copy);
                  }} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono" />
                </Field>
                <Field label="$ / video">
                  <input type="number" value={pkg.price_per_video} onChange={(e) => {
                    const copy = [...packages]; copy[i].price_per_video = Number(e.target.value); setPackages(copy);
                  }} className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono" />
                </Field>
              </div>
              <button
                onClick={() => savePackage(pkg)}
                disabled={busyId === pkg.id}
                className="w-full bg-white/10 text-sm font-semibold py-2 rounded-xl mt-4"
              >
                {busyId === pkg.id ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Configuración */}
      {!loading && tab === 'settings' && settings && (
        <div className="card-glow rounded-2xl p-5 bg-[#0F0D14] space-y-4">
          <div>
            <p className="text-white/50 text-xs mb-2">Comisiones de referidos (%)</p>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map((lvl) => (
                <Field key={lvl} label={`Nivel ${lvl}`}>
                  <input
                    type="number" step="0.01"
                    value={settings.referral_rates?.[`level${lvl}`] ?? ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      referral_rates: { ...settings.referral_rates, [`level${lvl}`]: Number(e.target.value) },
                    })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs font-mono"
                  />
                </Field>
              ))}
            </div>
          </div>
          <div>
            <p className="text-white/50 text-xs mb-2">Retiro mínimo ($)</p>
            <input
              type="number"
              value={settings.min_withdrawal?.amount ?? ''}
              onChange={(e) => setSettings({ ...settings, min_withdrawal: { amount: Number(e.target.value) } })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono"
            />
          </div>
          <button
            onClick={saveSettings}
            disabled={busyId === 'settings'}
            className="w-full bg-gradient-to-r from-[#7C2FE0] via-[#E0299B] to-[#F5A623] font-semibold py-3 rounded-xl"
          >
            {busyId === 'settings' ? 'Guardando…' : 'Guardar configuración'}
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="card-glow rounded-2xl p-4 bg-[#0F0D14]">
      <p className="text-white/40 text-[11px] mb-1">{label}</p>
      <p className="font-mono text-lg font-700" style={accent ? { color: accent } : {}}>{value}</p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <p className="text-white/30 text-[10px] mb-1">{label}</p>
      {children}
    </div>
  );
      }
