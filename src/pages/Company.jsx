import { MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import BottomNav from './BottomNav';

export default function Company({ onNavigate }) {
  return (
    <div className="min-h-screen px-6 py-8 pb-28">
      <img src="/logo.png" alt="Vadia" className="h-9 w-auto" />

      <h1 className="font-display font-700 text-2xl mt-6 mb-1">Sobre Vadia</h1>
      <p className="text-white/40 text-sm mb-8">Mira anuncios, gana más</p>

      {/* Sello de marca */}
      <div className="flex justify-center mb-8">
        <div
          className="w-28 h-28 rounded-full flex flex-col items-center justify-center text-center border-2"
          style={{
            borderColor: '#F5A623',
            background: 'radial-gradient(circle, rgba(245,166,35,0.08), transparent 70%)',
          }}
        >
          <ShieldCheck size={22} className="text-[#F5A623] mb-1" />
          <p className="font-display font-800 text-[11px] tracking-widest">VADIA</p>
          <p className="text-[8px] text-white/40 tracking-widest">PLATAFORMA VERIFICADA</p>
        </div>
      </div>

      {/* Descripción */}
      <div className="card-glow rounded-2xl p-6 bg-[#0F0D14] mb-4">
        <p className="text-white/70 text-sm leading-relaxed">
          Vadia es una plataforma digital de recompensas publicitarias que conecta a marcas
          con usuarios reales dispuestos a interactuar con contenido patrocinado. A través de
          nuestra tecnología, cualquier persona puede generar ingresos adicionales viendo
          anuncios en video, mientras las marcas obtienen visibilidad genuina y medible.
        </p>
        <p className="text-white/70 text-sm leading-relaxed mt-4">
          Nuestro compromiso es ofrecer una experiencia transparente, segura y accesible,
          respaldada por infraestructura tecnológica de nivel empresarial.
        </p>
      </div>

      {/* Ubicación */}
      <div className="card-glow rounded-2xl p-6 bg-[#0F0D14] mb-4">
        <div className="flex items-center gap-2 text-white/50 text-xs mb-3">
          <MapPin size={14} /> Instalaciones
        </div>
        <p className="font-display font-700 text-base">Denver, Colorado</p>
        <p className="text-white/50 text-sm">Estados Unidos</p>
      </div>

      {/* Valores */}
      <div className="card-glow rounded-2xl p-6 bg-[#0F0D14]">
        <div className="flex items-center gap-2 text-white/50 text-xs mb-4">
          <Sparkles size={14} /> Lo que nos define
        </div>
        <ul className="space-y-3 text-sm text-white/70">
          <li>• Pagos puntuales y transparentes para cada usuario</li>
          <li>• Infraestructura segura para proteger tus datos y tu saldo</li>
          <li>• Soporte real, siempre disponible dentro de la app</li>
        </ul>
      </div>

      <BottomNav current="company" onNavigate={onNavigate} />
    </div>
  );
}
