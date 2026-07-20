import { Building2 } from 'lucide-react';
import BottomNav from './BottomNav';

export default function Company({ onNavigate }) {
  return (
    <div className="min-h-screen px-6 py-8 pb-28">
      <span className="font-display font-800 text-xl">vadia</span>

      <div className="flex flex-col items-center justify-center text-center mt-24">
        <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-5">
          <Building2 size={24} className="text-white/40" />
        </div>
        <h1 className="font-display font-700 text-xl mb-2">Empresa</h1>
        <p className="text-white/40 text-sm max-w-xs">Próximamente encontrarás aquí información sobre Vadia.</p>
      </div>

      <BottomNav current="company" onNavigate={onNavigate} />
    </div>
  );
}
