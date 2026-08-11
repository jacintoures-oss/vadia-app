import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function AnnouncementPopup({ userId, onNavigate }) {
  const [announcement, setAnnouncement] = useState(null);

  useEffect(() => {
    checkPopup();
  }, []);

  async function checkPopup() {
    const { data: seen } = await supabase
      .from('announcement_views')
      .select('announcement_id')
      .eq('user_id', userId);
    const seenIds = (seen || []).map((s) => s.announcement_id);

    let query = supabase
      .from('announcements')
      .select('*')
      .eq('is_active', true)
      .eq('show_as_popup', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (seenIds.length > 0) {
      query = query.not('id', 'in', `(${seenIds.join(',')})`);
    }

    const { data } = await query;
    if (data && data.length > 0) setAnnouncement(data[0]);
  }

  async function markSeen() {
    if (!announcement) return;
    await supabase.from('announcement_views').insert({ user_id: userId, announcement_id: announcement.id });
  }

  async function close() {
    await markSeen();
    setAnnouncement(null);
  }

  async function seeDetails() {
    await markSeen();
    setAnnouncement(null);
    onNavigate('notifications');
  }

  if (!announcement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
      <div className="w-full max-w-sm bg-[#0F0D14] rounded-3xl overflow-hidden border border-white/10">
        {announcement.image_url && (
          <img src={announcement.image_url} alt="" className="w-full h-40 object-cover" />
        )}
        <div className="p-6">
          <h2 className="font-display font-700 text-lg mb-2">{announcement.title}</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6">{announcement.body}</p>
          <div className="flex gap-3">
            <button
              onClick={close}
              className="flex-1 flex items-center justify-center gap-1.5 bg-white/10 font-semibold py-3 rounded-xl text-sm"
            >
              <X size={15} /> Cerrar
            </button>
            <button
              onClick={seeDetails}
              className="flex-1 bg-gradient-to-r from-[#7C2FE0] via-[#E0299B] to-[#F5A623] font-semibold py-3 rounded-xl text-sm"
            >
              Detalles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
