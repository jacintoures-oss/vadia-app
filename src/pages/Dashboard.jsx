import { useEffect, useState } from 'react';
import {
  Wallet, ArrowDownToLine, ArrowUpToLine, Disc3, BookOpen,
  Play, Users, Building2, LifeBuoy,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import BottomNav from './BottomNav';

const TILES = [
  { key: 'buy', label: 'Recarga', icon: ArrowUpToLine, color: '#2FE0B0' },
  { key: 'withdraw', label: 'Retiro', icon: ArrowDownToLine, color: '#F5A623' },
  { key: 'roulette', label: 'Ruleta Vadia', icon: Disc3, color: '#E0299B' },
  { key: 'onboarding', label: 'Tutorial', icon: BookOpen, color: '#7C2FE0' },
  { key: 'watch', label: 'Ver videos', icon: Play, color: '#2F6FE0' },
  { key: 'referrals', label: 'Referidos', icon: Users, color: '#FFC93C' },
  { key: 'company', label: 'Empresa', icon: Building2, color: '#E0592F' },
  { key: 'support', label: 'Soporte', icon: LifeBuoy, color: '#2FE0B0' },
];

export default function Dashboard({ userId, onLogout, onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [activePackage, setActivePackage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [userId]);

  async function loadData() {
    setLoading(true);

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(profileData);

    const { data: pkgData } = await supabase
      .from('user_packages')
      .select('*, packages(*)')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();
    setActivePackage(pkgData);

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white/50">
        Cargando…
      </div>
    );
  }

  const videosLeft = activePackage
    ? activePackage.packages.videos_per_day - activePackage.videos_watched_today
    : 0;

  return (
    <div className="min-h-screen px-6 py-8 pb-28">
      <span className="font-display font-800 text-xl">vadia</span>

      <p className="text-white/50 text-sm mt-4">Hola, {profile?.full_name?.split(' ')[0] || 'de nuevo'}</p>

      {/* Saldo */}
      <div className="card-glow rounded-2xl p-6 bg-[#0F0D14] mt-3">
        <div className="flex items-center gap-2 text-white/50 text-xs mb-2">
          <Wallet size={14} /> Saldo disponible
        </div>
        <p className="font-mono text-4xl font-700">
          ${Number(profile?.available_balance || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </p>
        {activePackage && (
          <p className="text-white/40 text-xs mt-3">
            {activePackage.packages.name} · {videosLeft} de {activePackage.packages.videos_per_day} videos hoy
          </p>
        )}
      </div>

      {/* Rejilla de accesos rápidos */}
      <div className="grid grid-cols-4 gap-x-2 gap-y-5 mt-7">
        {TILES.map(({ key, label, icon: Icon, color }) => (
          <button key={key} onClick={() => onNavigate(key)} className="flex flex-col items-center gap-2">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: `${color}22` }}
            >
              <Icon size={22} style={{ color }} />
            </div>
            <span className="text-[11px] text-white/60 text-center leading-tight">{label}</span>
          </button>
        ))}
      </div>

      <BottomNav current="dashboard" onNavigate={onNavigate} />
    </div>
  );
}
