import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Instagram, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }
    // Here you would send the form data
    toast.success("Message sent! We'll get back to you soon. 📧");
    setFormData({ name: "", email: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-4">
            Get In Touch
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="gradient-card border-0 shadow-soft">
              <CardContent className="p-6 lg:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base font-medium">
                      Your Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className="rounded-xl border-2 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="rounded-xl border-2 focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-base font-medium">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us how we can help you..."
                      value={formData.message}
                      onChange={handleChange}
                      rows={6}
                      className="rounded-xl border-2 focus:border-primary transition-colors resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-full shadow-soft hover:shadow-hover transition-all"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* About */}
            <Card className="gradient-card border-0 shadow-soft">
              <CardContent className="p-6 lg:p-8">
                <h2 className="text-2xl font-heading font-bold mb-4">About Jepreto</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Jepreto is a web-based digital photobooth platform built in Indonesia — 
                  helping everyone create beautiful memories easily. We're passionate about 
                  making photo booth experiences accessible, fun, and memorable for everyone.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-muted-foreground text-sm">Jakarta, Indonesia</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a
                        href="mailto:hello@jepreto.com"
                        className="text-primary hover:underline text-sm"
                      >
                        hello@jepreto.com
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="gradient-card border-0 shadow-soft">
              <CardContent className="p-6 lg:p-8">
                <h2 className="text-2xl font-heading font-bold mb-6">Connect With Us</h2>
                <div className="grid grid-cols-3 gap-4">
                  <a
                    href="https://instagram.com/jepreto"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-6 rounded-2xl bg-accent hover:bg-primary hover:text-primary-foreground transition-all group shadow-soft hover:shadow-hover"
                  >
                    <Instagram className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Instagram</span>
                  </a>
                  <a
                    href="https://wa.me/1234567890"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-6 rounded-2xl bg-accent hover:bg-primary hover:text-primary-foreground transition-all group shadow-soft hover:shadow-hover"
                  >
                    <MessageCircle className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">WhatsApp</span>
                  </a>
                  <a
                    href="mailto:hello@jepreto.com"
                    className="flex flex-col items-center justify-center p-6 rounded-2xl bg-accent hover:bg-primary hover:text-primary-foreground transition-all group shadow-soft hover:shadow-hover"
                  >
                    <Mail className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Email</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
