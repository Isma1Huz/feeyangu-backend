import { motion } from "framer-motion";
import { Star, ChevronRight } from "lucide-react";

const testimonials = [
  {
    name: "Mrs. Aisha Bello",
    role: "Principal, Greenfield Academy",
    quote: "Feeyangu is the single most reliable platform for managing a school. It has transformed how we handle admissions, finances, and parent communication. We can't imagine going back to spreadsheets.",
    variant: "teal" as const,
  },
  {
    name: "Mr. Ibrahim Musa",
    role: "School Owner, Sunrise Schools",
    quote: "Since adopting Feeyangu, our operational efficiency has improved dramatically. The analytics alone have saved us countless hours of manual reporting. Every school leader needs this tool.",
    variant: "coral" as const,
  },
  {
    name: "Mrs. Fatima Yusuf",
    role: "Admin Head, Al-Noor International",
    quote: "The communication hub has been a game-changer. Parents are more engaged, teachers are more informed, and administration is finally stress-free. It's like having an extra team member.",
    variant: "teal" as const,
  },
  {
    name: "Dr. Usman Abdullahi",
    role: "Director, Heritage Schools Group",
    quote: "Managing multiple school branches used to be chaos. Feeyangu gave us the unified view and control we desperately needed. The multi-branch support is outstanding.",
    variant: "coral" as const,
  },
  {
    name: "Mrs. Zainab Okonkwo",
    role: "Vice Principal, Crescent Academy",
    quote: "The timetable and scheduling module alone is worth the subscription. Intelligent, reliable, and incredibly easy to use. Our teachers love how intuitive it is.",
    variant: "teal" as const,
  },
];

const cardRotations = [-8, -4, 0, 4, 8];

const TestimonialsSection = () => {
  return (
    <section className="pb-32 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          >
            <h2
              className="font-serif text-foreground tracking-[-0.02em]"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
            >
              Trusted by schools
              <br />
              across <span className="text-gradient-gold">50+ cities</span>
            </h2>
          </motion.div>

          <motion.a
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            href="#"
            className="mt-6 lg:mt-2 inline-block border border-foreground px-6 py-2.5 rounded-full text-sm text-foreground hover:bg-foreground hover:text-background transition-all duration-300"
          >
            Read More
          </motion.a>
        </div>

        {/* Fan of cards - desktop */}
        <div className="hidden md:flex justify-center items-end gap-0 relative h-[600px]">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: cardRotations[i] }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              whileHover={{
                rotate: 0,
                scale: 1.08,
                zIndex: 20,
                transition: { duration: 0.3 },
              }}
              className={`absolute w-72 min-h-[340px] rounded-3xl p-7 cursor-pointer transition-shadow duration-300 flex flex-col ${
                t.variant === "teal"
                  ? "bg-teal-dark text-card-foreground"
                  : "bg-coral-card text-white"
              } card-shadow hover:card-shadow-hover`}
              style={{
                left: `${10 + i * 16}%`,
                bottom: i === 2 ? "40px" : "0px",
                zIndex: i === 2 ? 10 : 5 - Math.abs(i - 2),
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, si) => (
                    <Star
                      key={si}
                      size={14}
                      fill="currentColor"
                      className={t.variant === "teal" ? "text-primary" : "text-white"}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs uppercase tracking-wider opacity-70">Feeyangu</span>
                  <ChevronRight size={14} className="opacity-70" />
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-6">{t.quote}</p>
              <div className="mt-auto">
                <p className="font-serif text-sm font-medium">{t.name}</p>
                <p className="text-xs opacity-60">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile cards - stacked */}
        <div className="md:hidden space-y-4">
          {testimonials.slice(0, 3).map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`rounded-3xl p-6 card-shadow ${
                t.variant === "teal"
                  ? "bg-teal-dark text-card-foreground"
                  : "bg-coral-card text-white"
              }`}
            >
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, si) => (
                  <Star
                    key={si}
                    size={14}
                    fill="currentColor"
                    className={t.variant === "teal" ? "text-primary" : "text-white"}
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-4">{t.quote}</p>
              <p className="font-serif text-sm">{t.name}</p>
              <p className="text-xs opacity-60">{t.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
