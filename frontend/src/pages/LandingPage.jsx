/**
 * Landing Page - Marketing layer for VinVerse.
 * Features: Hero section, Feature grid, GamerLink showcase, CTA, Footer.
 */
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import HeroSection from "../components/landing/HeroSection";
import FeatureGrid from "../components/landing/FeatureGrid";
import GamerLinkShowcase from "../components/landing/GamerLinkShowcase";
import PlayerSearch from "../components/landing/PlayerSearch";
import CTASection from "../components/landing/CTASection";

const LandingPage = () => {
  return (
    <div className="pt-20">
      <HeroSection />
      <PlayerSearch />
      <FeatureGrid />
      <GamerLinkShowcase />
      <CTASection />
    </div>
  );
};

export default LandingPage;
