<div align="center">

# 📸 KaryaKlik - Digital Photo Booth

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**A modern web-based digital photo booth for capturing and creating stunning memories with beautiful templates**

[Live Demo](#) • [Features](#-features) • [Getting Started](#-getting-started) • [Documentation](#-project-structure)

</div>

---

## 🎯 About KaryaKlik

**KaryaKlik** adalah aplikasi web photo booth digital yang memungkinkan Anda untuk membuat foto-foto menakjubkan dengan template profesional langsung dari browser. Sempurna untuk event, pesta, atau sekadar bersenang-senang dengan teman!

### ✨ Why KaryaKlik?

- 🎨 **Beautiful Templates** - Puluhan template profesional untuk berbagai acara
- 📸 **Instant Capture** - Ambil foto langsung dari kamera perangkat Anda
- 🎭 **Multiple Layouts** - Mendukung layout 2, 3, atau 4 foto dalam satu strip
- 🔗 **Easy Sharing** - Bagikan via QR code atau link langsung
- 💾 **High Quality** - Download foto beresolusi tinggi untuk printing
- 🚀 **No Installation** - Bekerja langsung di browser, tanpa perlu download
- 🎉 **Free to Use** - Gratis tanpa batas!

---

## 🚀 Features

### 🎭 Template Categories
- 🎓 **Education** - Wisuda, kelulusan, dan acara pendidikan
- 💑 **Wedding & Love** - Pernikahan, anniversary, Valentine
- 🎂 **Birthday & Party** - Ulang tahun dan perayaan
- 🎨 **Artistic** - Design kreatif dan artistik
- 🏢 **Corporate** - Event kantor dan profesional
- 👶 **Baby & Family** - Baby shower dan acara keluarga
- 🎄 **Holiday** - Natal, Tahun Baru, dan hari libur

### 📱 User Features
- ✅ Browse template gallery dengan filter kategori
- ✅ Real-time camera preview sebelum capture
- ✅ Multiple photo capture dalam satu sesi
- ✅ Preview hasil akhir dengan template
- ✅ Download foto dalam resolusi tinggi
- ✅ Share via QR code atau direct link
- ✅ Responsive design untuk semua perangkat

### 🔐 Admin Features
- ✅ Template management system
- ✅ User authentication (Login/Register)
- ✅ Admin dashboard untuk monitoring
- ✅ Upload dan manage custom templates

---

## 🛠️ Tech Stack

### Frontend Framework
- **React 18.3.1** - UI library
- **TypeScript 5.8.3** - Type safety
- **Vite 5.4.19** - Build tool & dev server

### UI & Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS
- **shadcn/ui** - Beautiful component library
- **Radix UI** - Accessible component primitives
- **Framer Motion 12.23.24** - Smooth animations
- **Lucide React** - Icon library

### State Management & Routing
- **React Router DOM 6.30.1** - Client-side routing
- **TanStack Query 5.83.0** - Server state management
- **React Hook Form 7.61.1** - Form handling
- **Zod 3.25.76** - Schema validation

### Additional Tools
- **date-fns** - Date utilities
- **React Hot Toast** - Toast notifications
- **Recharts** - Data visualization
- **ESLint** - Code linting

---

## 📦 Getting Started

### Prerequisites
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** or **bun** - Package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/FARAZIFTAN/frontend-pixelPlayground.git
cd frontend-pixelPlayground
```

2. **Install dependencies**
```bash
npm install
# or using bun
bun install
```

3. **Start development server**
```bash
npm run dev
# or using bun
bun run dev
```

4. **Open your browser**
```
http://localhost:5173
```

### Build for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📁 Project Structure

```
frontend-pixelPlayground/
├── public/                      # Static assets
│   ├── assets/
│   │   └── templates/          # Template images
│   │       ├── graduation/     # Graduation templates
│   │       └── morris/         # Artistic templates
│   └── robots.txt
│
├── src/
│   ├── components/             # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── Navbar.tsx         # Navigation bar
│   │   └── Footer.tsx         # Footer component
│   │
│   ├── pages/                 # Page components
│   │   ├── Home.tsx           # Landing page
│   │   ├── Booth.tsx          # Photo booth interface
│   │   ├── Gallery.tsx        # Template gallery
│   │   ├── Contact.tsx        # Contact page
│   │   ├── Login.tsx          # Login page
│   │   ├── Register.tsx       # Register page
│   │   ├── Home-admin.tsx     # Admin dashboard
│   │   └── NotFound.tsx       # 404 page
│   │
│   ├── data/                  # Static data
│   │   ├── templates.ts       # Template definitions
│   │   └── README-TEMPLATES.md
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   │
│   ├── lib/                   # Utility functions
│   │   └── utils.ts
│   │
│   ├── App.tsx               # Main app component
│   ├── main.tsx              # App entry point
│   └── index.css             # Global styles
│
├── package.json              # Dependencies
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

---

## 🎨 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run build:dev` | Build for development mode |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

---

## 🌐 Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing page with features overview |
| `/booth` | Booth | Main photo booth interface |
| `/gallery` | Gallery | Browse all available templates |
| `/contact` | Contact | Contact form and information |
| `/login` | Login | User authentication |
| `/register` | Register | New user registration |
| `/admin` | Admin Dashboard | Admin panel (protected route) |

---

## 🎯 How to Use

### For Users

1. **Visit Homepage** - Explore features and view examples
2. **Browse Templates** - Go to Gallery to see all available templates
3. **Choose Template** - Select your favorite template
4. **Take Photos** - Use the Booth to capture 2-4 photos
5. **Preview & Download** - See the result and download or share

### For Admins

1. **Login** - Access admin dashboard via `/login`
2. **Manage Templates** - Add, edit, or remove templates
3. **Monitor Usage** - View statistics and user activity
4. **Upload Templates** - Add custom templates to the library

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**FARAZIFTAN**
- GitHub: [@FARAZIFTAN](https://github.com/FARAZIFTAN)
- Repository: [frontend-pixelPlayground](https://github.com/FARAZIFTAN/frontend-pixelPlayground)

---

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) - For beautiful UI components
- [Radix UI](https://www.radix-ui.com/) - For accessible primitives
- [Tailwind CSS](https://tailwindcss.com/) - For utility-first CSS
- [Lucide Icons](https://lucide.dev/) - For beautiful icons
- [Unsplash](https://unsplash.com/) - For high-quality images

---

<div align="center">

**Made with ❤️ by FARAZIFTAN**

⭐ Star this repo if you find it helpful!

</div>
