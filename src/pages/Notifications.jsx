import { useEffect, useState } from 'react';
import { ArrowLeft, Bell } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Notifications({ onBack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('announcements').select('*').eq('is_active', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setItems(data || []); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 text-sm mb-8 w-fit">
        <ArrowLeft size={16} /> Volver
      </button>

      <h1 className="font-display font-700 text-2xl mb-6">Notificaciones</h1>

      {loading && <p className="text-white/40 text-sm">Cargando…</p>}
      {!loading && items.length === 0 && (
        <div className="text-center mt-16">
          <Bell size={28} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No hay avisos por ahora.</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map((a) => (
          <div key={a.id} className="card-glow rounded-2xl p-5 bg-[#0F0D14]">
            <h3 className="font-display font-700 text-sm mb-1">{a.title}</h3>
            <p className="text-white/60 text-sm">{a.body}</p>
            <p className="text-white/30 text-[11px] mt-3">
              {new Date(a.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
