import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedCollection from "@/components/FeaturedCollection";
import Services from "@/components/Services";
import SetupProcess from "@/components/SetupProcess";
import FeaturedProjects from "@/components/FeaturedProjects";
import Categories from "@/components/Categories";
import WhyChoose from "@/components/WhyChoose";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      {/* Floating Header */}
      <Navbar />

      {/* Main Experience Layout */}
      <main className="min-h-screen bg-bg flex flex-col">
        {/* Cinematic Hero (5 layers including particles, parallax Betta fish, and content) */}
        <Hero />

        {/* Exotic Specimen Grid */}
        <FeaturedCollection />

        {/* Bespoke Services Description & Cards */}
        <Services />

        {/* Animated Custom Setup Timeline */}
        <SetupProcess />

        {/* Large Format Projects Gallery */}
        <FeaturedProjects />

        {/* Category Configurations */}
        <Categories />

        {/* Value Propositions */}
        <WhyChoose />

        {/* Masonry Filterable Showroom Gallery */}
        <Gallery />

        {/* Reviews Carousel */}
        <Testimonials />

        {/* Subscription Newsletter */}
        <Newsletter />

        {/* WhatsApp/Phone and Request Form */}
        <Contact />
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
