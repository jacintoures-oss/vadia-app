import { MapPin, ShieldCheck, Target, Eye, Sparkles, Building2, Check } from 'lucide-react';
import BottomNav from './BottomNav';

const VALUES = ['Innovación', 'Transparencia', 'Seguridad', 'Compromiso', 'Calidad', 'Mejora continua'];

const SEAL_ITEMS = [
  'Identidad oficial de la marca',
  'Desarrollo tecnológico continuo',
  'Compromiso con la innovación',
  'Enfoque en calidad y mejora constante',
];

export default function Company({ onNavigate }) {
  return (
    <div className="min-h-screen px-6 py-8 pb-28">
      <img src="/logo.png" alt="Vadia" className="h-9 w-auto" />

      <img src="/company-banner.jpg" alt="Vadia" className="w-full rounded-2xl mt-6" />

      <h1 className="font-display font-700 text-2xl mt-6 mb-1">Bienvenido a Vadia</h1>

      {/* Intro */}
      <div className="card-glow rounded-2xl p-6 bg-[#0F0D14] mt-4 space-y-4">
        <p className="text-white/70 text-sm leading-relaxed">
          Vadia es una plataforma digital enfocada en conectar anunciantes con usuarios mediante
          soluciones innovadoras de publicidad digital. Nuestra misión es ofrecer una experiencia
          moderna, segura y eficiente, impulsando el crecimiento de las marcas a través de
          herramientas tecnológicas diseñadas para maximizar el alcance y la interacción con sus
          campañas.
        </p>
        <p className="text-white/70 text-sm leading-relaxed">
          Desde 2018, Vadia trabaja en el desarrollo continuo de nuevas tecnologías que permitan
          mejorar el rendimiento de la plataforma y brindar una experiencia cada vez más estable,
          intuitiva y confiable.
        </p>
        <p className="text-white/70 text-sm leading-relaxed">
          Nuestro compromiso es evolucionar constantemente, incorporando nuevas funciones,
          optimizando nuestros sistemas y ofreciendo un servicio de calidad para nuestros usuarios
          y socios comerciales.
        </p>
      </div>

      {/* Misión */}
      <div className="card-glow rounded-2xl p-6 bg-[#0F0D14] mt-4">
        <div className="flex items-center gap-2 text-white/50 text-xs mb-3">
          <Target size={14} /> Nuestra misión
        </div>
        <p className="text-white/70 text-sm leading-relaxed">
          Impulsar la innovación en la publicidad digital mediante soluciones tecnológicas que
          beneficien tanto a anunciantes como a usuarios, promoviendo un entorno confiable,
          eficiente y en constante crecimiento.
        </p>
      </div>

      {/* Visión */}
      <div className="card-glow rounded-2xl p-6 bg-[#0F0D14] mt-4">
        <div className="flex items-center gap-2 text-white/50 text-xs mb-3">
          <Eye size={14} /> Nuestra visión
        </div>
        <p className="text-white/70 text-sm leading-relaxed">
          Convertirnos en una plataforma reconocida por la calidad de nuestros servicios, la
          innovación tecnológica y el compromiso con la excelencia, estableciendo relaciones
          duraderas con usuarios y anunciantes en todo el mundo.
        </p>
      </div>

      {/* Valores */}
      <div className="card-glow rounded-2xl p-6 bg-[#0F0D14] mt-4">
        <div className="flex items-center gap-2 text-white/50 text-xs mb-4">
          <Sparkles size={14} /> Nuestros valores
        </div>
        <div className="grid grid-cols-2 gap-2">
          {VALUES.map((v) => (
            <div key={v} className="flex items-center gap-2 text-sm text-white/70">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E0299B] shrink-0" />
              {v}
            </div>
          ))}
        </div>
      </div>

      {/* Información corporativa */}
      <div className="card-glow rounded-2xl p-6 bg-[#0F0D14] mt-4">
        <div className="flex items-center gap-2 text-white/50 text-xs mb-4">
          <Building2 size={14} /> Información corporativa
        </div>
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-white/40">Empresa</span>
            <span className="text-white/80">Vadia</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/40">Fundación</span>
            <span className="text-white/80">2018</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-white/40 flex items-center gap-1"><MapPin size={11} /> Operaciones</span>
            <span className="text-white/80 text-right">Denver, Colorado, EE. UU.</span>
          </div>
        </div>
        <p className="text-white/50 text-xs leading-relaxed mt-4 pt-4 border-t border-white/10">
          Nuestro equipo trabaja diariamente para desarrollar soluciones tecnológicas modernas,
          mejorar la estabilidad de la plataforma y ofrecer un servicio de alto nivel que responda
          a las necesidades del mercado digital.
        </p>
      </div>

      {/* Sello VADIA VERIFIED */}
      <div className="rounded-2xl p-6 mt-4 border border-[#F5A623]/30 bg-[#F5A623]/5 text-center">
        <ShieldCheck size={26} className="text-[#F5A623] mx-auto mb-2" />
        <p className="font-display font-800 tracking-widest text-sm">VADIA VERIFIED</p>
        <p className="text-white/40 text-[11px] tracking-widest mb-4">PLATAFORMA OFICIAL</p>
        <div className="space-y-1.5 text-left max-w-xs mx-auto">
          {SEAL_ITEMS.map((item) => (
            <div key={item} className="flex items-center gap-2 text-xs text-white/60">
              <Check size={12} className="text-[#F5A623] shrink-0" /> {item}
            </div>
          ))}
        </div>
      </div>

      <p className="text-white/25 text-[11px] text-center mt-6">
        © 2018–2026 Vadia. Todos los derechos reservados.
      </p>

      <BottomNav current="company" onNavigate={onNavigate} />
    </div>
  );
}
