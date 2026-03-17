import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import subbg from '@/assets/subbg.png'
const features = [
  "Complete access to all 18+ Feeyangu modules",
  "Immediate access for all staff, teachers, and administrators",
  "Dedicated parent and student portals included",
  "Monthly live training sessions with our education specialists",
  "All new features and updates added at no extra cost",
  "Structured implementation built for clarity, consistency, and long-term growth",  
  "Priority support with dedicated account manager",
];

const PricingSection = () => {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-6">
        {/* Vertical line */}
        <div className="flex justify-center mb-6">
          <div className="w-[3px] h-10 bg-primary" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="text-center mb-10"
        >
          <h2
            className="font-serif text-foreground tracking-[-0.02em]"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
          >
            Begin Your
            <br />
            <span className="text-gradient-gold italic">Journey of Smooth Operations</span>
            <br />
            With Confidence
          </h2>
          <p className="mt-4 text-muted-foreground text-base">
            Choose the plan that best suits your school.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="flex justify-center gap-2 mb-12"
        >
          <button
            onClick={() => setAnnual(true)}
            className={`px-6 py-2.5 rounded-full text-sm transition-all duration-300 ${
              annual
                ? "bg-primary text-primary-foreground shadow-md"
                : "border border-border text-muted-foreground"
            }`}
          >
            Annually
          </button>
          <button
            onClick={() => setAnnual(false)}
            className={`px-6 py-2.5 rounded-full text-sm transition-all duration-300 ${
              !annual
                ? "bg-primary text-primary-foreground shadow-md"
                : "border border-border text-muted-foreground"
            }`}
          >
            Monthly
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2  md:grid-cols-2 gap-10 items-start"
        >
          {/* Left - placeholder card area */}
          <div className="hidden " />
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -40, scale: 1.05 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10"
              >
                <div >
                  <img
                    src={subbg}
                    alt="Software Dashboard"
                    className="rounded-xl w-full h-auto"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          <div>
            <h3 className="font-serif text-foreground mb-1" style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}>
              Feeyangu <span className="text-gradient-gold">Subscription</span>
            </h3>
            <p className="text-muted-foreground text-sm mb-8">
              A single membership designed to support complete, long-term school management.
            </p>

            <div className="space-y-3 mb-8">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Check className="text-primary-foreground" size={12} />
                  </div>
                  <span className="text-sm text-foreground">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-muted-foreground text-sm">KES</span>
              <span className="font-sans text-5xl font-bold text-foreground tabular-nums">
                {annual ? "15,000" : "18,000"}
              </span>
              <span className="text-muted-foreground text-sm">/month.</span>
              {annual && (
                <span className="ml-2 text-primary text-sm italic font-medium">
                  Billed KES 180,000 annually
                </span>
              )}
            </div>

            <a
              href="#"
              className="block w-full text-center bg-primary shadow-md text-primary-foreground py-4 rounded-full text-sm tracking-wide hover:opacity-90 transition-opacity duration-300"
            >
              Get Started
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
