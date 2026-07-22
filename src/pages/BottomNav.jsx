import { Home, Bell, Gem, Users, User } from 'lucide-react';

export default function BottomNav({ current, onNavigate }) {
  const sideItems = [
    { key: 'dashboard', label: 'Inicio', icon: Home },
    { key: 'notifications', label: 'Avisos', icon: Bell },
  ];
  const sideItems2 = [
    { key: 'referrals', label: 'Invitar', icon: Users },
    { key: 'account', label: 'Mi', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0A090D]/95 backdrop-blur border-t border-white/10 px-4 pt-2 pb-3">
      <div className="max-w-sm mx-auto flex items-end justify-between">
        {sideItems.map(({ key, label, icon: Icon }) => {
          const active = current === key;
          return (
            <button key={key} onClick={() => onNavigate(key)} className="flex flex-col items-center gap-1 flex-1">
              <Icon size={20} className={active ? 'text-[#E0299B]' : 'text-white/40'} />
              <span className={`text-[11px] ${active ? 'text-white' : 'text-white/40'}`}>{label}</span>
            </button>
          );
        })}

        {/* Botón central elevado: Paquetes / VIP */}
        <button onClick={() => onNavigate('buy')} className="flex flex-col items-center gap-1 flex-1 -mt-7">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center border-4 border-[#0A090D]"
            style={{ background: 'linear-gradient(135deg, #7C2FE0, #E0299B, #F5A623)', boxShadow: '0 0 16px rgba(224,41,155,0.5)' }}
          >
            <Gem size={22} className="text-white" />
          </div>
          <span className={`text-[11px] ${current === 'buy' ? 'text-white' : 'text-white/40'}`}>Paquetes</span>
        </button>

        {sideItems2.map(({ key, label, icon: Icon }) => {
          const active = current === key;
          return (
            <button key={key} onClick={() => onNavigate(key)} className="flex flex-col items-center gap-1 flex-1">
              <Icon size={20} className={active ? 'text-[#E0299B]' : 'text-white/40'} />
              <span className={`text-[11px] ${active ? 'text-white' : 'text-white/40'}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
