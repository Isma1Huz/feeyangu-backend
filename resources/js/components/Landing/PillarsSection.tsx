import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import pillarImage from "@/assets/pillar-image.jpg";

const pillars = [
  {
    title: "Integrated Operations That Make Sense",
    number: 1,
    description: "School operations are deeply connected. Managing them in isolation often leads to confusion and inefficiency.",
    subtitle: "Feeyangu:",  
    bullets: [
      "Introduces modules in the right order based on your school's needs",
      "Connects academics, finance, attendance, and transport seamlessly",
      "Helps you see how fee payments affect class participation",
      "Prevents data silos that usually appear with disconnected systems",
    ],
    footer: "You always know where everything stands, what needs attention, and why it matters.",
  },
  {
    title: "Built for Kenyan Education, Not Adapted",
    number: 2,
    description: "CBC, 8-4-4, and Cambridge — one system, fully configured. Every curriculum has unique requirements. Feeyangu Complete handles them all natively, not as an afterthought.",
    subtitle: "",
    bullets: [
      "CBC: Full strand/sub-strand hierarchy, competency grading, assessment books",
      "8-4-4: Traditional exams, CATs, mean grade calculations, position generation",
      "Cambridge: Checkpoint, IGCSE, AS/A Level with component management",
    ],
    footer: "No workarounds. No manual adjustments. Just configure and go.",
  },
  {
    title: "Consistency Over Complexity",
    number: 3,
    description: "We prioritize dependability and ease-of-use over bloated feature sets. Your team can master Feeyangu in days, not months, and trust it to work every single day.",
    subtitle: "",
    bullets: [],
    footer: "",
  },
];





const PillarsSection = () => {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <section className="py-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center mb-6"
        >
          <div className="w-[3px] h-10 bg-primary" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="text-center mb-12"
        >
          <h2
            className="font-serif text-foreground tracking-[-0.02em]"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
          >
            How <span className="text-gradient-gold italic">Feeyangu </span> is designed
          </h2>
          <p className="mt-3 text-muted-foreground text-sm">
            Click the sections below to explore the three core pillars.
          </p>
        </motion.div>

        <div className="space-y-4">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className={`rounded-2xl border transition-colors duration-300 overflow-hidden ${
                openIndex === index
                  ? "border-primary bg-primary/5"
                  : "border-primary/30 hover:border-primary/60"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full flex items-center justify-between px-8 py-5 group"
              >
                <span className="font-sans text-base font-semibold text-foreground text-left">
                  {pillar.title}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-primary font-sans text-sm font-semibold">{pillar.number}</span>
                  {openIndex === index ? (
                    <ChevronUp className="text-primary" size={18} />
                  ) : (
                    <ChevronDown className="text-primary" size={18} />
                  )}
                </div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 pb-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {pillar.description}
                          </p>
                          {pillar.subtitle && (
                            <p className="text-foreground font-semibold text-sm">{pillar.subtitle}</p>
                          )}
                          {pillar.bullets.length > 0 && (
                            <ul className="space-y-2">
                              {pillar.bullets.map((b, bi) => (
                                <li key={bi} className="flex items-start gap-2 text-sm text-primary">
                                  <span className="mt-1">•</span>
                                  <span>{b}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          {pillar.footer && (
                            <p className="text-foreground text-sm font-medium">{pillar.footer}</p>
                          )}
                        </div>
                        {index === 0 && (
                          <div className="w-48 h-36 rounded-xl overflow-hidden flex-shrink-0">
                            <img
                              src={pillarImage}
                              alt="School operations"
                              className="w-full h-full object-cover"
                              style={{ filter: "sepia(0.3) saturate(1.2) hue-rotate(-10deg)" }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 text-center"
        >
          <a
            href="#pricing"
            className="inline-block bg-primary text-primary-foreground px-10 py-4 rounded-full text-sm tracking-wide hover:opacity-90 transition-opacity duration-300"
          >
            Subscribe Now
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center my-6"
        >
          <div className="w-[3px] h-10 bg-primary" />
        </motion.div>

      </div>
    </section>
  );
};

export default PillarsSection;
