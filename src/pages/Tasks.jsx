import { useEffect, useState } from 'react';
import { ArrowLeft, ListChecks, Check, Lock, Gift } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Tasks({ onBack }) {
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase.rpc('get_task_progress');
    setStages(data || []);
    setLoading(false);
  }

  async function claim() {
    setClaiming(true);
    setMsg('');
    const { error } = await supabase.rpc('claim_task_reward');
    if (error) {
      setMsg(error.message || 'No se pudo reclamar.');
    } else {
      setMsg('¡Recompensa acreditada!');
      await load();
    }
    setClaiming(false);
  }

  const current = stages.find((s) => s.status === 'current');
  const allDone = stages.length > 0 && !current;

  return (
    <div className="min-h-screen px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 text-sm mb-6 w-fit">
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="flex items-center gap-2 mb-1">
        <ListChecks size={20} className="text-[#2FE0B0]" />
        <h1 className="font-display font-700 text-2xl">Tareas</h1>
      </div>
      <p className="text-white/40 text-sm mb-8">
        Invita nuevas personas y desbloquea recompensas por metas. Cada meta cuenta solo referidos nuevos desde que empezó.
      </p>

      {loading && <p className="text-white/40 text-sm">Cargando…</p>}

      {!loading && allDone && (
        <div className="card-glow rounded-2xl p-6 bg-[#0F0D14] text-center mb-6">
          <Gift size={24} className="text-[#F5A623] mx-auto mb-2" />
          <p className="text-sm text-white/70">¡Completaste todas las metas disponibles! 🎉</p>
        </div>
      )}

      <div className="space-y-3">
        {stages.map((s) => {
          const isCompleted = s.status === 'completed';
          const isCurrent = s.status === 'current';
          const isLocked = s.status === 'locked';
          const pct = isCurrent ? Math.min((s.progress_count / s.required_referrals) * 100, 100) : isCompleted ? 100 : 0;
          const ready = isCurrent && s.progress_count >= s.required_referrals;

          return (
            <div
              key={s.stage}
              className={`card-glow rounded-2xl p-5 bg-[#0F0D14] ${isLocked ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isCompleted && <Check size={16} className="text-[#2FE0B0]" />}
                  {isLocked && <Lock size={14} className="text-white/30" />}
                  <span className="font-display font-700 text-sm">
                    Meta {s.stage} · Invita {s.required_referrals}
                  </span>
                </div>
                <span className="font-mono text-sm text-[#F5A623]">${Number(s.reward_amount).toLocaleString('es-MX')}</span>
              </div>

              {!isLocked && (
                <>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full bg-gradient-to-r from-[#7C2FE0] via-[#E0299B] to-[#F5A623] transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-white/40 text-[11px]">
                    {isCompleted ? 'Completada' : `${s.progress_count} de ${s.required_referrals} referidos nuevos`}
                  </p>
                </>
              )}

              {ready && (
                <button
                  onClick={claim}
                  disabled={claiming}
                  className="w-full mt-3 bg-gradient-to-r from-[#7C2FE0] via-[#E0299B] to-[#F5A623] font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50"
                >
                  {claiming ? 'Reclamando…' : 'Reclamar recompensa'}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {msg && (
        <p className={`text-xs text-center mt-4 ${msg.startsWith('¡') ? 'text-[#2FE0B0]' : 'text-[#E0299B]'}`}>{msg}</p>
      )}
    </div>
  );
}
