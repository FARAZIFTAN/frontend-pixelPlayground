# Trello Board Cards — KaryaKlik

Dokumen ini berisi draft card yang bisa kamu copy-paste ke Trello.  
Sumber: [docs/user-requirements.md](user-requirements.md) (US-01 s/d US-14).

## Label yang disarankan
- Frontend
- Backend
- UI/UX
- Testing
- Docs
- Pro
- Admin

## List: Info Proyek

### Card: Deskripsi Proyek KaryaKlik
**Deskripsi**
- Ringkas tujuan aplikasi (digital photo booth web)
- Target user (event/personal)
- Fitur inti: Gallery Template → Booth → Composite → Download/Share

**Checklist**
- [ ] Tambahkan link repo (frontend & backend)
- [ ] Tambahkan link demo/screenshot (kalau ada)
- [ ] Tambahkan anggota kelompok + role

**Label**: Docs

### Card: Aturan Kerja Tim
**Checklist**
- [ ] Kanal komunikasi (WA/Discord)
- [ ] Jadwal sync
- [ ] Pembagian tugas (PIC)
- [ ] Definition of Done (DoD) sederhana

**Label**: Docs

### Card: Definition of Done (DoD)
**Checklist**
- [ ] Feature jalan sesuai AC
- [ ] Error state ada (toast/pesan)
- [ ] Minimal 1 test manual scenario dicatat
- [ ] PR/Review internal (jika ada)

**Label**: Docs, Testing

## List: Backlog (User Stories)

### Card: US-01 — Gallery template (list + filter + search)
**User Story**
Sebagai pengguna, saya ingin melihat gallery template agar bisa memilih frame yang cocok.

**Acceptance Criteria**
- [ ] Daftar template tampil di halaman Gallery
- [ ] Bisa filter kategori
- [ ] Bisa search template berdasarkan nama

**Label**: Frontend, Backend

### Card: US-02 — Preview template sebelum mulai
**User Story**
Sebagai pengguna, saya ingin preview template sebelum mulai sesi.

**Acceptance Criteria**
- [ ] Klik template membuka preview
- [ ] Ada tombol untuk lanjut ke Booth / input-method
- [ ] Untuk template premium: tampilkan status terkunci untuk non‑Pro

**Label**: Frontend

### Card: US-03 — Booth capture multi-foto + countdown
**User Story**
Sebagai pengguna, saya ingin mengambil foto dari kamera dengan countdown.

**Acceptance Criteria**
- [ ] Browser meminta izin kamera
- [ ] Ada real-time preview kamera
- [ ] Ada countdown sebelum capture
- [ ] Mendukung multi‑foto dalam satu sesi (2/3/4 sesuai flow)

**Label**: Frontend

### Card: US-04 — Retake foto sebelum finalisasi
**User Story**
Sebagai pengguna, saya ingin retake foto tertentu sebelum finalisasi.

**Acceptance Criteria**
- [ ] User bisa memilih foto tertentu untuk retake
- [ ] Composite final menggunakan foto terbaru

**Label**: Frontend

### Card: US-05 — Edit hasil (filter + sticker)
**User Story**
Sebagai pengguna, saya ingin menambah filter & sticker agar hasil lebih menarik.

**Acceptance Criteria**
- [ ] Preset filter tersedia (contoh: grayscale/sepia/vintage)
- [ ] Ada pengaturan intensitas/penyesuaian visual dasar
- [ ] Sticker/emoji bisa ditambah & dipindah posisinya

**Label**: Frontend, UI/UX

### Card: US-06 — Download composite
**User Story**
Sebagai pengguna, saya ingin mengunduh hasil composite.

**Acceptance Criteria**
- [ ] Tombol download menghasilkan file terunduh
- [ ] Nama file jelas (mengandung id / timestamp)

**Label**: Frontend, Backend

### Card: US-07 — Share via link (public share page)
**User Story**
Sebagai pengguna, saya ingin membagikan hasil via link.

**Acceptance Criteria**
- [ ] Sistem membuat halaman share publik
- [ ] Tombol share menggunakan Web Share API bila ada
- [ ] Fallback: copy link ke clipboard
- [ ] Halaman share menampilkan views & likes

**Label**: Frontend, Backend

### Card: US-08 — Pro: My Gallery (kelola hasil)
**User Story**
Sebagai user Pro, saya ingin melihat My Gallery untuk mengelola hasil composite.

**Acceptance Criteria**
- [ ] Hanya user Pro yang bisa akses (non‑Pro diarahkan ke Upgrade)
- [ ] List composites tampil
- [ ] Ada sort/filter sederhana (public/private, newest/oldest)
- [ ] Bisa download dan delete composite

**Label**: Frontend, Backend, Pro

### Card: US-09 — Pro: AI Template Creator (generate frame)
**User Story**
Sebagai user Pro, saya ingin membuat frame dengan AI.

**Acceptance Criteria**
- [ ] Hanya user Pro yang bisa akses
- [ ] User input deskripsi/prompt
- [ ] Sistem menghasilkan spesifikasi frame + gambar frame
- [ ] Hasil tersimpan ke My AI Frames

**Label**: Frontend, Backend, Pro

### Card: US-10 — Pro: Pakai AI frame untuk Booth
**User Story**
Sebagai user Pro, saya ingin memakai AI frame untuk Booth.

**Acceptance Criteria**
- [ ] Dari My AI Frames, tombol Use mengarahkan ke flow input-method/booth
- [ ] Template ter-load dengan benar

**Label**: Frontend, Pro

### Card: US-11 — Pro: Submit custom frame untuk approval
**User Story**
Sebagai user Pro, saya ingin submit custom frame agar bisa dipublikasi setelah disetujui admin.

**Acceptance Criteria**
- [ ] Hanya user Pro yang bisa akses
- [ ] User isi name/category/frameCount + layout positions
- [ ] Submit menghasilkan status pending

**Label**: Frontend, Backend, Pro

### Card: US-12 — Admin: kelola template
**User Story**
Sebagai admin, saya ingin mengelola template agar gallery up-to-date.

**Acceptance Criteria**
- [ ] Admin bisa melihat daftar template (grid/list)
- [ ] Admin bisa edit name/category/premium/active
- [ ] Admin bisa deactivate template

**Label**: Frontend, Backend, Admin

### Card: US-13 — Admin: approve/reject frame submission
**User Story**
Sebagai admin, saya ingin approve/reject submission frame.

**Acceptance Criteria**
- [ ] Admin melihat daftar submission pending
- [ ] Admin bisa approve
- [ ] Admin bisa reject dengan alasan (wajib)

**Label**: Frontend, Backend, Admin

### Card: US-14 — Admin: verifikasi pembayaran Pro
**User Story**
Sebagai admin, saya ingin memverifikasi pembayaran Pro.

**Acceptance Criteria**
- [ ] Admin melihat daftar pembayaran + status
- [ ] Admin bisa approve/reject verification
- [ ] Jika approved, user menjadi Pro

**Label**: Frontend, Backend, Admin

## List: Testing (Manual)

### Card: Smoke test — Guest flow
**Checklist**
- [ ] Buka Gallery → filter + search
- [ ] Preview template
- [ ] Start booth (izin kamera)
- [ ] Capture + retake
- [ ] Download

**Label**: Testing

### Card: Smoke test — Share flow
**Checklist**
- [ ] Buat share link
- [ ] Buka share page (incognito)
- [ ] Download dari share page
- [ ] Share/copy link

**Label**: Testing

### Card: Smoke test — Pro & Admin flow
**Checklist**
- [ ] UpgradePro: create payment + upload proof
- [ ] Non‑Pro diarahkan saat akses fitur Pro
- [ ] Admin approvals (approve/reject)

**Label**: Testing
