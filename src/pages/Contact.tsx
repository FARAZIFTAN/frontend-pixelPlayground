import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, Instagram, MessageCircle, Send, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";

// Form validation schema
const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name is too long"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters").max(500, "Message is too long"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      setIsSubmitting(true);

      // TODO: Replace with actual API endpoint when backend is ready
      // const response = await fetch("/api/contact", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(data),
      // });
      //
      // if (!response.ok) throw new Error("Failed to send message");

      // Simulate API call for now
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("✅ Message sent successfully! We'll get back to you within 24 hours.", {
        duration: 5000,
        icon: "📧",
      });

      reset(); // Clear form after successful submission
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("❌ Failed to send message. Please try again or email us directly at hello@karyaklik.com", {
        duration: 6000,
      });
    } finally {
      setIsSubmitting(false);
    }
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
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base font-medium">
                      Your Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      {...register("name")}
                      className={`rounded-xl border-2 focus:border-primary transition-colors ${
                        errors.name ? "border-destructive focus:border-destructive" : ""
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-medium">
                      Email Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      {...register("email")}
                      className={`rounded-xl border-2 focus:border-primary transition-colors ${
                        errors.email ? "border-destructive focus:border-destructive" : ""
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Message Field */}
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-base font-medium">
                      Message <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help you..."
                      {...register("message")}
                      rows={6}
                      className={`rounded-xl border-2 focus:border-primary transition-colors resize-none ${
                        errors.message ? "border-destructive focus:border-destructive" : ""
                      }`}
                      disabled={isSubmitting}
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-full shadow-soft hover:shadow-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
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
                <h2 className="text-2xl font-heading font-bold mb-4">About KaryaKlik</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  KaryaKlik is a web-based digital photobooth platform built in Indonesia — 
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
                        href="mailto:hello@karyaklik.com"
                        className="text-primary hover:underline text-sm"
                      >
                        hello@karyaklik.com
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
                    href="https://instagram.com/karyaklik"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-6 rounded-2xl bg-accent hover:bg-primary hover:text-primary-foreground transition-all group shadow-soft hover:shadow-hover"
                  >
                    <Instagram className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">Instagram</span>
                  </a>
                  <a
                    href="https://wa.me/6281234567890"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-6 rounded-2xl bg-accent hover:bg-primary hover:text-primary-foreground transition-all group shadow-soft hover:shadow-hover"
                  >
                    <MessageCircle className="w-8 h-8 mb-2" />
                    <span className="text-sm font-medium">WhatsApp</span>
                  </a>
                  <a
                    href="mailto:hello@karyaklik.com"
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
