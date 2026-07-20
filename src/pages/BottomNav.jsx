import { Home, Users, Building2 } from 'lucide-react';

export default function BottomNav({ current, onNavigate }) {
  const items = [
    { key: 'dashboard', label: 'Inicio', icon: Home },
    { key: 'referrals', label: 'Referidos', icon: Users },
    { key: 'company', label: 'Empresa', icon: Building2 },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0A090D]/95 backdrop-blur border-t border-white/10 px-6 py-3">
      <div className="max-w-sm mx-auto flex items-center justify-between">
        {items.map(({ key, label, icon: Icon }) => {
          const active = current === key;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className="flex flex-col items-center gap-1 flex-1"
            >
              <Icon size={20} className={active ? 'text-[#E0299B]' : 'text-white/40'} />
              <span className={`text-[11px] ${active ? 'text-white' : 'text-white/40'}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
