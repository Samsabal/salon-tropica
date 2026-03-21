import croppedLogo from "../assets/logo-banner.png";
import barBg from "../assets/hero-bar.jpg";
import heroVideo from "../assets/video.mp4";
import "../assets/animations.css";

export function Hero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden border-b border-slate-800 h-screen flex flex-col items-center justify-start pt-16 md:pt-20"
    >
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        poster={barBg}
      >
        <source src={heroVideo} type="video/mp4" />
      </video>

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-linear-to-b from-purple-950/40 via-darkBg/50 to-darkBg/60" />
      
      {/* Neon background blobs - more purple/pink toned */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-purple-600/15 blur-3xl" />
        <div className="absolute right-1/4 top-40 h-80 w-80 rounded-full bg-neonPink/15 blur-3xl" />
        <div className="absolute left-1/2 -translate-x-1/2 top-0 h-64 w-64 rounded-full bg-neonCyan/10 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative w-full h-full flex items-center justify-center">
        <div className="text-center space-y-6 md:space-y-8 w-full max-w-5xl mt-8 md:mt-0">
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-8">
            <div className="text-neonCyan text-sm md:text-lg tracking-[0.3em] font-semibold neon-flicker">
              SALON TROPICA
            </div>

            <div className="shrink-0">
              <img
                src={croppedLogo}
                alt="Tropica"
                className="w-[72vw] max-w-[360px] md:w-80 lg:w-[420px] h-auto drop-shadow-[0_0_40px_rgba(0,245,255,0.3)]"
              />
            </div>

            <div className="text-neonBlue text-sm md:text-lg tracking-[0.3em] font-semibold neon-flicker">
              SINDS 1993
            </div>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <p className="text-xl font-semibold text-neonCyan drop-shadow-[0_0_10px_rgba(0,245,255,0.6)]">
              KARAOKE BAR IN ROTTERDAM
            </p>
            <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto">
              De gezelligste karaoke bar van Rotterdam. Voor vrijgezellenfeesten,
              bedrijfsuitjes, verjaardagen of gewoon een avond vol zangplezier.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <a
              href="#contact"
              className="px-6 py-2.5 rounded-xl bg-white text-darkBg font-bold text-base shadow-lg shadow-black/30 hover:bg-white/90 hover:scale-105 transition-all uppercase tracking-wide"
            >
              Contact ons
            </a>
            <a
              href="#openingstijden"
              className="px-6 py-2.5 rounded-xl border-2 border-white text-white hover:bg-white/15 transition-all font-bold text-base uppercase tracking-wide"
            >
              Openingstijden
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
