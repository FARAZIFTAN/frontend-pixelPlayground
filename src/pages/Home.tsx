import { motion } from "framer-motion";
import { ArrowRight, Camera, Image, Share2, Palette, Star, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import HowToGuide from "@/components/HowToGuide";
import ProAccountGuide from "@/components/ProAccountGuide";

const Home = () => {
  const features = [
    {
      icon: Camera,
      title: "Online Photo Booth",
      description: "Access professional photo booth features right from your browser. No downloads needed.",
    },
    {
      icon: Palette,
      title: "Beautiful Templates",
      description: "Choose from dozens of professionally designed templates for any occasion.",
    },
    {
      icon: Share2,
      title: "Instant Sharing",
      description: "Share your photos instantly via link or QR code with friends and family.",
    },
  ];

  // Photo showcase examples - real photos created with templates
  const showcasePhotos = [
    {
      url: "https://images.unsplash.com/photo-1464047736614-af63643285bf?w=500&h=500&fit=crop",
      template: "Birthday Party",
      event: "Sarah's 25th Birthday",
      category: "Birthday",
    },
    {
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=500&fit=crop",
      template: "Wedding Elegant",
      event: "Mike & Lisa's Wedding",
      category: "Wedding",
    },
    {
      url: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=500&h=500&fit=crop",
      template: "Graduation Day",
      event: "Class of 2024",
      category: "Education",
    },
    {
      url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=500&h=500&fit=crop",
      template: "Corporate Event",
      event: "Annual Meeting 2024",
      category: "Corporate",
    },
    {
      url: "https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?w=500&h=500&fit=crop",
      template: "Baby Shower",
      event: "Emma's Baby Shower",
      category: "Baby",
    },
    {
      url: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=500&h=500&fit=crop",
      template: "Christmas Party",
      event: "Holiday Celebration",
      category: "Holiday",
    },
    {
      url: "https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?w=500&h=500&fit=crop",
      template: "New Year's Eve",
      event: "Welcome 2025",
      category: "Holiday",
    },
    {
      url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=500&h=500&fit=crop",
      template: "Valentine's Day",
      event: "Couple's Celebration",
      category: "Love",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 leading-tight">
                <span style={{ color: "#FFF8DC" }}>
                  Capture Your Moments with{" "}
                </span>
                <span style={{ color: "#FF6B6B" }} className="drop-shadow-lg">
                  KaryaKlik
                </span>{" "}
                📸
              </h1>
              <p className="text-lg md:text-xl mb-8 leading-relaxed" style={{ color: "#E0E0E0" }}>
                A web-based digital photo booth for events, friends, and memories. Create stunning photos with beautiful templates in seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/booth">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 rounded-full shadow-soft hover:shadow-hover transition-all group">
                    Start Now
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/gallery">
                  <Button 
                    variant="outline" 
                    className="text-lg px-8 py-6 rounded-full border-2 border-white text-white hover:bg-white/10 transition-all"
                  >
                    View Templates
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex justify-center items-center"
            >
              <div className="animate-float px-2 lg:px-8">
                <img
                  src="/assets/hero-camera.png"
                  alt="Digital Camera Illustration"
                  className="w-full max-w-xl mx-auto drop-shadow-2xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How To Guide Section */}
      <HowToGuide />

      {/* Pro Account Guide Section */}
      <ProAccountGuide />

      {/* Stats Section */}
      <section className="py-16 bg-[#1A1A1A]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "10K+", label: "Happy Users" },
              { number: "50K+", label: "Photos Created" },
              { number: "100+", label: "Templates" },
              { number: "4.9★", label: "User Rating" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <h3 className="text-4xl md:text-5xl font-bold text-[#E53935] mb-2">
                  {stat.number}
                </h3>
                <p className="text-gray-300 text-lg">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-32 bg-[#1A1A1A]">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Everything you need to know about KaryaKlik
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "Is KaryaKlik really free to use?",
                a: "Yes! KaryaKlik is completely free to use. You can create unlimited photos with our templates.",
              },
              {
                q: "Do I need to download any software?",
                a: "No downloads needed! KaryaKlik works entirely in your web browser on any device.",
              },
              {
                q: "How do I share photos with guests?",
                a: "You can instantly share photos via QR code, direct link, or download them to share on social media.",
              },
              {
                q: "What image quality can I expect?",
                a: "All photos are saved in high-quality resolution, perfect for printing and digital sharing.",
              },
              {
                q: "Can I print the photos?",
                a: "Yes! All photos are saved in high resolution, making them perfect for printing in any size you need.",
              },
            ].map((faq, index) => (
              <FAQItem key={index} question={faq.q} answer={faq.a} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 gradient-hero">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-6" style={{ color: "#FFF8DC" }}>
              Ready to Create Amazing Photos?
            </h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto" style={{ color: "#E0E0E0" }}>
              Start capturing beautiful memories with KaryaKlik today
            </p>
            <Link to="/booth">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-10 py-6 rounded-full shadow-soft hover:shadow-hover transition-all group">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

const FAQItem = ({ question, answer, index }: { question: string; answer: string; index: number }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="gradient-card border-0 shadow-soft hover:shadow-hover transition-all">
        <CardContent className="p-0">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full p-6 text-left flex justify-between items-center"
          >
            <h3 className="font-semibold text-lg text-white pr-4">{question}</h3>
            <ChevronDown
              className={`w-5 h-5 text-[#E53935] transition-transform flex-shrink-0 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {isOpen && (
            <div className="px-6 pb-6">
              <p className="text-gray-200">{answer}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Home;
