import { useEffect, useState } from 'react';
import { User, History, KeyRound, LogOut, Check, LifeBuoy } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import BottomNav from './BottomNav';

export default function Account({ userId, onLogout, onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [movements, setMovements] = useState([]);
  const [newPassword, setNewPassword] = useState('');
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, [userId]);

  async function load() {
    setLoading(true);
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(profileData);

    const { data: tx } = await supabase
      .from('transactions')
      .select('*, packages(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);
    setMovements(tx || []);

    setLoading(false);
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPwMsg('Mínimo 6 caracteres.');
      return;
    }
    setSavingPw(true);
    setPwMsg('');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwMsg(error ? 'No se pudo cambiar. Intenta de nuevo.' : '¡Contraseña actualizada!');
    setNewPassword('');
    setSavingPw(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    onLogout();
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white/50">Cargando…</div>;
  }

  const statusLabel = { pending: 'En revisión', completed: 'Aprobado', rejected: 'Rechazado', failed: 'Falló' };
  const statusColor = { pending: 'text-[#F5A623]', completed: 'text-[#2FE0B0]', rejected: 'text-[#E0299B]', failed: 'text-[#E0299B]' };

  return (
    <div className="min-h-screen px-6 py-8 pb-28">
      <span className="font-display font-800 text-xl">vadia</span>

      {/* Datos */}
      <div className="card-glow rounded-2xl p-6 bg-[#0F0D14] mt-6">
        <div className="flex items-center gap-2 text-white/50 text-xs mb-3">
          <User size={14} /> Mis datos
        </div>
        <p className="text-lg font-display font-700">{profile?.full_name || 'Sin nombre'}</p>
        <p className="font-mono text-white/50 text-sm mt-1">{profile?.phone}</p>
        <p className="text-white/30 text-xs mt-1">
          Miembro desde {new Date(profile?.created_at).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Cambiar contraseña */}
      <div className="card-glow rounded-2xl p-6 bg-[#0F0D14] mt-4">
        <div className="flex items-center gap-2 text-white/50 text-xs mb-3">
          <KeyRound size={14} /> Cambiar contraseña
        </div>
        <form onSubmit={handleChangePassword} className="flex gap-2">
          <input
            type="password" placeholder="Nueva contraseña" minLength={6}
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#7C2FE0]"
          />
          <button
            type="submit" disabled={savingPw || !newPassword}
            className="bg-white/10 px-4 rounded-xl text-sm font-semibold disabled:opacity-40"
          >
            {savingPw ? '…' : 'Guardar'}
          </button>
        </form>
        {pwMsg && (
          <p className={`text-xs mt-2 flex items-center gap-1 ${pwMsg.startsWith('¡') ? 'text-[#2FE0B0]' : 'text-[#E0299B]'}`}>
            {pwMsg.startsWith('¡') && <Check size={12} />} {pwMsg}
          </p>
        )}
      </div>

      {/* Soporte */}
      <button
        onClick={() => onNavigate('support')}
        className="w-full flex items-center gap-3 card-glow rounded-2xl p-5 bg-[#0F0D14] mt-4"
      >
        <div className="w-9 h-9 rounded-full bg-[#2FE0B0]/15 flex items-center justify-center">
          <LifeBuoy size={16} className="text-[#2FE0B0]" />
        </div>
        <span className="text-sm font-semibold">Soporte y ayuda</span>
      </button>

      {/* Historial de movimientos */}
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

      <button onClick={handleLogout} className="flex items-center gap-2 text-white/40 text-sm mt-8 mx-auto">
        <LogOut size={15} /> Cerrar sesión
      </button>

      <BottomNav current="account" onNavigate={onNavigate} />
    </div>
  );
}
