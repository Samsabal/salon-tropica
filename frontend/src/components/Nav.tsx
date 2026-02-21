import { useState, useEffect } from "react";
import logoIcon from "../assets/logo-icon.png";

export function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("#home");
  const [isScrolled, setIsScrolled] = useState(false);

  const menuItems = [
    ["Home", "#home"],
    ["Foto's", "#fotos"],
    ["Route", "#route"],
    ["Gastenboek", "#gastenboek"],
    ["Contact & Reservering", "#contact"],
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

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 border-b border-slate-800 transition-all duration-300 ${
      isScrolled ? "bg-transparent backdrop-blur-none md:bg-darkBg/80 md:backdrop-blur" : "bg-darkBg/80 backdrop-blur"
    }`}>
      <nav className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        
        {/* Logo Icon for Mobile Only */}
        <img src={logoIcon} alt="Logo" className="md:hidden w-8 h-8" />

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-4 text-base font-semibold uppercase">
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
          className="md:hidden z-50 flex flex-col gap-1.5 w-6 h-6 justify-center"
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

        {/* Mobile Menu */}
        <div
          className={`absolute top-full left-0 right-0 md:hidden transition-all duration-300 overflow-hidden border-b border-slate-800 bg-darkBg/80 backdrop-blur ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 border-b-0"
          }`}
        >
          <ul className="flex flex-col py-4">
            {menuItems.map(([label, href]) => (
              <li key={href}>
                <a
                  href={href}
                  onClick={handleLinkClick}
                  className={`block px-4 py-3 font-semibold uppercase hover:text-neonCyan hover:drop-shadow-[0_0_10px_rgba(0,245,255,0.8)] hover:bg-slate-800/30 transition-all ${
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
      </nav>
    </header>
  );
}
