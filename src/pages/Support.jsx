import { useEffect, useState } from 'react';
import { ArrowLeft, LifeBuoy, Send } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function Support({ userId, onBack }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setMessages(data || []);
    setLoading(false);
  }

  async function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    await supabase.from('support_messages').insert({ user_id: userId, message: text.trim() });
    setText('');
    await load();
    setSending(false);
  }

  const statusLabel = { open: 'En espera', answered: 'Respondido', closed: 'Cerrado' };

  return (
    <div className="min-h-screen px-6 py-8">
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 text-sm mb-8 w-fit">
        <ArrowLeft size={16} /> Volver
      </button>

      <div className="flex items-center gap-2 mb-1">
        <LifeBuoy size={18} className="text-[#2FE0B0]" />
        <h1 className="font-display font-700 text-2xl">Soporte</h1>
      </div>
      <p className="text-white/40 text-sm mb-6">Escríbenos y te respondemos lo antes posible.</p>

      <form onSubmit={send} className="flex gap-2 mb-8">
        <input
          type="text" placeholder="Escribe tu mensaje…"
          value={text} onChange={(e) => setText(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7C2FE0]"
        />
        <button
          type="submit" disabled={sending || !text.trim()}
          className="bg-gradient-to-r from-[#7C2FE0] via-[#E0299B] to-[#F5A623] px-4 rounded-xl disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </form>

      {loading && <p className="text-white/40 text-sm">Cargando…</p>}

      <div className="space-y-3">
        {messages.map((m) => (
          <div key={m.id} className="card-glow rounded-2xl p-4 bg-[#0F0D14]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-white/30">
                {new Date(m.created_at).toLocaleDateString('es-MX')}
              </span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                m.status === 'answered' ? 'bg-[#2FE0B0]/15 text-[#2FE0B0]' : 'bg-white/10 text-white/50'
              }`}>
                {statusLabel[m.status]}
              </span>
            </div>
            <p className="text-sm">{m.message}</p>
            {m.admin_reply && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-[11px] text-[#F5A623] mb-1">Respuesta de Vadia</p>
                <p className="text-sm text-white/70">{m.admin_reply}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
