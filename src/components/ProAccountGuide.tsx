import { motion } from "framer-motion";
import { Sparkles, Zap, Upload, Shield, AlertCircle, CheckCircle2, MessageSquare, Eye, Save, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ProAccountGuide = () => {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-[#0D0D0D] to-[#1A1A1A]">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
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
            className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6"
          >
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            <span className="text-sm font-medium text-purple-400">
              Fitur AI
            </span>
          </motion.div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 text-white">
            AI Template Creator
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Buat template foto unik dengan bantuan AI - Gratis untuk semua pengguna KaryaKlik!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Chat dengan AI */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="gradient-card border-0 shadow-soft h-full">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-white mb-1">
                      1. Chat dengan AI
                    </h3>
                    <p className="text-sm text-gray-400">
                      Deskripsikan desain yang Anda inginkan
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Jelaskan desain dengan bahasa sehari-hari</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Tentukan jumlah foto, layout, warna, dan tema</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>AI akan memahami dan membuat spesifikasi teknis</span>
                      </li>
                    </ul>
                  </div>

                  <div className="text-xs text-gray-500 italic border-l-2 border-purple-700 pl-3">
                    <strong>Contoh:</strong> "Buat frame 4 foto dengan tema wisuda, background biru, ada hiasan topi toga di pojok"
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Generate SVG */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="gradient-card border-0 shadow-soft h-full">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-white mb-1">
                      2. Generate SVG
                    </h3>
                    <p className="text-sm text-gray-400">
                      AI membuat desain otomatis
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Hasil format SVG berkualitas tinggi</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Bisa di-scale tanpa kehilangan kualitas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Tidak puas? Chat lagi untuk revisi</span>
                      </li>
                    </ul>
                  </div>

                  <div className="text-xs text-gray-500 italic border-l-2 border-blue-700 pl-3">
                    <strong>Tips:</strong> Semakin spesifik permintaan Anda, semakin akurat hasil yang dihasilkan AI
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preview & Test */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="gradient-card border-0 shadow-soft h-full">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Eye className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-white mb-1">
                      3. Preview & Test
                    </h3>
                    <p className="text-sm text-gray-400">
                      Lihat hasil sebelum disimpan
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Preview tampilan frame langsung di aplikasi</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Cek posisi foto sudah sesuai atau belum</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Test layout dengan sample foto</span>
                      </li>
                    </ul>
                  </div>

                  <div className="text-xs text-gray-500 italic border-l-2 border-green-700 pl-3">
                    <strong>Revisi Mudah:</strong> Kembali ke chat AI jika ada yang perlu diubah
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Save & Gunakan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="gradient-card border-0 shadow-soft h-full">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <Save className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-white mb-1">
                      4. Save & Gunakan
                    </h3>
                    <p className="text-sm text-gray-400">
                      Simpan dan pakai di Photo Booth
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-start gap-2">
                        <Save className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                        <span>Frame tersimpan otomatis di akun Anda</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Camera className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                        <span>Langsung bisa dipakai di Photo Booth</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>Unlimited storage - simpan sebanyak yang Anda mau</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                    <p className="text-xs text-gray-300 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-white">Fitur Gratis!</strong> Semua pengguna KaryaKlik dapat menggunakan AI Template Creator tanpa biaya tambahan.
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Additional Info Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Keunggulan AI Creator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="gradient-card border-0 shadow-soft h-full">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-white">Keunggulan AI Creator</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>Tidak perlu skill desain grafis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>Hasil profesional dalam hitungan detik</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>Bisa request revisi sampai puas</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>Unlimited frame templates tersimpan</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Cara Menggunakan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="gradient-card border-0 shadow-soft h-full">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Camera className="w-5 h-5 text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-white">Cara Menggunakan Frame AI</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">1.</span>
                    <span>Akses menu "AI Template Creator" dari dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">2.</span>
                    <span>Chat dengan AI, jelaskan desain yang Anda mau</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">3.</span>
                    <span>AI generate SVG, preview hasilnya</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">4.</span>
                    <span>Save frame, lalu pakai di Photo Booth</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <Card className="gradient-card border border-green-500/30 shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">Akses Penuh untuk Semua Pengguna</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 font-bold">•</span>
                      <span><strong className="text-white">Tidak ada batasan</strong> pada jumlah frame yang bisa dibuat dengan AI</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 font-bold">•</span>
                      <span><strong className="text-white">Unlimited storage</strong> untuk semua frame yang sudah Anda buat</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 font-bold">•</span>
                      <span><strong className="text-white">Gunakan sesuka hati</strong> di Photo Booth tanpa limit penggunaan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 font-bold">•</span>
                      <span><strong className="text-white">Gratis selamanya</strong> - fitur ini tidak memerlukan upgrade akun Pro</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default ProAccountGuide;
