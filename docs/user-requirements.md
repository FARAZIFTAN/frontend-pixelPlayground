# User Requirements — KaryaKlik (Digital Photo Booth)

Tanggal: 2026-04-30  
Sumber: implementasi frontend + deskripsi fitur di README.

## 1) Ringkasan Produk
KaryaKlik adalah aplikasi web photo booth digital untuk memilih template frame, mengambil foto (kamera) atau memakai foto yang diupload, menggabungkan foto ke dalam template (composite), lalu mengunduh dan membagikan hasil.

## 2) Ruang Lingkup
### In-scope
- Template gallery (kategori + pencarian) dan preview template.
- Photo booth: ambil beberapa foto dalam satu sesi, retake, preview, edit sederhana, hasil composite.
- Download & sharing (link publik/QR) untuk hasil composite.
- Akun pengguna: autentikasi, profil, keamanan akun.
- Fitur Pro: AI template creator, custom frame submission, My Gallery (koleksi hasil), dan fitur terkait.
- Admin panel: template management, approvals frame user, payment management, analytics/feedback/user management (tingkat kebutuhan umum).

### Out-of-scope (untuk dokumen ini)
- Detail teknis implementasi internal (struktur DB, arsitektur server, dsb.).
- Integrasi eksternal spesifik di luar kebutuhan pengguna (mis. vendor payment tertentu) kecuali perilaku yang terlihat user.

## 3) Aktor / Tipe Pengguna
- **Guest (tanpa login)**: pengguna yang hanya melihat gallery & mencoba fitur dasar (sesuai kebijakan akses aplikasi).
- **User (login, non‑Pro)**: pengguna terdaftar.
- **User Pro**: pengguna dengan status premium/pro aktif (mendapat fitur tambahan).
- **Admin**: mengelola template, user-generated frame, pembayaran, dan monitoring.

## 4) Asumsi & Ketentuan
- Aplikasi berjalan di browser modern (Chrome/Edge/Safari/Firefox versi terbaru).
- Untuk fitur kamera, user harus memberikan izin akses kamera.
- Beberapa fitur dibatasi untuk **Pro** (mis. AI Template Creator, submit custom frame, My Gallery).
- Session login disimpan berbasis token (JWT) dan disimpan di session storage.

## 5) Kebutuhan Fungsional (Functional Requirements)
Format: **FR-xx** (System shall …)

### 5.1 Template Gallery & Pencarian
- **FR-01**: Sistem harus menampilkan daftar template publik dalam bentuk gallery.
- **FR-02**: Sistem harus menyediakan filter kategori template (mis. Education, Wedding, Birthday, Corporate, Baby, Holiday, Love, Artistic, General).
- **FR-03**: Sistem harus menyediakan pencarian template berdasarkan nama (search query).
- **FR-04**: Sistem harus dapat menampilkan template premium sebagai *locked* untuk user non‑Pro.
- **FR-05**: Sistem harus menampilkan preview template (thumbnail/frame) sebelum user memulai sesi.

### 5.2 Photo Booth (Capture & Composite)
- **FR-06**: Sistem harus dapat memulai sesi photo booth berdasarkan template yang dipilih.
- **FR-07**: Sistem harus meminta izin kamera dan menampilkan real‑time preview.
- **FR-08**: Sistem harus mendukung pengambilan multi‑foto dalam satu sesi (contoh: 2/3/4 foto sesuai template/opsi).
- **FR-09**: Sistem harus menyediakan countdown sebelum pengambilan foto.
- **FR-10**: Sistem harus menyediakan opsi *retake* (ulang ambil foto) sebelum finalisasi.
- **FR-11**: Sistem harus menggabungkan foto yang diambil ke layout template (composite image).
- **FR-12**: Sistem harus menampilkan hasil akhir composite untuk dicek sebelum download/share/simpan.

### 5.3 Edit Foto Dasar
- **FR-13**: Sistem harus menyediakan preset filter dasar (mis. none, grayscale, sepia, vintage, bright, warm).
- **FR-14**: Sistem harus menyediakan pengaturan intensitas filter/penyesuaian visual (mis. brightness/contrast/saturate, dst.).
- **FR-15**: Sistem harus menyediakan sticker/emoji yang bisa ditempatkan pada hasil (minimal: kategori emoji/hearts/stars/objects).
- **FR-16**: Sistem harus menyediakan zoom preview saat editing.

### 5.4 Download & Share
- **FR-17**: Sistem harus memungkinkan user mengunduh hasil composite (format menyesuaikan output).
- **FR-18**: Sistem harus dapat membuat halaman share publik untuk suatu composite.
- **FR-19**: Sistem harus menyediakan tombol share yang:
  - memakai Web Share API bila tersedia, atau
  - menyalin link ke clipboard bila tidak tersedia.
- **FR-20**: Sistem harus menampilkan metrik pada halaman share minimal: views dan likes.

### 5.5 Sesi Foto (History)
- **FR-21**: Sistem harus menyimpan dan menampilkan daftar sesi foto milik user.
- **FR-22**: Sistem harus menyediakan filter sesi berdasarkan status (all/active/completed).
- **FR-23**: Sistem harus memungkinkan user melanjutkan sesi aktif.
- **FR-24**: Sistem harus memungkinkan user menghapus sesi.

### 5.6 Autentikasi & Akun
- **FR-25**: Sistem harus menyediakan registrasi user (nama, email, password).
- **FR-26**: Sistem harus menyediakan login user dan menyimpan token sesi.
- **FR-27**: Sistem harus menyediakan verifikasi token (cek sesi masih valid).
- **FR-28**: Sistem harus menyediakan fitur lupa password dan reset password.
- **FR-29**: Sistem harus menyediakan fitur ganti password.
- **FR-30**: Sistem harus menyediakan halaman “My Account” untuk:
  - update profil (nama/email/phone),
  - upload avatar, dan
  - hapus avatar.
- **FR-31**: Sistem harus menyediakan opsi **deactivate account** dan **delete account** (butuh konfirmasi password).

### 5.7 Fitur Pro (Premium)
- **FR-32**: Sistem harus menyediakan halaman upgrade Pro dan menampilkan benefit Pro.
- **FR-33**: Sistem harus memungkinkan user membuat permintaan pembayaran upgrade Pro.
- **FR-34**: Sistem harus memungkinkan user mengupload bukti pembayaran dan melihat status pembayaran.
- **FR-35**: Sistem harus membatasi akses fitur Pro untuk user non‑Pro dan mengarahkan ke halaman upgrade.

### 5.8 AI Template Creator (Pro)
- **FR-36**: Sistem harus menyediakan halaman AI Template Creator untuk membuat desain frame dari prompt/deskripsi.
- **FR-37**: Sistem harus membuat spesifikasi frame (JSON) dari deskripsi user, lalu menghasilkan gambar frame (mis. SVG/PNG).
- **FR-38**: Sistem harus menyimpan hasil frame AI milik user dalam “My AI Frames”.
- **FR-39**: Sistem harus memungkinkan user menghapus dan mengunduh frame AI miliknya.
- **FR-40**: Sistem harus memungkinkan user memakai frame AI untuk memulai sesi booth.

### 5.9 Custom Frame Submission (Pro) + Approval (Admin)
- **FR-41**: Sistem harus memungkinkan user Pro membuat & mengirim custom frame submission untuk direview admin.
- **FR-42**: Sistem harus memungkinkan admin melihat daftar submission berstatus pending.
- **FR-43**: Sistem harus memungkinkan admin approve atau reject submission.
- **FR-44**: Sistem harus mewajibkan alasan penolakan saat admin melakukan reject.

### 5.10 Admin Template Management
- **FR-45**: Sistem harus menyediakan admin dashboard untuk mengelola template (list/grid, search, filter kategori).
- **FR-46**: Sistem harus memungkinkan admin mengedit metadata template (name, category, premium flag, active flag).
- **FR-47**: Sistem harus memungkinkan admin menonaktifkan (deactivate) template.

### 5.11 Admin Payment/User/Monitoring (tingkat kebutuhan umum)
- **FR-48**: Sistem harus menyediakan halaman admin untuk memonitor pembayaran upgrade Pro dan memverifikasi bukti pembayaran.
- **FR-49**: Sistem harus menyediakan halaman admin untuk monitoring user (minimal melihat daftar dan status dasar).
- **FR-50**: Sistem harus menyediakan analytics dasar penggunaan (minimal: template usage/composite activity).
- **FR-51**: Sistem harus menyediakan kanal feedback/report (minimal: melihat daftar feedback di admin).

## 6) User Stories + Acceptance Criteria (untuk Trello)
Format: **US-xx** (Sebagai … saya ingin … supaya …)

### Guest / User umum
- **US-01**: Sebagai pengguna, saya ingin melihat gallery template agar bisa memilih frame yang cocok.
  - AC: daftar template tampil; bisa search; bisa filter kategori.
- **US-02**: Sebagai pengguna, saya ingin preview template sebelum mulai sesi.
  - AC: klik template membuka preview; ada tombol lanjut ke booth.
- **US-03**: Sebagai pengguna, saya ingin mengambil foto dari kamera dengan countdown agar hasilnya siap dan rapi.
  - AC: browser meminta izin kamera; countdown terlihat; foto tersimpan per-step.
- **US-04**: Sebagai pengguna, saya ingin mengulang (retake) foto tertentu sebelum finalisasi.
  - AC: user bisa pilih foto yang diulang; hasil composite menggunakan foto terbaru.
- **US-05**: Sebagai pengguna, saya ingin menambah filter & sticker agar hasil lebih menarik.
  - AC: preset filter tersedia; sticker bisa ditempatkan; preview update.
- **US-06**: Sebagai pengguna, saya ingin mengunduh hasil composite agar bisa disimpan/print.
  - AC: tombol download menghasilkan file terunduh.
- **US-07**: Sebagai pengguna, saya ingin membagikan hasil via link agar teman bisa melihat.
  - AC: sistem membuat halaman share publik; tombol share/copy link berfungsi.

### User Pro
- **US-08**: Sebagai user Pro, saya ingin melihat “My Gallery” agar bisa mengelola hasil composite saya.
  - AC: list composites tampil; ada search/sort/filter (public/private); bisa download & delete.
- **US-09**: Sebagai user Pro, saya ingin membuat frame dengan AI agar bisa punya template unik.
  - AC: submit prompt menghasilkan spesifikasi frame + gambar; tersimpan di My AI Frames.
- **US-10**: Sebagai user Pro, saya ingin memakai AI frame untuk booth agar bisa foto memakai frame buatan saya.
  - AC: dari My AI Frames, tombol “Use” mengarah ke flow input method/booth.
- **US-11**: Sebagai user Pro, saya ingin submit custom frame agar bisa dipublikasi setelah disetujui admin.
  - AC: form submission menyimpan name/category/frameCount/layoutPositions; status pending.

### Admin
- **US-12**: Sebagai admin, saya ingin mengelola template agar gallery selalu up-to-date.
  - AC: admin bisa edit name/category/premium/active; deactivate template.
- **US-13**: Sebagai admin, saya ingin approve/reject frame submission agar template publik terkurasi.
  - AC: approve menghapus dari daftar pending; reject wajib alasan.
- **US-14**: Sebagai admin, saya ingin memverifikasi pembayaran Pro agar akses premium diberikan tepat.
  - AC: admin bisa melihat status; mengubah status sesuai verifikasi.

## 7) Kebutuhan Non‑Fungsional (Non‑Functional Requirements)
- **NFR-01 (Usability)**: UI harus responsif dan usable di mobile & desktop.
- **NFR-02 (Performance)**: Gallery harus tetap terasa cepat meski template banyak (dukungan pagination/infinite scroll).
- **NFR-03 (Reliability)**: Sistem harus menampilkan pesan error yang jelas jika backend tidak berjalan / request gagal.
- **NFR-04 (Security)**: Password harus tersimpan aman (hashing) dan akses endpoint terlindungi token.
- **NFR-05 (Privacy)**: Foto user hanya dapat diakses sesuai aturan visibility (private/public share).
- **NFR-06 (Compatibility)**: Fitur share mengikuti kemampuan browser (Web Share API fallback copy link).

## 8) Catatan untuk Pemetaan ke Trello
Agar cepat dijadikan card, biasanya:
- Satu **US** = satu card.
- Checklist dalam card = Acceptance Criteria (AC).
- Label card = Frontend/Backend/UI-UX/Docs/Testing + Pro/Admin.
