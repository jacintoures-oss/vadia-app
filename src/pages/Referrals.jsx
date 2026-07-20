import { useEffect, useState } from 'react';
import { Copy, Check, Users } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import BottomNav from './BottomNav';

const LEVEL_RATES = { 1: '10%', 2: '3%', 3: '1%' };

export default function Referrals({ userId, onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [referredUsers, setReferredUsers] = useState([]); // {level, full_name, phone, created_at}
  const [earningsByLevel, setEarningsByLevel] = useState({ 1: 0, 2: 0, 3: 0 });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [userId]);

  async function load() {
    setLoading(true);

    const { data: profileData } = await supabase
      .from('profiles')
      .select('referral_code')
      .eq('id', userId)
      .single();
    setProfile(profileData);

    const { data: refs } = await supabase
      .from('referrals')
      .select('level, referred_id, profiles!referrals_referred_id_fkey(full_name, phone, created_at)')
      .eq('referrer_id', userId)
      .order('level');
    setReferredUsers(
      (refs || []).map((r) => ({
        level: r.level,
        full_name: r.profiles?.full_name,
        phone: r.profiles?.phone,
        created_at: r.profiles?.created_at,
      }))
    );

    const { data: earnings } = await supabase
      .from('earnings')
      .select('type, amount')
      .eq('user_id', userId)
      .in('type', ['referral_l1', 'referral_l2', 'referral_l3']);

    const totals = { 1: 0, 2: 0, 3: 0 };
    (earnings || []).forEach((e) => {
      const level = Number(e.type.slice(-1));
      totals[level] += Number(e.amount);
    });
    setEarningsByLevel(totals);

    setLoading(false);
  }

  const link = profile ? `${window.location.origin}/?ref=${profile.referral_code}` : '';

  function copyLink() {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const totalCommission = earningsByLevel[1] + earningsByLevel[2] + earningsByLevel[3];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white/50">Cargando…</div>;
  }

  return (
    <div className="min-h-screen px-6 py-8 pb-28">
      <span className="font-display font-800 text-xl">vadia</span>

      <h1 className="font-display font-700 text-2xl mt-6 mb-1">Invita y gana</h1>
      <p className="text-white/50 text-sm mb-6">10% nivel 1 · 3% nivel 2 · 1% nivel 3</p>

      {/* Código + link */}
      <div className="card-glow rounded-2xl p-6 bg-[#0F0D14]">
        <p className="text-white/50 text-xs mb-1">Tu código</p>
        <p className="font-mono text-2xl text-[#2FE0B0] mb-4">{profile?.referral_code}</p>
        <button
          onClick={copyLink}
          className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl py-3 text-sm"
        >
          {copied ? <Check size={15} className="text-[#2FE0B0]" /> : <Copy size={15} />}
          {copied ? 'Copiado' : 'Copiar link de invitación'}
        </button>
      </div>

      {/* Ganancias totales */}
      <div className="card-glow rounded-2xl p-6 bg-[#0F0D14] mt-4">
        <p className="text-white/50 text-xs mb-1">Ganado por referidos</p>
        <p className="font-mono text-3xl font-700 text-[#2FE0B0]">
          ${totalCommission.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </p>
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/10">
          {[1, 2, 3].map((lvl) => (
            <div key={lvl}>
              <p className="text-white/40 text-[11px]">Nivel {lvl} · {LEVEL_RATES[lvl]}</p>
              <p className="font-mono text-sm mt-0.5">${earningsByLevel[lvl].toLocaleString('es-MX')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de referidos */}
      <div className="mt-6">
        <div className="flex items-center gap-2 text-white/50 text-xs mb-3">
          <Users size={14} /> Tu red ({referredUsers.length})
        </div>

        {referredUsers.length === 0 && (
          <p className="text-white/30 text-sm">Aún no tienes referidos. Comparte tu link para empezar.</p>
        )}

        <div className="space-y-2">
          {referredUsers.map((r, i) => (
            <div key={i} className="flex items-center justify-between bg-[#0F0D14] border border-white/10 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm">{r.full_name || 'Usuario'}</p>
                <p className="text-white/40 text-xs font-mono">{r.phone}</p>
              </div>
              <span className="text-[11px] font-mono bg-white/5 px-2 py-1 rounded-full text-white/50">
                Nivel {r.level}
              </span>
            </div>
          ))}
        </div>
      </div>

      <BottomNav current="referrals" onNavigate={onNavigate} />
    </div>
  );
}
