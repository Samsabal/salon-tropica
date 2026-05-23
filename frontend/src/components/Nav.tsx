import { useState, useEffect } from "react";
import logoIcon from "../assets/logo-icon.png";

export function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("#home");
  const [isScrolled, setIsScrolled] = useState(false);
  const isOnHero = activeSection === "#home";

  const menuItems = [
    ["Home", "#home"],
    ["Foto's", "#fotos"],
    ["Route", "#route"],
    ["Contact en reservering", "#contact"],
  ];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(`#${entry.target.id}`);
          }
        });
      },
      { threshold: 0.3 }
    );

    const sections = menuItems.map(([, href]) => 
      document.querySelector(href.replace('#', '#'))
    ).filter(Boolean);

    sections.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOnHero) {
      setIsOpen(false);
    }
  }, [isOnHero]);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 border-b border-transparent transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] translate-y-0 opacity-100 pointer-events-auto ${
        isScrolled
          ? "bg-transparent backdrop-blur-none md:bg-darkBg/80 md:backdrop-blur md:border-slate-800"
          : "bg-transparent backdrop-blur-none"
      }`}>
        <nav className="max-w-5xl mx-auto flex items-center justify-between md:justify-center px-4 py-3">
        
        {/* Logo Icon for Mobile Only */}
        <img src={logoIcon} alt="Logo" className="md:hidden w-8 h-8" />

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-8 text-xl font-semibold">
          {menuItems.map(([label, href]) => (
            <li key={href}>
              <a
                href={href}
                className={`hover:text-neonCyan hover:drop-shadow-[0_0_10px_rgba(0,245,255,0.8)] transition-all ${
                  activeSection === href
                    ? "text-neonCyan drop-shadow-[0_0_10px_rgba(0,245,255,0.8)]"
                    : ""
                }`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Hamburger Button - Right side */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden z-70 flex flex-col gap-1.5 w-6 h-6 justify-center"
          aria-label="Toggle menu"
        >
          <span
            className={`block h-0.5 w-full bg-slate-100 transition-all duration-300 ${
              isOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-full bg-slate-100 transition-all duration-300 ${
              isOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-full bg-slate-100 transition-all duration-300 ${
              isOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
        </nav>
      </header>

      {/* Mobile Bottom Sheet Menu */}
      <div
        className={`fixed inset-0 z-80 md:hidden transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          onClick={() => setIsOpen(false)}
          aria-label="Close menu"
          className="absolute inset-0 bg-black/50"
        />

        <div
          className={`absolute bottom-0 left-0 right-0 rounded-t-3xl border-t border-slate-700 bg-darkBg/95 backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            isOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mx-auto mt-3 mb-2 h-1.5 w-12 rounded-full bg-slate-500/70" />
          <ul className="max-h-[75vh] overflow-y-auto flex flex-col px-2 pb-8 pt-2">
            {menuItems.map(([label, href]) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={handleLinkClick}
                  className={`block rounded-xl px-4 py-4 font-semibold text-lg hover:text-neonCyan hover:drop-shadow-[0_0_10px_rgba(0,245,255,0.8)] hover:bg-slate-800/30 transition-all ${
                    activeSection === href
                      ? "text-neonCyan drop-shadow-[0_0_10px_rgba(0,245,255,0.8)] bg-slate-800/30"
                      : ""
                  }`}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
