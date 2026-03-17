import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import benefitCommunication from "@/assets/benefit-communication.jpg";
import benefitAnalytics from "@/assets/benefit-analytics.jpg";
import benefitStaff from "@/assets/benefit-staff.jpg";
import benefitEnrollment from "@/assets/benefit-enrollment.jpg";
import benefitExams from "@/assets/benefit-exams.jpg";

const benefits = [
  {
    title: "Parent Communication Portal",
    description: "Send instant updates, share report cards, and keep parents informed with real-time notifications. No more lost circulars or missed announcements.",
    image: benefitCommunication,
    perfectFor: [
      "Schools with large parent communities needing instant updates",
      "Administrators tired of printing and distributing paper circulars",
      "Schools wanting to boost parent engagement and satisfaction",
      "Boarding schools requiring regular parent communication",
      "Schools looking to reduce admin overhead on communication",
    ],
  },
  {
    title: "Analytics & Reporting Dashboard",
    description: "Get real-time insights into student performance, fee collection trends, attendance patterns, and operational metrics — all from one unified dashboard.",
    image: benefitAnalytics,
    perfectFor: [
      "School directors who need data-driven decision making",
      "Administrators tracking fee collection and revenue trends",
      "Academic heads monitoring class and subject performance",
      "Schools preparing for regulatory audits and inspections",
      "Institutions benchmarking performance across branches",
    ],
  },
  {
    title: "Staff & HR Management",
    description: "Manage teacher profiles, track leave, handle payroll integration, and monitor staff performance — all within the same ecosystem your academics run on.",
    image: benefitStaff,
    perfectFor: [
      "Schools managing 50+ staff members across departments",
      "HR teams handling payroll, leave, and contract management",
      "Administrators coordinating substitute teacher assignments",
      "Schools tracking professional development and certifications",
      "Institutions needing centralized staff documentation",
    ],
  },
  {
    title: "Student Enrollment & Admissions",
    description: "Digitize your entire admissions pipeline — from online applications and document uploads to approval workflows and automatic class assignment.",
    image: benefitEnrollment,
    perfectFor: [
      "Growing schools receiving high volumes of applications",
      "Institutions managing multi-stage admission processes",
      "Schools that need NEMIS-synced enrollment records",
      "Administrators tired of paper-based registration forms",
      "Schools expanding to multiple campuses or branches",
    ],
  },
  {
    title: "Exam & Assessment Engine",
    description: "Create, schedule, and grade exams with automated report card generation. Support for CBC competency assessments, 8-4-4 grading, and Cambridge components.",
    image: benefitExams,
    perfectFor: [
      "Academic heads managing complex exam schedules",
      "Teachers needing streamlined grade entry and analysis",
      "Schools running multiple curricula simultaneously",
      "Institutions requiring automated transcript generation",
      "Schools wanting to reduce exam result processing time",
    ],
  },
];

const BenefitsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="benefits" className="py-24 relative">
      {/* Subtle warm gradient at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        // style={{ background: "linear-gradient(to top, hsl(8 72% 55% / 0.04), transparent)" }}
      />

      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="font-serif text-foreground tracking-[-0.02em]" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
            Core Platform Benefits
          </h2>
          <p className="mt-2 text-muted-foreground text-sm max-w-lg mx-auto">
            Explore the powerful features that make Feeyangu the complete school management solution.
          </p>
        </div>

        {/* Content area: Original Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 items-start">
          
          {/* Left: Accordion-style tabs */}
          <div>
            <h3 className="font-serif text-sm text-muted-foreground mb-4 tracking-wide uppercase">
              Core Features:
            </h3>
            <div className="space-y-2">
              {benefits.map((benefit, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => setActiveIndex(i)}
                  className={`border-b border-border py-4 transition-all duration-500 cursor-pointer ${
                    i === activeIndex 
                    ? "bg-[#162C2D] shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-xl px-6 -mx-4 border-transparent -translate-y-1" 
                    : "hover:bg-black/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className={`font-serif text-base transition-colors duration-300 ${i === activeIndex ? "text-white" : "text-muted-foreground"}`}>
                      {benefit.title}
                    </h4>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full transition-all duration-300 ${i === activeIndex ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                      {i === activeIndex ? "▾" : "›"}
                    </span>
                  </div>
                  <AnimatePresence>
                    {i === activeIndex && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 text-sm text-white/80 leading-relaxed overflow-hidden"
                      >
                        {benefit.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Image + Perfect for */}
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                <div className="rounded-2xl overflow-hidden aspect-[4/3] shadow-lg">
                  <img
                    src={benefits[activeIndex].image}
                    alt={benefits[activeIndex].title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="mt-8">
                  <h4 className="font-serif text-lg text-foreground mb-3">Perfect for</h4>
                  <ul className="space-y-2">
                    {benefits[activeIndex].perfectFor.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <span className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;