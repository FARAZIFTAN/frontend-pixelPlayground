import { motion } from "framer-motion";
import {
  UserPlus,
  Camera,
  Share2,
  Sparkles,
  Wand2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const HowToGuide = () => {
  // Simplified to 4 most essential steps for better UX
  const essentialSteps = [
    {
      step: "1",
      title: "Login & Pilih Template",
      description: "Login ke akun Anda, lalu pilih template frame dari kategori yang tersedia",
      icon: UserPlus,
      tips: "Gunakan filter kategori untuk menemukan template yang sesuai dengan acara Anda",
      color: "#FF6B6B"
    },
    {
      step: "2",
      title: "Ambil Foto",
      description: "Pilih 'Use Camera' atau 'Upload Photos', lalu ambil 2-4 foto sesuai template",
      icon: Camera,
      tips: "Ada countdown 3 detik per foto. Bisa retake tanpa ulang semua",
      color: "#4ECDC4"
    },
    {
      step: "3",
      title: "Edit & Customize",
      description: "Tambahkan sticker, filter, atau efek visual untuk mempercantik hasil foto Anda",
      icon: Wand2,
      tips: "Edit panel punya berbagai filter preset: Grayscale, Sepia, Vintage, dll",
      color: "#FFE66D"
    },
    {
      step: "4",
      title: "Save & Share",
      description: "Klik 'Save to Gallery' lalu download atau share via link/QR code",
      icon: Share2,
      tips: "Foto tersimpan otomatis di 'My Gallery' untuk diakses kapan saja",
      color: "#FF8B94"
    },
  ];

  // Common Mistakes & Tips
  const commonMistakes = [
    {
      mistake: "Lupa login sebelum mulai",
      solution: "Login dulu sebelum photo booth - tanpa login foto tidak bisa disimpan ke galeri",
      icon: AlertCircle
    },
    {
      mistake: "Foto buram atau gelap",
      solution: "Pastikan ruangan terang dan tunggu countdown sebelum bergerak",
      icon: AlertCircle
    },
    {
      mistake: "Wajah terpotong di frame",
      solution: "Perhatikan preview kamera dan posisikan wajah di tengah sebelum countdown habis",
      icon: AlertCircle
    },
    {
      mistake: "Lupa save hasil foto",
      solution: "Klik 'Save to Gallery' setelah selesai edit - foto belum tersimpan sebelum tombol ini diklik",
      icon: AlertCircle
    },
    {
      mistake: "Browser tidak bisa akses kamera",
      solution: "Klik 'Allow' saat browser minta izin kamera, gunakan Chrome/Firefox untuk compatibility terbaik",
      icon: AlertCircle
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-32 bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: "spring" }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">
              Panduan Lengkap
            </span>
          </motion.div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-3 sm:mb-4 text-white">
            Cara Menggunakan KaryaKlik
          </h2>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto px-4">
            Ikuti langkah mudah ini untuk membuat foto menakjubkan dengan template profesional
          </p>
        </motion.div>



        {/* Steps Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
          {essentialSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="gradient-card border-0 shadow-soft hover:shadow-hover transition-all h-full group cursor-pointer overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg"
                      style={{ backgroundColor: step.color }}
                    >
                      {step.step}
                    </div>
                    <div
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${step.color}20` }}
                    >
                      <step.icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: step.color }} />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="font-heading font-semibold text-lg sm:text-xl mb-2 text-white">
                    {step.title}
                  </h3>
                  <p className="text-gray-300 mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed">
                    {step.description}
                  </p>

                  {/* Tips Badge */}
                  <div className="mt-auto pt-3 sm:pt-4 border-t border-gray-700/50">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                      </div>
                      <p className="text-xs text-yellow-200/80 italic">
                        💡 {step.tips}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Expected Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-16"
        >
          <Card className="gradient-card border-0 shadow-soft">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                </div>
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-white">
                  Hasil yang Akan Anda Dapatkan
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    Dari Photo Booth:
                  </h4>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Foto strip profesional dengan 2-4 pose dalam satu frame template</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>File JPG resolusi tinggi siap print dan share</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Link sharing dan QR code untuk bagikan ke teman/keluarga</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Tersimpan permanen di 'My Gallery' pribadi Anda</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    Waktu yang Dibutuhkan:
                  </h4>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold min-w-[80px]">~3-5 menit</span>
                      <span>untuk satu sesi photo booth lengkap (pilih template + foto + edit + save)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold min-w-[80px]">3 detik</span>
                      <span>countdown per foto (total 6-12 detik untuk 2-4 foto)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold min-w-[80px]">Instant</span>
                      <span>download hasil setelah klik 'Save to Gallery'</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Common Mistakes to Avoid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-white">
              Hindari Kesalahan Umum Ini
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {commonMistakes.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="gradient-card border-0 shadow-soft hover:shadow-hover transition-all">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex gap-4">
                      <div className="mt-1">
                        <item.icon className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1 text-sm">
                          ❌ {item.mistake}
                        </h4>
                        <p className="text-gray-300 text-sm">
                          ✅ {item.solution}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <Card className="gradient-card border-0 shadow-soft overflow-hidden">
            <CardContent className="p-6 sm:p-8 md:p-10">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold mb-3 sm:mb-4 text-white">
                Siap Mencoba Sekarang? 🎉
              </h3>
              <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6 max-w-xl mx-auto px-4">
                Mulai buat foto menakjubkan sekarang. Login dan mulai sesi photo booth Anda!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link to="/booth" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-full shadow-lg hover:shadow-xl transition-all group">
                    <Camera className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                    Mulai Photo Booth
                  </Button>
                </Link>
                <Link to="/ai-template" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 rounded-full border-2 border-primary text-primary hover:bg-primary/10 transition-all"
                  >
                    <Wand2 className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                    Buat Frame AI
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-gray-400 mt-4">
                🎉 Gratis untuk semua user • 🚀 Login dan langsung pakai • 💾 Hasil tersimpan permanen
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default HowToGuide;
