import { motion } from "framer-motion";
import { 
  CreditCard, 
  Upload, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Copy,
  Shield,
  FileText,
  UserCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ProPaymentGuide = () => {
  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-[#1A1A1A] to-[#0D0D0D]">
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
            className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-2 mb-6"
          >
            <CreditCard className="w-5 h-5 text-green-400" />
            <span className="text-sm font-medium text-green-400">
              Upgrade Akun Pro
            </span>
          </motion.div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold mb-4 text-white">
            Alur Pembayaran Akun Pro
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Panduan lengkap proses upgrade ke akun Pro melalui transfer bank manual
          </p>
        </motion.div>

        {/* Alur Pembayaran - 4 Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Step 1: Pilih Paket & Lihat Rekening */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="gradient-card border-0 shadow-soft h-full">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                    <div className="text-2xl font-bold text-blue-400">1</div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Pilih Paket Pro
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Pilih paket Pro yang sesuai kebutuhan Anda
                  </p>
                  <ul className="text-xs text-gray-300 space-y-2 text-left w-full">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>Lihat detail nomor rekening tujuan</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>Salin nomor rekening (tombol copy)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>Catat nominal yang harus ditransfer</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Step 2: Transfer Bank */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="gradient-card border-0 shadow-soft h-full">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                    <div className="text-2xl font-bold text-green-400">2</div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Transfer Bank
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Lakukan transfer sesuai instruksi
                  </p>
                  <ul className="text-xs text-gray-300 space-y-2 text-left w-full">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <span><strong>Transfer nominal yang TEPAT</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Pastikan nama rekening sesuai</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Simpan bukti transfer (screenshot)</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Step 3: Upload Bukti */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="gradient-card border-0 shadow-soft h-full">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                    <div className="text-2xl font-bold text-purple-400">3</div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Upload Bukti
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Unggah screenshot bukti transfer
                  </p>
                  <ul className="text-xs text-gray-300 space-y-2 text-left w-full">
                    <li className="flex items-start gap-2">
                      <Upload className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Format: JPG, PNG (maks 5MB)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Pastikan nominal terlihat jelas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Status akun: <strong>Pending</strong></span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Step 4: Verifikasi Admin */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="gradient-card border-0 shadow-soft h-full">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
                    <div className="text-2xl font-bold text-orange-400">4</div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Verifikasi Admin
                  </h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Menunggu persetujuan admin
                  </p>
                  <ul className="text-xs text-gray-300 space-y-2 text-left w-full">
                    <li className="flex items-start gap-2">
                      <UserCheck className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                      <span>Admin akan verifikasi bukti Anda</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Disetujui → <strong>Akun Pro Aktif</strong></span>
                    </li>
                    <li className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>Ditolak → Upload ulang bukti</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Status Akun Pengguna */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-12"
        >
          <h3 className="text-2xl font-semibold text-white mb-6 text-center">
            Status Akun Pengguna
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Pending */}
            <Card className="gradient-card border border-yellow-500/30 shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-white">Pending</h4>
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                        Menunggu
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">
                      Bukti pembayaran sudah dikirim dan sedang menunggu verifikasi admin.
                    </p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• Akses akun normal tetap berjalan</li>
                      <li>• Fitur Pro belum aktif</li>
                      <li>• Waktu verifikasi: maksimal 1x24 jam</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pro Aktif */}
            <Card className="gradient-card border border-green-500/30 shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-white">Pro Aktif</h4>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Disetujui
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">
                      Pembayaran telah diverifikasi dan akun Pro Anda sudah aktif.
                    </p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• Semua fitur Pro dapat digunakan</li>
                      <li>• Masa aktif sesuai paket yang dipilih</li>
                      <li>• Notifikasi aktivasi dikirim via email</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ditolak */}
            <Card className="gradient-card border border-red-500/30 shadow-soft">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                    <XCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-lg font-semibold text-white">Ditolak</h4>
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                        Tidak Valid
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">
                      Bukti pembayaran tidak valid atau tidak sesuai ketentuan.
                    </p>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• Lihat alasan penolakan di notifikasi</li>
                      <li>• Upload ulang bukti yang benar</li>
                      <li>• Hubungi support jika ada kendala</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Instruksi Detail Transfer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mb-12"
        >
          <Card className="gradient-card border border-blue-500/30 shadow-soft">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Instruksi Transfer Bank
                  </h3>
                  
                  <div className="bg-gray-800/50 rounded-lg p-6 mb-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Bank</p>
                        <p className="text-lg font-semibold text-white">Bank BCA</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Nomor Rekening</p>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-mono font-semibold text-white">1234567890</p>
                          <button className="p-1 hover:bg-gray-700 rounded transition-colors">
                            <Copy className="w-4 h-4 text-blue-400" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Atas Nama</p>
                        <p className="text-lg font-semibold text-white">PT KaryaKlik Indonesia</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400 mb-1">Nominal Transfer</p>
                        <p className="text-lg font-semibold text-green-400">Sesuai paket yang dipilih</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-white text-sm">Ketentuan Transfer:</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>Transfer nominal <strong className="text-white">harus TEPAT</strong> sesuai paket yang dipilih (termasuk digit terakhir)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>Pastikan nama penerima <strong className="text-white">"PT KaryaKlik Indonesia"</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>Simpan bukti transfer (screenshot) dengan <strong className="text-white">nominal terlihat jelas</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span>Upload bukti dalam waktu <strong className="text-white">maksimal 24 jam</strong> setelah transfer</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Catatan Keamanan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mb-8"
        >
          <Card className="gradient-card border border-red-500/30 shadow-soft">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    Catatan Keamanan & Peringatan
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">⚠</span>
                      <span>
                        <strong className="text-white">JANGAN transfer ke rekening lain</strong> selain yang tertera di aplikasi. 
                        KaryaKlik tidak bertanggung jawab atas transfer ke rekening yang salah.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">⚠</span>
                      <span>
                        <strong className="text-white">Nominal harus TEPAT.</strong> Transfer dengan nominal yang salah 
                        (misalnya kurang atau lebih) akan menyebabkan penolakan otomatis.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">⚠</span>
                      <span>
                        <strong className="text-white">Bukti transfer harus jelas.</strong> Screenshot yang buram, terpotong, 
                        atau nominal tidak terlihat akan ditolak.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-400 font-bold">⚠</span>
                      <span>
                        Jika pembayaran ditolak lebih dari <strong className="text-white">3 kali</strong>, 
                        akun Anda akan diblokir sementara. Hubungi support untuk bantuan.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Admin Panel Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Card className="gradient-card border border-purple-500/30 shadow-soft">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Kebutuhan Admin Panel
                  </h3>
                  <p className="text-sm text-gray-400 mb-6">
                    Fitur yang diperlukan di sisi admin untuk mengelola pembayaran akun Pro:
                  </p>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* List Bukti Pembayaran */}
                    <div className="bg-gray-800/50 rounded-lg p-5">
                      <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-400" />
                        Daftar Bukti Pembayaran
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-start gap-2">
                          <span className="text-purple-400">•</span>
                          <span>List semua pembayaran dengan status <strong>Pending</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-400">•</span>
                          <span>Tampilkan: nama user, paket, nominal, tanggal upload</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-400">•</span>
                          <span>Preview bukti transfer (zoom/fullscreen)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-purple-400">•</span>
                          <span>Filter by: status, tanggal, paket</span>
                        </li>
                      </ul>
                    </div>

                    {/* Tombol Approve/Reject */}
                    <div className="bg-gray-800/50 rounded-lg p-5">
                      <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                        Aksi Verifikasi
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-start gap-2">
                          <span className="text-green-400">✓</span>
                          <span><strong>Approve:</strong> Aktifkan akun Pro + set masa berlaku</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-400">✗</span>
                          <span><strong>Reject:</strong> Tolak + wajib isi alasan penolakan</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-yellow-400">⟳</span>
                          <span><strong>Request Re-upload:</strong> Minta user upload ulang</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400">📧</span>
                          <span>Notifikasi otomatis ke user setelah approve/reject</span>
                        </li>
                      </ul>
                    </div>

                    {/* Perubahan Status Akun */}
                    <div className="bg-gray-800/50 rounded-lg p-5">
                      <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-blue-400" />
                        Perubahan Status Akun
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400">•</span>
                          <span>Update field <code className="bg-gray-900 px-1 rounded">isPremium: true</code></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400">•</span>
                          <span>Set <code className="bg-gray-900 px-1 rounded">premiumExpiresAt</code> (tanggal kadaluarsa)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400">•</span>
                          <span>Simpan log pembayaran (untuk audit trail)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400">•</span>
                          <span>Kirim email konfirmasi ke user</span>
                        </li>
                      </ul>
                    </div>

                    {/* Riwayat & Reporting */}
                    <div className="bg-gray-800/50 rounded-lg p-5">
                      <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-400" />
                        Riwayat & Reporting
                      </h4>
                      <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-start gap-2">
                          <span className="text-orange-400">•</span>
                          <span>History semua transaksi (approved/rejected)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-400">•</span>
                          <span>Statistik pembayaran per bulan/paket</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-400">•</span>
                          <span>Track waktu verifikasi (response time admin)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-400">•</span>
                          <span>Export data pembayaran (CSV/Excel)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-gray-400 mb-4">
            Jika mengalami kendala dalam proses pembayaran, hubungi tim support kami
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-2">
              📧 support@karyaklik.com
            </Badge>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-4 py-2">
              📱 WhatsApp: +62 812-3456-7890
            </Badge>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProPaymentGuide;
