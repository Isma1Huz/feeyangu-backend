import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const paragraphs = [
  "Growing a school should feel empowering, not overwhelming. Yet, school management often feels chaotic. Spreadsheets that don't talk to each other, disconnected payment systems, manual attendance tracking, and parents left in the dark. Why should running your school be this difficult?",
  "We felt the same way. We envisioned a better approach to manage, teach, and connect school communities across Kenya. A way to make school operations simple, transparent, and free from administrative headaches.",
  "What if there was one platform for managing academics, processing fees, tracking attendance, coordinating transport, communicating with parents, and syncing with NEMIS — all in one place?",
];

const StorySection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="about" className="relative">
      <div ref={containerRef} style={{ height: `${(paragraphs.length + 1) * 100}vh` }}>
        <div className="sticky top-0 min-h-screen flex items-center justify-center overflow-hidden story-gradient-bg">
          {/* Grain overlay */}
          <div className="absolute inset-0 story-grain-overlay pointer-events-none" />

          <div className="container mx-auto px-6 relative z-10 flex">
            {/* Left side: vertical line */}
            <div className="relative flex-shrink-0" style={{ width: "60px" }}>
              <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2" style={{ height: "70vh", top: "15vh" }}>
                <motion.div
                  className="origin-top"
                  style={{
                    height: lineHeight,
                    width: "2.5px",
                    background: "linear-gradient(to bottom, rgba(200,200,210,0.9), rgba(180,180,195,0.6))",
                  }}
                />
              </div>
            </div>

            {/* Right side: content */}
            <div className="flex-1 flex items-center justify-center relative min-h-screen">
              <MeetHeading scrollYProgress={scrollYProgress} />
              <ParagraphsBlock scrollYProgress={scrollYProgress} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface ScrollProps {
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}

const MeetHeading = ({ scrollYProgress }: ScrollProps) => {
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.2], [1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -30]);

  return (
    <motion.div style={{ opacity, y }} className="text-center absolute inset-0 flex items-center justify-center">
      <h2 className="font-sans text-white font-bold" style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)" }}>
        <span className="text-white/50 font-normal">Meet </span>
        <span className="text-white font-bold">Feeyangu</span>
      </h2>
    </motion.div>
  );
};

const ParagraphsBlock = ({ scrollYProgress }: ScrollProps) => {
  const blockOpacity = useTransform(scrollYProgress, [0.15, 0.25], [0, 1]);

  return (
    <motion.div style={{ opacity: blockOpacity }} className="max-w-2xl mx-auto space-y-8">
      {paragraphs.map((text, i) => (
        <ScrollHighlightParagraph
          key={i}
          text={text}
          index={i}
          total={paragraphs.length}
          scrollYProgress={scrollYProgress}
        />
      ))}
    </motion.div>
  );
};

interface ScrollHighlightParagraphProps {
  text: string;
  index: number;
  total: number;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}

const ScrollHighlightParagraph = ({ text, index, total, scrollYProgress }: ScrollHighlightParagraphProps) => {
  const words = text.split(" ");
  const scrollStart = 0.2;
  const scrollEnd = 0.95;
  const range = scrollEnd - scrollStart;
  const segmentSize = range / total;
  const start = scrollStart + index * segmentSize;
  const end = scrollStart + (index + 1) * segmentSize;

  const isLastParagraph = index === total - 1;

  return (
    <p className="text-xl md:text-2xl font-bold leading-snug">
      {words.map((word, wi) => {
        const wordStart = start + (wi / words.length) * (end - start);
        const wordEnd = start + ((wi + 1) / words.length) * (end - start);
        return (
          <WordHighlight
            key={wi}
            word={word}
            scrollYProgress={scrollYProgress}
            start={wordStart}
            end={wordEnd}
            highlightColor={isLastParagraph ? "hsl(8, 72%, 60%)" : "#ffffff"}
          />
        );
      })}
    </p>
  );
};

interface WordHighlightProps {
  word: string;
  scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
  start: number;
  end: number;
  highlightColor: string;
}

const WordHighlight = ({ word, scrollYProgress, start, end, highlightColor }: WordHighlightProps) => {
  const opacity = useTransform(scrollYProgress, [start, end], [0.3, 1]);
  const color = useTransform(scrollYProgress, [start, end], [
    "rgba(255,255,255,0.3)",
    highlightColor,
  ]);

  return (
    <motion.span style={{ opacity, color }} className="inline-block mr-[0.3em]">
      {word}
    </motion.span>
  );
};

export default StorySection;
