import { useEffect, useState } from 'react';
import { Users, Building2, LifeBuoy } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import BottomNav from './BottomNav';

const TILES = [
  { key: 'buy', label: 'Recarga', img: '/btn-recarga.jpg' },
  { key: 'withdraw', label: 'Retiro', img: '/btn-retiro.jpg' },
  { key: 'roulette', label: 'Ruleta Vadia', img: '/btn-ruleta.jpg' },
  { key: 'tasks', label: 'Tareas', img: '/btn-tareas.jpg' },
  { key: 'onboarding', label: 'Tutorial', img: '/btn-tutorial.jpg' },
  { key: 'watch', label: 'Ver videos', img: '/btn-videos.jpg' },
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
      <img src="/logo.png" alt="Vadia" className="h-9 w-auto" />

      <img src="/company-banner.jpg" alt="Vadia" className="w-full rounded-2xl mt-4" />

      {/* Estado del paquete activo */}
      {activePackage && (
        <div className="card-glow rounded-2xl p-4 bg-[#0F0D14] mt-4 flex items-center justify-between">
          <div>
            <p className="text-white/50 text-xs">Paquete activo</p>
            <p className="font-display font-700 text-sm">{activePackage.packages.name}</p>
          </div>
          <p className="text-white/40 text-xs">{videosLeft} de {activePackage.packages.videos_per_day} videos hoy</p>
        </div>
      )}

      {/* Rejilla de accesos rápidos */}
      <div className="grid grid-cols-4 gap-x-2 gap-y-5 mt-7">
        {TILES.map(({ key, label, icon: Icon, img, color }) => (
          <button key={key} onClick={() => onNavigate(key)} className="flex flex-col items-center gap-2">
            {img ? (
              <img src={img} alt={label} className="w-14 h-14 rounded-2xl object-contain" />
            ) : (
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: `${color}22` }}
              >
                <Icon size={22} style={{ color }} />
              </div>
            )}
            <span className="text-[11px] text-white/60 text-center leading-tight">{label}</span>
          </button>
        ))}
      </div>

      <BottomNav current="dashboard" onNavigate={onNavigate} />
    </div>
  );
}
