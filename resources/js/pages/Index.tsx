import Navbar from "@/components/Landing/Navbar";
import HeroSection from "@/components/Landing/HeroSection";
import FeaturesSection from "@/components/Landing/FeaturesSection";
import StorySection from "@/components/Landing/StorySection";
import WhatIsSection from "@/components/Landing/WhatIsSection";
import WhoIsForSection from "@/components/Landing/WhoIsForSection";
import PillarsSection from "@/components/Landing/PillarsSection";
import TestimonialsSection from "@/components/Landing/TestimonialsSection";
import PricingSection from "@/components/Landing/PricingSection";
import Footer from "@/components/Landing/Footer";
import BenefitsSection from "@/components/Landing/BenefitsSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#F4F2EA]">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <StorySection />
      <WhatIsSection />
      <WhoIsForSection />
      <PillarsSection />
      <TestimonialsSection />
      <BenefitsSection />
      <PricingSection />
      
      <Footer />
    </div>
  );
};

export default Index;
