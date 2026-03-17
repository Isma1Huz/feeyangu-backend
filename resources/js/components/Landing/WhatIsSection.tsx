import { motion } from "framer-motion";

const WhatIsSection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12 md:gap-16">
          {/* Left title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          >
            <h2 className="font-serif text-foreground tracking-[-0.02em]" style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
                What Is Feeyangu
            </h2>
          </motion.div>

          {/* Right content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="space-y-6"
          >
            <p className="text-foreground text-base leading-relaxed">
                Feeyangu  is a comprehensive, long-term school management platform built around one central principle:
            </p>

            <p className="text-primary font-semibold italic text-base">
              A well-run school takes structure, integration, and the right tools.
            </p>

            <p className="text-foreground text-base leading-relaxed">
              Many schools juggle between spreadsheets, disconnected apps, and manual processes without a unified system. They collect data, but struggle to connect it, analyse it, or act on it effectively.
            </p>

            <p className="text-foreground font-semibold italic text-base">
                Feeyangu Complete was designed to solve that problem.
            </p>

            <p className="text-foreground font-semibold text-base">
              It provides a complete modular framework that:
            </p>

            <ul className="space-y-3 text-foreground text-base">
              <li className="flex items-start gap-2">
                <span className="text-foreground mt-1">•</span>
                <span>Starts with core essentials before adding advanced features</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground mt-1">•</span>
                <span>Builds integrations gradually instead of disconnected systems</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground mt-1">•</span>
                <span>Connects different modules so operations feel coherent</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-foreground mt-1">•</span>
                <span>Keeps all stakeholders aligned alongside daily school life</span>
              </li>
            </ul>

            <p className="text-foreground text-base">
              This is not a collection of random tools. <span className="text-primary font-semibold">It is a guided ecosystem.</span>
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default WhatIsSection;
