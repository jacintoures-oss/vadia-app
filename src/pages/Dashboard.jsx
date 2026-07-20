import { useEffect, useState } from 'react';
import { LogOut, Play, Wallet, ArrowDownToLine } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import BottomNav from './BottomNav';

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

  async function handleLogout() {
    await supabase.auth.signOut();
    onLogout();
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
      <div className="flex items-center justify-between mb-10">
        <span className="font-display font-800 text-xl">vadia</span>
        <button onClick={handleLogout} className="flex items-center gap-1.5 text-white/50 text-sm">
          <LogOut size={15} /> Salir
        </button>
      </div>

      <p className="text-white/50 text-sm">Hola, {profile?.full_name?.split(' ')[0] || 'de nuevo'}</p>

      {/* Saldo */}
      <div className="card-glow rounded-2xl p-6 bg-[#0F0D14] mt-3">
        <div className="flex items-center gap-2 text-white/50 text-xs mb-2">
          <Wallet size={14} /> Saldo disponible
        </div>
        <p className="font-mono text-4xl font-700">
          ${Number(profile?.available_balance || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
        </p>
        <button
          onClick={() => onNavigate('withdraw')}
          className="flex items-center gap-1.5 text-[#2FE0B0] text-sm font-semibold mt-4"
        >
          <ArrowDownToLine size={15} /> Retirar
        </button>
      </div>

      {/* Paquete activo */}
      {activePackage ? (
        <div className="card-glow rounded-2xl p-6 bg-[#0F0D14] mt-4">
          <p className="text-white/50 text-xs mb-1">Paquete activo</p>
          <h2 className="font-display font-700 text-lg mb-4">{activePackage.packages.name}</h2>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-2xl font-700">{videosLeft}</p>
              <p className="text-white/40 text-xs">videos restantes hoy</p>
            </div>
            <button
              onClick={() => onNavigate('watch')}
              disabled={videosLeft <= 0}
              className="flex items-center gap-2 bg-gradient-to-r from-[#7C2FE0] via-[#E0299B] to-[#F5A623] font-semibold px-6 py-3 rounded-full disabled:opacity-30"
            >
              <Play size={16} fill="currentColor" /> Ver video
            </button>
          </div>
        </div>
      ) : (
        <div className="card-glow rounded-2xl p-6 bg-[#0F0D14] mt-4 text-center">
          <p className="text-white/60 text-sm mb-4">No tienes un paquete activo todavía.</p>
          <button
            onClick={() => onNavigate('buy')}
            className="bg-gradient-to-r from-[#7C2FE0] via-[#E0299B] to-[#F5A623] font-semibold px-6 py-3 rounded-full"
          >
            Comprar paquete
          </button>
        </div>
      )}

      <BottomNav current="dashboard" onNavigate={onNavigate} />
    </div>
  );
}
