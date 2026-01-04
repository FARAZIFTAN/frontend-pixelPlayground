import { motion } from "framer-motion";
import { 
  UserPlus, 
  Image as ImageIcon, 
  Camera, 
  Download, 
  Share2, 
  Sparkles, 
  Upload, 
  Wand2,
  CheckCircle2,
  AlertCircle,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const HowToGuide = () => {
  const [activeTab, setActiveTab] = useState<"booth" | "ai">("booth");

  // Photo Booth Standard Steps
  const boothSteps = [
    {
      step: "1",
      title: "Login ke Akun",
      description: "Login dengan akun Anda (wajib untuk menyimpan hasil foto ke galeri pribadi)",
      icon: UserPlus,
      tips: "Belum punya akun? Daftar gratis di halaman Register",
      color: "#FF6B6B"
    },
    {
      step: "2",
      title: "Klik 'Start Now' di Home",
      description: "Klik tombol 'Start Now' atau menu 'Booth' untuk memulai sesi photo booth",
      icon: Camera,
      tips: "Anda akan diarahkan ke halaman pemilihan template terlebih dahulu",
      color: "#4ECDC4"
    },
    {
      step: "3",
      title: "Pilih Template Frame",
      description: "Pilih frame template dari kategori: Birthday, Wedding, Corporate, Education, dll",
      icon: ImageIcon,
      tips: "Gunakan filter kategori untuk menemukan template yang sesuai dengan acara Anda",
      color: "#FFE66D"
    },
    {
      step: "4",
      title: "Pilih Input Method",
      description: "Pilih 'Use Camera' untuk foto real-time atau 'Upload Photos' untuk upload dari galeri",
      icon: Upload,
      tips: "Use Camera untuk photo booth langsung, Upload untuk edit foto yang sudah ada",
      color: "#95E1D3"
    },
    {
      step: "5",
      title: "Ambil 2-4 Foto",
      description: "Ambil foto sesuai jumlah slot di template (ada countdown 3 detik per foto)",
      icon: Camera,
      tips: "Pastikan wajah dalam frame dan pencahayaan cukup. Bisa retake per foto tanpa ulang semua",
      color: "#A8E6CF"
    },
    {
      step: "6",
      title: "Edit (Opsional)",
      description: "Tambahkan sticker, filter, atau efek visual sebelum menyimpan hasil akhir",
      icon: Wand2,
      tips: "Edit panel punya filter preset: Grayscale, Sepia, Vintage, dll",
      color: "#FFE66D"
    },
    {
      step: "7",
      title: "Save & Share",
      description: "Klik 'Save to Gallery' lalu download atau share via link/QR code",
      icon: Share2,
      tips: "Foto tersimpan otomatis di 'My Gallery' untuk akses kapan saja",
      color: "#FF8B94"
    },
  ];

  // AI Template Creator Steps
  const aiSteps = [
    {
      step: "1",
      title: "Login ke Akun",
      description: "Masuk dengan akun KaryaKlik (fitur AI Template tersedia untuk semua user terdaftar)",
      icon: UserPlus,
      tips: "Pastikan sudah login sebelum mengakses AI Template Creator",
      color: "#FF6B6B"
    },
    {
      step: "2",
      title: "Klik Menu 'AI Template'",
      description: "Klik menu 'AI Template' di navigation bar untuk membuka AI Template Creator",
      icon: Sparkles,
      tips: "Pastikan koneksi internet stabil untuk proses generate AI",
      color: "#4ECDC4"
    },
    {
      step: "3",
      title: "Chat dengan AI",
      description: "Deskripsikan frame yang Anda inginkan lewat chat. AI akan membantu Anda mendesain frame",
      icon: Wand2,
      tips: "Contoh: 'Buatkan frame untuk wedding dengan warna pink dan bunga rose'",
      color: "#FFE66D"
    },
    {
      step: "4",
      title: "Review Spesifikasi",
      description: "AI akan memberikan spesifikasi frame (jumlah foto, layout, warna). Konfirmasi jika sudah sesuai",
      icon: CheckCircle2,
      tips: "Anda bisa revisi deskripsi jika spesifikasi belum sesuai keinginan",
      color: "#95E1D3"
    },
    {
      step: "5",
      title: "Generate Frame SVG",
      description: "Klik 'Generate Frame' untuk membuat frame berdasarkan spesifikasi (10-30 detik)",
      icon: Sparkles,
      tips: "Jangan tutup tab saat proses generate berlangsung",
      color: "#A8E6CF"
    },
    {
      step: "6",
      title: "Preview & Test",
      description: "Preview frame yang dihasilkan AI, upload foto test untuk cek posisi dan ukuran slot",
      icon: Eye,
      tips: "Pastikan semua slot foto terlihat jelas dan tidak terpotong",
      color: "#FFE66D"
    },
    {
      step: "7",
      title: "Use in Booth",
      description: "Klik 'Use this Frame in Photo Booth' untuk langsung menggunakan frame di sesi foto",
      icon: Camera,
      tips: "Frame AI Anda otomatis tersimpan dan bisa digunakan berkali-kali",
      color: "#FF8B94"
    },
  ];

  const currentSteps = activeTab === "booth" ? boothSteps : aiSteps;

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
    <section className="py-20 lg:py-32 bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D]">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
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

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 text-white">
            Cara Menggunakan KaryaKlik
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Ikuti langkah mudah ini untuk membuat foto menakjubkan dengan template profesional
          </p>
        </motion.div>

        {/* Tab Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex rounded-full bg-[#2A2A2A] p-1.5 border border-[#3A3A3A]">
            <button
              onClick={() => setActiveTab("booth")}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeTab === "booth"
                  ? "bg-primary text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Camera className="w-4 h-4 inline-block mr-2" />
              Photo Booth
            </button>
            <button
              onClick={() => setActiveTab("ai")}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeTab === "ai"
                  ? "bg-primary text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Wand2 className="w-4 h-4 inline-block mr-2" />
              AI Template Creator
            </button>
          </div>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {currentSteps.map((step, index) => (
            <motion.div
              key={`${activeTab}-${index}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="gradient-card border-0 shadow-soft hover:shadow-hover transition-all h-full group cursor-pointer overflow-hidden">
                <CardContent className="p-6">
                  {/* Step Number Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                      style={{ backgroundColor: step.color }}
                    >
                      {step.step}
                    </div>
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${step.color}20` }}
                    >
                      <step.icon className="w-5 h-5" style={{ color: step.color }} />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="font-heading font-semibold text-xl mb-2 text-white">
                    {step.title}
                  </h3>
                  <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                    {step.description}
                  </p>

                  {/* Tips Badge */}
                  <div className="mt-auto pt-4 border-t border-gray-700/50">
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
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-white">
                  Hasil yang Akan Anda Dapatkan
                </h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    {activeTab === "booth" ? "Dari Photo Booth:" : "Dari AI Template Creator:"}
                  </h4>
                  <ul className="space-y-2 text-gray-300">
                    {activeTab === "booth" ? (
                      <>
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
                      </>
                    ) : (
                      <>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>Frame SVG custom sesuai deskripsi dan keinginan Anda</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>Desain unik yang di-generate khusus untuk Anda</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>Bisa langsung digunakan di Photo Booth setelah di-generate</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>Frame tersimpan permanen dan bisa dipakai berulang kali</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    Waktu yang Dibutuhkan:
                  </h4>
                  <ul className="space-y-2 text-gray-300">
                    {activeTab === "booth" ? (
                      <>
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
                      </>
                    ) : (
                      <>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold min-w-[80px]">1-2 menit</span>
                          <span>untuk chat dan diskusi desain dengan AI</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold min-w-[80px]">10-30 detik</span>
                          <span>untuk AI generate frame SVG</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary font-bold min-w-[80px]">Permanen</span>
                          <span>frame tersimpan dan bisa dipakai kapan saja</span>
                        </li>
                      </>
                    )}
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
                  <CardContent className="p-5">
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
            <CardContent className="p-10">
              <h3 className="text-2xl md:text-3xl font-heading font-bold mb-4 text-white">
                Siap Mencoba Sekarang? 🎉
              </h3>
              <p className="text-gray-300 mb-6 max-w-xl mx-auto">
                Mulai buat foto menakjubkan sekarang. Login dan mulai sesi photo booth Anda!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/booth">
                  <Button className="bg-primary hover:bg-primary/90 text-white text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all group">
                    <Camera className="mr-2 w-5 h-5" />
                    Mulai Photo Booth
                  </Button>
                </Link>
                <Link to="/ai-template">
                  <Button 
                    variant="outline" 
                    className="text-lg px-8 py-6 rounded-full border-2 border-primary text-primary hover:bg-primary/10 transition-all"
                  >
                    <Wand2 className="mr-2 w-5 h-5" />
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
