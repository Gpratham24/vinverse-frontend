/**
 * Landing Page - Marketing layer for VinVerse.
 * Features: Hero section, How it Works, Feature grid, GamerLink showcase, Testimonials, CTA, Footer.
 */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import HeroSection from "../components/landing/HeroSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import FeatureGrid from "../components/landing/FeatureGrid";
import GamerLinkShowcase from "../components/landing/GamerLinkShowcase";
import TestimonialsSection from "../components/landing/TestimonialsSection";
import CTASection from "../components/landing/CTASection";

const LandingPage = () => {
  return (
    <main className="pt-20">
      <HeroSection />
      <HowItWorksSection />
      <FeatureGrid />
      <GamerLinkShowcase />
      <TestimonialsSection />
      <CTASection />
    </main>
  );
};

export default LandingPage;
