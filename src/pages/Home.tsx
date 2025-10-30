import { motion } from "framer-motion";
import { ArrowRight, Camera, Image, Share2, Palette, Star, Quote } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import heroCameraImage from "@/assets/hero-camera.png";

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
    {
      icon: Image,
      title: "Create Your Own",
      description: "Design and upload custom templates to match your unique event style.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Event Organizer",
      content: "KaryaKlik made our wedding so much fun! Guests loved the instant photo booth and the templates were gorgeous.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Birthday Party Host",
      content: "Super easy to use and the quality is amazing. Our party photos turned out perfect!",
      rating: 5,
    },
    {
      name: "Emma Rodriguez",
      role: "Corporate Event Manager",
      content: "Professional, reliable, and beautiful results. We use KaryaKlik for all our company events now.",
      rating: 5,
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
                  src={heroCameraImage}
                  alt="Digital Camera Illustration"
                  className="w-full max-w-xl mx-auto drop-shadow-2xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 text-white">
              Why Choose KaryaKlik?
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Everything you need to create stunning photo booth experiences
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="gradient-card border-0 shadow-soft hover:shadow-hover transition-all h-full group cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#E53935] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-all">
                      <feature.icon className="w-8 h-8 text-white transition-colors" />
                    </div>
                    <h3 className="font-heading font-semibold text-xl mb-3 text-white">{feature.title}</h3>
                    <p className="text-gray-200">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview Section */}
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
              See It In Action
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Professional-quality photos with just a few clicks
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="gradient-card rounded-3xl shadow-hover p-8 border-0">
              <div className="aspect-video bg-[#2C2C2C] rounded-2xl flex items-center justify-center border-2 border-[#444444]">
                <div className="text-center">
                  <Camera className="w-24 h-24 text-[#C62828] mx-auto mb-4 opacity-70" />
                  <p className="text-gray-300 text-lg">
                    Photo booth preview mockup
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 text-white">
              What People Say
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Loved by event organizers and party hosts everywhere
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="gradient-card border-0 shadow-soft hover:shadow-hover transition-all h-full">
                  <CardContent className="p-6">
                    <Quote className="w-10 h-10 text-white mb-4 opacity-70" />
                    <p className="text-gray-100 mb-6 italic">"{testimonial.content}"</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{testimonial.name}</p>
                        <p className="text-sm text-gray-300">{testimonial.role}</p>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-[#FFD700] text-[#FFD700]" />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
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

export default Home;
