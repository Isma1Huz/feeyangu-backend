import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import screenshot1 from "@/assets/hero1.png";
import screenshot2 from "@/assets/hero2.png";
import screenshot3 from "@/assets/hero3.png";

const SLIDES = [
  {
    tagline: "Feeyangu Complete",
    title: "Everything your school needs to run smoothly, in one platform.",
    image: screenshot1,
    buttonText: "Get Started Now",
    bubbleColor: "rgba(227, 84, 45, 0.15)",
  },
  {
    tagline: "Built for Kenyan Schools",
    title: "CBC, 8-4-4, and Cambridge — all ready in one platform.",
    image: screenshot2,
    buttonText: "Learn More",
    bubbleColor: "rgba(26, 46, 53, 0.1)",
  },
  {
    tagline: "Finance With Feeyangu",
    title: "Automated M-Pesa collection and real-time reconciliation.",
    image: screenshot3,
    buttonText: "Explore Finance",
    bubbleColor: "rgba(227, 84, 45, 0.12)",
  },
];

const HeroSection = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative max-w-6xl mx-auto py-20 h-[74vh] flex items-center overflow-hidden">
      {/* BUBBLE BACKGROUND */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full md:w-[60%] h-full pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={`bubble-${index}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 1.5 }}
            className="w-full h-full"
            style={{
              // background: `radial-gradient(circle at 60% 50%, ${SLIDES[index].bubbleColor} 0%, transparent 70%)`,
            }}
          />
        </AnimatePresence>
      </div>

      <div className="container mx-auto px-6 relative z-10 h-full flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* LEFT CONTENT */}
          <div className="max-w-2xl min-h-[300px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${index}`}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-sm font-bold uppercase tracking-widest text-[#E3542D] mb-4">
                  {SLIDES[index].tagline}
                </p>

                <h1
                  className="font-serif text-[#1A2E35] leading-[1.1] tracking-[-0.03em] mb-8"
                  style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
                >
                  {SLIDES[index].title}
                </h1>

                <div className="flex flex-wrap gap-4 items-center">
                  <button className="bg-[#1A2E35] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#E3542D] transition-colors duration-300 shadow-xl shadow-black/10">
                    {SLIDES[index].buttonText}
                  </button>
                  <button className="text-[#1A2E35] font-bold px-6 py-4 hover:underline">
                    Learn More
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT SCREENSHOT SECTION */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={`img-${index}`}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -40, scale: 1.05 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10"
              >
                <div className=" p-2 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)]">
                  <img
                    src={SLIDES[index].image}
                    alt="Software Dashboard"
                    className="rounded-xl w-full h-auto"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
            
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#E3542D]/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#1A2E35]/5 rounded-full blur-3xl" />
          </div>
        </div>

        {/* FIXED POSITION PROGRESS INDICATORS */}
        <div className="absolute bottom-8 pt-40 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className="h-1.5 rounded-full bg-gray-600 overflow-hidden transition-all duration-500"
                style={{ width: i === index ? "48px" : "12px" }}
              >
                {i === index && (
                  <motion.div 
                    layoutId="activeBar"
                    className="w-full h-full bg-[#E3542D]" 
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;