import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Landmark, User, KeyRound, LogOut, ChevronRight, Check, ShieldCheck } from 'lucide-react';
import { supabase, phoneToInternalEmail } from '../lib/supabaseClient';

export default function SettingsPage({ userId, onBack, onLogout, onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [editField, setEditField] = useState(null); // 'name' | 'password' | null
  const [nameInput, setNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data);
    setNameInput(data?.full_name || '');
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${userId}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', userId);
      setProfile((p) => ({ ...p, avatar_url: data.publicUrl }));
    } catch (err) {
      alert('No se pudo subir la foto. Intenta de nuevo.');
    }
    setUploadingAvatar(false);
  }

  async function saveName() {
    setBusy(true);
    await supabase.from('profiles').update({ full_name: nameInput }).eq('id', userId);
    setProfile((p) => ({ ...p, full_name: nameInput }));
    setEditField(null);
    setBusy(false);
  }

  async function savePassword() {
    if (!currentPasswordInput) {
      setMsg('Ingresa tu contraseña actual.');
      return;
    }
    if (passwordInput.length < 6) {
      setMsg('La nueva contraseña debe tener mínimo 6 caracteres.');
      return;
    }
    setBusy(true);
    setMsg('');

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: phoneToInternalEmail(profile.phone),
      password: currentPasswordInput,
    });
    if (verifyError) {
      setMsg('Tu contraseña actual no es correcta.');
      setBusy(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: passwordInput });
    setMsg(error ? 'No se pudo cambiar. Intenta de nuevo.' : '¡Contraseña actualizada!');
    setCurrentPasswordInput('');
    setPasswordInput('');
    setBusy(false);
    if (!error) setTimeout(() => setEditField(null), 1200);
  }

  async function handleLogoutClick() {
    await supabase.auth.signOut();
    onLogout();
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center text-white/50">Cargando…</div>;
  }

  return (
    <div className="min-h-screen px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 text-sm mb-6 w-fit">
        <ArrowLeft size={16} /> Volver
      </button>

      <h1 className="font-display font-700 text-2xl mb-6">Configuración</h1>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover border border-white/10" />
        ) : (
          <img src="/default-avatar.png" alt="" className="w-20 h-20 rounded-full object-cover border border-white/10" />
        )}
        <label className="w-20 h-20 rounded-full border-2 border-dashed border-white/15 flex items-center justify-center cursor-pointer text-white/30">
          {uploadingAvatar ? '…' : <Plus size={22} />}
          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </label>
      </div>

      <div className="rounded-2xl bg-[#0F0D14] border border-white/10 divide-y divide-white/10 overflow-hidden">
        {/* Teléfono (solo lectura) */}
        <div className="flex items-center gap-3 px-4 py-4">
          <User size={16} className="text-white/40" />
          <span className="font-mono text-sm">{profile?.phone}</span>
        </div>

        {/* Cuenta bancaria: pantalla aparte */}
        <button onClick={() => onNavigate('bank-account')} className="w-full flex items-center gap-3 px-4 py-4">
          <Landmark size={16} className="text-white/40" />
          <span className="text-sm flex-1 text-left">
            Cuenta bancaria {profile?.bank_clabe && <span className="text-[#2FE0B0] text-[10px] ml-1">configurada</span>}
          </span>
          <ChevronRight size={16} className="text-white/30" />
        </button>

        {/* Nombre real */}
        <button onClick={() => setEditField(editField === 'name' ? null : 'name')} className="w-full flex items-center gap-3 px-4 py-4">
          <User size={16} className="text-white/40" />
          <span className="text-sm flex-1 text-left">Nombre real</span>
          <ChevronRight size={16} className="text-white/30" />
        </button>
        {editField === 'name' && (
          <div className="px-4 pb-4 flex gap-2">
            <input
              value={nameInput} onChange={(e) => setNameInput(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
            />
            <button onClick={saveName} disabled={busy} className="bg-[#2FE0B0] text-black text-xs font-semibold px-3 rounded-lg">Guardar</button>
          </div>
        )}

        {/* Contraseña de sesión */}
        <button onClick={() => setEditField(editField === 'password' ? null : 'password')} className="w-full flex items-center gap-3 px-4 py-4">
          <KeyRound size={16} className="text-white/40" />
          <span className="text-sm flex-1 text-left">Cambiar contraseña</span>
          <ChevronRight size={16} className="text-white/30" />
        </button>
        {editField === 'password' && (
          <div className="px-4 pb-4 space-y-2">
            <input
              type="password" value={currentPasswordInput} onChange={(e) => setCurrentPasswordInput(e.target.value)} placeholder="Contraseña actual"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="Nueva contraseña"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm"
            />
            <button onClick={savePassword} disabled={busy} className="w-full bg-[#2FE0B0] text-black text-xs font-semibold py-2.5 rounded-lg">
              {busy ? 'Guardando…' : 'Guardar'}
            </button>
            {msg && (
              <p className={`text-xs flex items-center gap-1 ${msg.startsWith('¡') ? 'text-[#2FE0B0]' : 'text-[#E0299B]'}`}>
                {msg.startsWith('¡') && <Check size={12} />} {msg}
              </p>
            )}
          </div>
        )}

        {/* Clave de retiro: pantalla aparte */}
        <button onClick={() => onNavigate('withdrawal-password')} className="w-full flex items-center gap-3 px-4 py-4">
          <ShieldCheck size={16} className="text-white/40" />
          <span className="text-sm flex-1 text-left">
            Clave de retiro {profile?.withdrawal_password_hash && <span className="text-[#2FE0B0] text-[10px] ml-1">configurada</span>}
          </span>
          <ChevronRight size={16} className="text-white/30" />
        </button>
      </div>

      <button
        onClick={handleLogoutClick}
        className="w-full flex items-center justify-center gap-2 border border-white/15 text-white/70 font-semibold py-3.5 rounded-xl mt-8"
      >
        <LogOut size={16} /> Cerrar sesión
      </button>
    </div>
  );
}
