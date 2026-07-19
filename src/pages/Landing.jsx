import { Play, Users, Wallet, ShieldCheck } from 'lucide-react';

const PACKAGES = [
  { name: 'Básico', price: 800, videos: 4, perVideo: 5, color: 'from-[#7C2FE0] to-[#E0299B]' },
  { name: 'Pro', price: 2400, videos: 10, perVideo: 6, color: 'from-[#E0299B] to-[#F5A623]', featured: true },
  { name: 'Elite', price: 7200, videos: 20, perVideo: 18, color: 'from-[#F5A623] to-[#FFC93C]' },
];

function DialRing({ segments, color }) {
  const total = 12;
  const filled = Math.min(segments, total);
  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
        {Array.from({ length: total }).map((_, i) => {
          const angle = (i / total) * 360;
          const active = i < filled;
          return (
            <line
              key={i}
              x1="32" y1="6" x2="32" y2="12"
              stroke={active ? color : 'rgba(255,255,255,0.12)'}
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${angle} 32 32)`}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Play size={18} className="text-white/80" fill="currentColor" />
      </div>
    </div>
  );
}

export default function Landing({ onGetStarted, onLogin }) {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <span className="font-display font-800 text-xl tracking-tight">vadia</span>
        <button onClick={onLogin} className="text-sm text-white/70 hover:text-white transition">
          Iniciar sesión
        </button>
      </nav>

      {/* Hero */}
      <header className="max-w-6xl mx-auto px-6 pt-10 pb-20 text-center">
        <h1 className="font-display font-800 text-4xl sm:text-6xl leading-[1.05] tracking-tight">
          Mira anuncios.<br />
          <span className="gradient-text">Gana pesos reales.</span>
        </h1>
        <p className="mt-6 text-white/60 max-w-md mx-auto text-base">
          Elige un paquete, ve tus videos publicitarios cada día y retira tus
          ganancias directo a tu cuenta.
        </p>
        <button
          onClick={onGetStarted}
          className="mt-9 inline-flex items-center gap-2 bg-white text-black font-semibold px-7 py-3.5 rounded-full hover:scale-105 transition-transform"
        >
          <Play size={16} fill="currentColor" /> Empezar a ganar
        </button>
      </header>

      {/* V divider */}
      <div className="v-divider h-14 bg-gradient-to-r from-[#7C2FE0] via-[#E0299B] to-[#FFC93C] max-w-6xl mx-6 sm:mx-auto" />

      {/* Packages */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="font-display font-700 text-2xl text-center mb-2">Paquetes</h2>
        <p className="text-white/50 text-center text-sm mb-10">Vigencia de 1 año · comisiones por referidos incluidas</p>
        <div className="grid sm:grid-cols-3 gap-5">
          {PACKAGES.map((p) => (
            <div
              key={p.name}
              className={`card-glow rounded-2xl p-6 bg-[#0F0D14] relative ${p.featured ? 'sm:-translate-y-3 ring-1 ring-white/20' : ''}`}
            >
              {p.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-mono uppercase tracking-wider bg-white text-black px-3 py-1 rounded-full">
                  Más elegido
                </span>
              )}
              <div className={`h-1 w-10 rounded-full bg-gradient-to-r ${p.color} mb-5`} />
              <h3 className="font-display font-700 text-lg">{p.name}</h3>
              <p className="font-mono text-3xl font-700 mt-2">${p.price.toLocaleString('es-MX')}</p>
              <p className="text-white/40 text-xs mt-1">pago único · 1 año</p>

              <div className="flex items-center gap-3 mt-6 pt-6 border-t border-white/10">
                <DialRing segments={Math.min(p.videos, 12)} color="#2FE0B0" />
                <div>
                  <p className="font-mono text-sm">{p.videos} videos/día</p>
                  <p className="text-white/40 text-xs">${p.perVideo} c/u</p>
                </div>
              </div>
              <p className="font-mono text-[#2FE0B0] text-sm mt-4">
                +${(p.videos * p.perVideo).toLocaleString('es-MX')} MXN / día
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-white/10">
        <h2 className="font-display font-700 text-2xl text-center mb-10">Cómo funciona</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { icon: Wallet, title: 'Elige tu paquete', text: 'Deposita vía SPEI y activa tu cuota diaria de videos.' },
            { icon: Play, title: 'Ve tus anuncios', text: 'Mira los videos asignados cada día desde tu panel.' },
            { icon: ShieldCheck, title: 'Retira tus ganancias', text: 'Solicita tu retiro y recíbelo directo en tu cuenta.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="text-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Icon size={20} className="text-[#2FE0B0]" />
              </div>
              <h3 className="font-display font-600 text-base mb-1">{title}</h3>
              <p className="text-white/50 text-sm">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Referrals */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-white/10 text-center">
        <Users size={22} className="text-[#F5A623] mx-auto mb-4" />
        <h2 className="font-display font-700 text-2xl mb-2">Invita y gana más</h2>
        <p className="text-white/50 text-sm max-w-sm mx-auto">
          10% de lo que compra tu referido directo, 3% del segundo nivel y 1% del tercero.
        </p>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-10 text-center border-t border-white/10">
        <button
          onClick={onGetStarted}
          className="bg-gradient-to-r from-[#7C2FE0] via-[#E0299B] to-[#F5A623] text-white font-semibold px-8 py-3.5 rounded-full"
        >
          Crear mi cuenta
        </button>
        <p className="text-white/30 text-xs mt-6 font-mono">vadia · mira anuncios, gana más</p>
      </footer>
    </div>
  );
}
