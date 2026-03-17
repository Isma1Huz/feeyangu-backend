import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Recommended SaaS Sitemap for School Management
  const navLinks = [
    { name: "Modules", href: "#benefits" },
    { name: "Curriculum Support", href: "#curriculum" }, // Highlighting CBC/8-4-4/Cambridge
    { name: "Pricing", href: "#pricing" },
    { name: "Who It's For", href: "#who-is-it-for" },
  ];

  return (
    <div className="w-full py-4 px-6 fixed top-0 left-0 z-[100]">
      <nav className="container mx-auto max-w-6xl bg-[#e8e8dd]/90 backdrop-blur-md rounded-full border border-border/50 shadow-[0_1px_5px_2px_rgba(234,73,47,0.2)] px-8 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <a href="#" className="flex items-center gap-2 group">
          <span className="font-serif text-[#1A2E35] text-2xl tracking-tight font-bold transition-colors duration-300 group-hover:text-[#E3542D]">
            feeyangu<span className="text-[#E3542D] italic font-medium">.</span>
          </span>
        </a>

        {/* Desktop nav - Strategy: Discovery -> Pricing -> Action */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name}
              href={link.href} 
              className="text-[13px] font-bold uppercase tracking-wider text-[#1A2E35]/70 hover:text-[#E3542D] transition-colors duration-300"
            >
              {link.name}
            </a>
          ))}
          
          <div className="h-4 w-px bg-[#1A2E35]/10 mx-1" /> {/* Divider */}

          <a href="/login" className="text-[13px] font-bold uppercase tracking-wider text-[#1A2E35]/70 hover:text-[#1A2E35]">
            Sign In
          </a>
          
          <a 
            href="/register" 
            className="bg-[#1A2E35] text-white px-5 py-2 rounded-full text-[12px] font-bold uppercase tracking-widest hover:bg-[#E3542D] transition-all duration-300 shadow-md"
          >
            Get Started
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-[#1A2E35]"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden container mx-auto max-w-5xl mt-3 bg-[#e8e8dd] rounded-3xl border border-border/50 shadow-xl"
          >
            <div className="flex flex-col gap-5 px-8 py-8">
              {navLinks.map((link) => (
                <a 
                  key={link.name}
                  href={link.href} 
                  onClick={() => setIsOpen(false)} 
                  className="text-sm font-bold uppercase tracking-widest text-[#1A2E35]"
                >
                  {link.name}
                </a>
              ))}
              <hr className="border-[#1A2E35]/10" />
              <a href="#" className="text-sm font-bold uppercase tracking-widest text-[#1A2E35]">Sign In</a>
              <a href="#pricing" className="text-sm font-bold uppercase tracking-widest text-[#E3542D]">Get Started</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;