import { motion } from "framer-motion";
import { ArrowRight, Camera, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import HowToGuide from "@/components/HowToGuide";
import { useIsMobile } from "@/hooks/use-mobile";

const Home = () => {
  const isMobile = useIsMobile();

  // All FAQ items
  const allFAQs = [
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
  ];

  // Show only 3 most important FAQs on mobile for better UX
  const displayedFAQs = isMobile ? allFAQs.slice(0, 3) : allFAQs;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero pt-20 pb-12 sm:pt-24 sm:pb-16 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4 sm:mb-6 leading-tight">
                <span style={{ color: "#FFF8DC" }}>
                  Capture Your Moments with{" "}
                </span>
                <span style={{ color: "#FF6B6B" }} className="drop-shadow-lg">
                  KaryaKlik
                </span>{" "}
                📸
              </h1>
              <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 leading-relaxed" style={{ color: "#E0E0E0" }}>
                A web-based digital photo booth for events, friends, and memories. Create stunning photos with beautiful templates in seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link to="/booth" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-full shadow-soft hover:shadow-hover transition-all group">
                    Start Now
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/gallery" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-full border-2 border-white text-white hover:bg-white/10 transition-all"
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
              <div className="animate-float px-4 sm:px-6 lg:px-8 mt-8 lg:mt-0">
                <img
                  src="/assets/hero-camera.png"
                  alt="Digital Camera Illustration"
                  className="w-full max-w-sm sm:max-w-md lg:max-w-xl mx-auto drop-shadow-2xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How To Guide Section */}
      <HowToGuide />

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-[#1A1A1A]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
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
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#E53935] mb-1 sm:mb-2">
                  {stat.number}
                </h3>
                <p className="text-gray-300 text-sm sm:text-base md:text-lg">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-12 sm:py-16 lg:py-32 bg-[#1A1A1A]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-3 sm:mb-4 text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto px-4">
              Everything you need to know about KaryaKlik
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-4">
            {displayedFAQs.map((faq, index) => (
              <FAQItem key={index} question={faq.q} answer={faq.a} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-32 gradient-hero">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 sm:mb-6" style={{ color: "#FFF8DC" }}>
              Ready to Create Amazing Photos?
            </h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto px-4" style={{ color: "#E0E0E0" }}>
              Start capturing beautiful memories with KaryaKlik today
            </p>
            <Link to="/booth" className="inline-block">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-base sm:text-lg px-8 sm:px-10 py-4 sm:py-6 rounded-full shadow-soft hover:shadow-hover transition-all group">
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
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
            className="w-full p-4 sm:p-6 text-left flex justify-between items-center"
          >
            <h3 className="font-semibold text-base sm:text-lg text-white pr-4">{question}</h3>
            <ChevronDown
              className={`w-5 h-5 text-[#E53935] transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""
                }`}
            />
          </button>
          {isOpen && (
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <p className="text-sm sm:text-base text-gray-200">{answer}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Home;
