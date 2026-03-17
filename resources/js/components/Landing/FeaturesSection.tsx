import { motion } from "framer-motion";
import { 
  Library, 
  Map, 
  UserCheck, 
  Sprout 
} from "lucide-react";

const features = [
  {
    icon: Library,
    title: "Structured Operations",
    description: "Manage your school in a way that is organised and dependable",
  },
  {
    icon: Map,
    title: "Clear Progression",
    description: "Add modules step by step without feeling overwhelmed",
  },
  {
    icon: UserCheck,
    title: "Trusted Technology",
    description: "Built by education specialists who understand Kenyan schools",
  },
  {
    icon: Sprout,
    title: "Grounded Growth",
    description: "Grow your school's capabilities while staying balanced",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const FeaturesSection = () => {
  return (
    <section className="pt-10 pb-24 relative ">
      <div className="container mx-auto px-6">
        {/* Header section remains untouched as requested */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2
            className="font-serif text-[#1A2E35] tracking-[-0.02em]"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}
          >
            A <span className="text-orange-600">complete platform</span> designed to help you manage your school with <em>clarity, consistency,</em> and <em>confidence.</em>          </h2>
          <p className="mt-4 text-muted-foreground text-base leading-relaxed">
              Feeyangu removes confusion, filters noise, and gives schools a reliable foundation in every aspect of administration and academics.          </p>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 max-w-6xl mx-auto"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="flex flex-col items-center text-center group"
            >
              {/* Icon Container: No background, specific color and weight */}
              <div className="mb-6 flex items-center justify-center">
                <feature.icon 
                  className="text-[#E3542D]" // The exact rust-orange from your image
                  size={48} 
                  strokeWidth={1.2} // Light weight for a modern, high-end feel
                />
              </div>

              <h3 className="font-serif text-xl font-semibold text-[#1A2E35] mb-3">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground/80 text-[15px] leading-relaxed max-w-[240px]">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <a
            href="#pricing"
            className="inline-block bg-foreground text-background px-10 py-4 rounded-full text-sm tracking-wide hover:opacity-90 transition-opacity duration-300"
          >
            Subscribe Now
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;