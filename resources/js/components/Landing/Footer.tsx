import { useRef, useState, useCallback } from "react";

const footerLinks = {
  "FEEYANGU ACADEMY": ["Academics With Feeyangu", "Finance With Feeyangu", "Attendance With Feeyangu", "Transport With Feeyangu", "NEMIS With Feeyangu"],
  "COMPANY": ["Our Why", "Join Our Team", "Contact Us", "Reviews"],
  "SPONSORSHIPS": ["Sponsor a School", "Request Sponsorship", "Discount for Multiple Schools", "Discount for Government Schools"],
  "CONNECT": ["Our Social Policy", "YouTube", "WhatsApp", "Telegram"],
};

const Footer = () => {
  const footerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!footerRef.current) return;
    const rect = footerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  return (
    <footer className="bg-transparent pt-20">
      <div 
        ref={footerRef}
        onMouseMove={handleMouseMove}
        className="relative overflow-hidden bg-[#162C2D] rounded-t-[100px] pt-24 pb-12 group"
      >
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          {/* Links grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12 max-w-6xl">
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="text-[12px] tracking-[0.15em] text-white font-bold mb-8 opacity-90">
                  {category}
                </h4>
                <ul className="space-y-4">
                  {links.map((link) => {
                    const [label, tag] = link.split('[');
                    return (
                      <li key={link} className="flex items-center gap-2">
                        <a href="#" className="text-[15px] text-white/40 hover:text-white transition-colors duration-200">
                          {label.trim()}
                        </a>
                        {tag && (
                          <span className="text-[11px] text-[#E3542D] opacity-80 font-medium">
                            [{tag.replace(']', '')}]
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* Large brand text with Global Spotlight */}
          <div className="text-center mb-10  relative cursor-default select-none ">
            {/* Base Layer: Darker text that is always visible */}
            <h2
              className="font-serif tracking-tighter leading-none italic opacity-20"
              style={{ fontSize: '16rem', color: "white" }}
            >
              feeyangu<span className="font-bold not-italic"></span>
            </h2>

            {/* Spotlight Layer: Absolutely positioned over the base, revealed by mask */}
            <h2
              className="font-serif tracking-tighter leading-none italic absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100"
              style={{ 
                fontSize: '16rem', 
                color: "white",
                // Mask moves with global mouse position across the footer
                maskImage: `radial-gradient(circle 300px at ${mousePos.x}px ${mousePos.y - (footerRef.current?.offsetHeight ? footerRef.current.offsetHeight - 250 : 0)}px, black 0%, transparent 80%)`,
                WebkitMaskImage: `radial-gradient(circle 300px at ${mousePos.x}px ${mousePos.y - (footerRef.current?.offsetHeight ? footerRef.current.offsetHeight - 250 : 0)}px, black 0%, transparent 80%)`,
              }}
            >
              feeyangu<span className="font-bold not-italic"></span>
            </h2>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-col  md:flex-row items-center justify-between gap-6 border-t border-white/5 mt-12 pt-6 text-white/60">
            <p className="text-[10px] tracking-widest uppercase">
              © 2026 Feeyangu Complete. All rights reserved.
            </p>
            <div className="flex gap-10">
              <a href="#" className="text-[11px] hover:text-white/60 transition-colors uppercase tracking-widest">
                Privacy Policy
              </a>
              <a href="#" className="text-[11px] hover:text-white/60 transition-colors uppercase tracking-widest">
                Terms of Use
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;