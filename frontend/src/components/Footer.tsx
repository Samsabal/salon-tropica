export function Footer() {
  return (
    <footer className="relative border-t border-slate-800 py-6 text-xs text-slate-500">
      <img
        src="/logo-icon.png"
        alt="Salon Tropica logo"
        className="absolute -top-10 left-6 h-20 w-auto opacity-90"
        loading="lazy"
      />
      <div className="flex flex-col items-center gap-2 text-center">
        <span>
          © {new Date().getFullYear()} Salon Tropica – De gezelligste karaoke bar van
          Rotterdam.
        </span>
      </div>
    </footer>
  );
}
