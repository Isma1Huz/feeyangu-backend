import { motion } from "framer-motion";
import schoolLibrary from "@/assets/school-library.jpg";

const items = [
  "Schools seeking a serious and reliable management system",
  "Administrators who want structured operations without chaos",
  "Those tired of jumping between spreadsheets and disconnected apps",
  "Schools that want consistency without hiring additional admin staff",
  "Anyone who wants to manage their school properly, not superficially",
  "Institutions that want to serve their community responsibly with transparency",
];

const WhoIsForSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Main Grid Wrapper */}
        <div className="max-w-6xl mx-auto relative grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-12 lg:gap-20 items-center">
          
          {/* Left - Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="rounded-2xl overflow-hidden ">
              <img
                src={schoolLibrary}
                alt="School library"
                className="w-full h-auto object-cover aspect-[4/5]"
                style={{ filter: "sepia(0.2) saturate(1.1)" }}
              />
            </div>
          </motion.div>

          {/* Middle - Exact Vertical Line */}
          <div className="hidden md:flex flex-col items-center justify-center h-full relative ">
            {/* The Vertical Line Body */}
            <div className="w-[3px] h-full bg-[#E3542D] relative">
               {/* Top Cap (Optional, based on style) */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-[#E3542D]" />
               
               {/* The "T" Base */}
               {/* <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-[3px] bg-[#E3542D]" /> */}
            </div>
          </div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="font-serif text-[#1A2E35] tracking-[-0.02em] mb-8" style={{ fontSize: "clamp(2.5rem, 5vw, 3.5rem)" }}>
              Who Feeyangu is <span className="text-[#E3542D] italic">For</span>
            </h2>

            <p className="text-[#1A2E35] font-bold text-[13px] uppercase tracking-wider mb-8 opacity-80">
              Feeyangu Complete is suitable for:
            </p>

            <div className="space-y-6 mb-10">
              {items.map((item, i) => (
                <div key={i} className="flex items-start gap-5 group">
                  <span className="text-[#E3542D] font-bold font-serif italic text-lg mt-[-4px] ">
                    0{i + 1}
                  </span>
                  <span className="text-[#1A2E35]/80 text-[15px] leading-relaxed">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[#1A2E35]/60 text-sm mb-10 italic">
              Whether you are a small private school or a large educational group, this platform is built for you.
            </p>

            <a
              href="#pricing"
              className="inline-block bg-[#1A2E35] text-white px-10 py-4 rounded-full text-sm tracking-widest uppercase font-semibold hover:bg-[#E3542D] transition-all duration-500 shadow-lg"
            >
              Subscribe Now
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhoIsForSection;