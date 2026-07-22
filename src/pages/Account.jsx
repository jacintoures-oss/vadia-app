import { useEffect, useState } from 'react';
import { Settings, Copy, Check, Users2, Coins, TrendingUp, ArrowUpToLine, ArrowDownToLine, LifeBuoy, History } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import BottomNav from './BottomNav';

export default function Account({ userId, onLogout, onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [movements, setMovements] = useState([]);
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [userId]);

  async function load() {
    setLoading(true);

    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(profileData);

    const { data: tx } = await supabase
      .from('transactions')
      .select('*, packages(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(15);
    setMovements(tx || []);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [{ count: teamSize }, { data: todayEarnings }, { data: deposits }, { data: withdrawals }] = await Promise.all([
      supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('referrer_id', userId),
      supabase.from('earnings').select('amount').eq('user_id', userId).gte('created_at', todayStart.toISOString()),
      supabase.from('transactions').select('amount').eq('user_id', userId).eq('type', 'deposit').eq('status', 'completed'),
      supabase.from('transactions').select('amount').eq('user_id', userId).eq('type', 'withdrawal').eq('status', 'completed'),
    ]);

    setStats({
      teamSize: teamSize || 0,
      todayEarnings: (todayEarnings || []).reduce((s, e) => s + Number(e.amount), 0),
      totalDeposited: (deposits || []).reduce((s, t) => s + Number(t.amount), 0),
      totalWithdrawn: (withdrawals || []).reduce((s, t) => s + Number(t.amount), 0),
    });

    setLoading(false);
  }

  function copyCode() {
    navigator.clipboard.writeText(profile.referral_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white/50">Cargando…</div>;
  }

  const statusLabel = { pending: 'En revisión', completed: 'Aprobado', rejected: 'Rechazado', failed: 'Falló' };
  const statusColor = { pending: 'text-[#F5A623]', completed: 'text-[#2FE0B0]', rejected: 'text-[#E0299B]', failed: 'text-[#E0299B]' };

  return (
    <div className="min-h-screen pb-28">
      {/* Header con degradado */}
      <div className="bg-gradient-to-br from-[#7C2FE0] via-[#E0299B] to-[#F5A623] px-6 pt-8 pb-8 rounded-b-[2rem]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-white/60" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/60 flex items-center justify-center font-display font-700 text-lg">
                {(profile?.full_name || 'V')[0].toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-display font-700">{profile?.full_name || 'Usuario Vadia'}</p>
              <p className="font-mono text-sm text-white/80">{profile?.phone}</p>
            </div>
          </div>
          <button onClick={() => onNavigate('settings')} className="text-white/90">
            <Settings size={22} />
          </button>
        </div>

        <button onClick={copyCode} className="flex items-center gap-1.5 mt-4 text-white/80 text-xs">
          Código: <span className="font-mono">{profile?.referral_code}</span>
          {copied ? <Check size={13} /> : <Copy size={13} />}
        </button>

        <div className="mt-6">
          <p className="text-white/70 text-xs mb-1">Saldo de la cuenta</p>
          <p className="font-mono text-3xl font-800">
            ${Number(profile?.available_balance || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="px-6">
        <h2 className="font-display font-700 text-lg mt-6 mb-4">Detalles de las ganancias</h2>

        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Users2} label="Tamaño del equipo" value={stats.teamSize} color="#7C2FE0" />
          <StatCard icon={Coins} label="Ganancias de hoy" value={`$${stats.todayEarnings.toLocaleString('es-MX')}`} color="#2FE0B0" />
          <StatCard icon={TrendingUp} label="Ingresos totales" value={`$${Number(profile?.total_earned || 0).toLocaleString('es-MX')}`} color="#F5A623" />
          <StatCard icon={ArrowUpToLine} label="Depósitos acumulados" value={`$${stats.totalDeposited.toLocaleString('es-MX')}`} color="#E0299B" />
        </div>
        <div className="mt-3">
          <StatCard icon={ArrowDownToLine} label="Retiros acumulados" value={`$${stats.totalWithdrawn.toLocaleString('es-MX')}`} color="#2F6FE0" wide />
        </div>

        {/* Soporte */}
        <button
          onClick={() => onNavigate('support')}
          className="w-full flex items-center gap-3 card-glow rounded-2xl p-5 bg-[#0F0D14] mt-6"
        >
          <div className="w-9 h-9 rounded-full bg-[#2FE0B0]/15 flex items-center justify-center">
            <LifeBuoy size={16} className="text-[#2FE0B0]" />
          </div>
          <span className="text-sm font-semibold">Soporte y ayuda</span>
        </button>

        {/* Historial */}
        <div className="mt-6">
          <div className="flex items-center gap-2 text-white/50 text-xs mb-3">
            <History size={14} /> Historial de movimientos
          </div>
          {movements.length === 0 && <p className="text-white/30 text-sm">Aún no tienes movimientos.</p>}
          <div className="space-y-2">
            {movements.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between bg-[#0F0D14] border border-white/10 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm">{tx.type === 'deposit' ? 'Depósito' : 'Retiro'} {tx.packages?.name ? `· ${tx.packages.name}` : ''}</p>
                  <p className="text-white/30 text-xs">{new Date(tx.created_at).toLocaleDateString('es-MX')}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm">${Number(tx.amount).toLocaleString('es-MX')}</p>
                  <p className={`text-[11px] ${statusColor[tx.status]}`}>{statusLabel[tx.status]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav current="account" onNavigate={onNavigate} />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, wide }) {
  return (
    <div className={`card-glow rounded-2xl p-4 bg-[#0F0D14] ${wide ? 'w-full' : ''}`}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ background: `${color}22` }}>
        <Icon size={15} style={{ color }} />
      </div>
      <p className="text-white/40 text-[11px]">{label}</p>
      <p className="font-mono text-base font-700 mt-0.5">{value}</p>
    </div>
  );
}
