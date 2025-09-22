import React from 'react';
import SEO from "@/components/SEO";
import LandingNavigation from '@/components/landing/LandingNavigation';
import { HeroSectionModern } from '@/components/ui/hero-section-modern';
import IntegrationsBanner from '@/components/landing/IntegrationsBanner';
import ModernFeaturesSection from '@/components/landing/ModernFeaturesSection';
import VideoDemo from '@/components/landing/VideoDemo';
import CaseStudies from '@/components/landing/CaseStudies';
import EnhancedTestimonials from '@/components/landing/EnhancedTestimonials';
import BenefitsSection from '@/components/landing/BenefitsSection';
import FAQSection from '@/components/landing/FAQSection';
import FooterSection from '@/components/landing/FooterSection';

const Home = () => {
  return (
    <>
      <SEO 
        title="MetaConstrutor - Gestão Inteligente de Obras | Plataforma Completa"
        description="Plataforma completa para gestão de obras, RDO digital, controle de equipes e relatórios inteligentes. Aumente sua produtividade em até 40% e reduza retrabalhos."
        canonical={window.location.href}
      />
      
      <LandingNavigation />
      
      <div className="min-h-screen bg-background w-full">
        <section className="py-12 md:py-16 lg:py-20">
          <HeroSectionModern />
        </section>
        <section className="py-8 md:py-12 lg:py-16">
          <IntegrationsBanner />
        </section>
        <section className="py-12 md:py-16 lg:py-20">
          <ModernFeaturesSection />
        </section>
        <section className="py-8 md:py-12 lg:py-16">
          <VideoDemo />
        </section>
        <section className="py-12 md:py-16 lg:py-20">
          <CaseStudies />
        </section>
        <section className="py-8 md:py-12 lg:py-16">
          <EnhancedTestimonials />
        </section>
        <section className="py-12 md:py-16 lg:py-20">
          <BenefitsSection />
        </section>
        <section className="py-8 md:py-12 lg:py-16">
          <FAQSection />
        </section>
        <FooterSection />
      </div>
    </>
  );
};

export default Home;
