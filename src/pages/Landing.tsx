import { Camera, Sparkles, Share2, Edit3 } from 'lucide-react';

interface LandingProps {
  onNavigate: (page: 'photobooth') => void;
}

export default function Landing({ onNavigate }: LandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-white to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="inline-block bg-gradient-to-r from-pink-400 to-pink-600 p-4 rounded-full mb-6 shadow-xl">
            <Camera className="w-16 h-16 text-white" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
            Ambil Foto Seru<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-pink-600">
              Langsung dari Browsermu!
            </span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Photobooth online yang mudah digunakan. Ambil foto, edit dengan filter keren, dan bagikan ke teman-temanmu!
          </p>

          <button
            onClick={() => onNavigate('photobooth')}
            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            Mulai Photobooth ✨
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 duration-300">
            <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Camera className="w-8 h-8 text-pink-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Ambil Foto</h3>
            <p className="text-gray-600">
              Gunakan kamera perangkatmu langsung dari browser. Mudah dan cepat!
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 duration-300">
            <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Edit3 className="w-8 h-8 text-pink-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Edit & Percantik</h3>
            <p className="text-gray-600">
              Tambahkan frame, filter, teks, dan stiker untuk membuat fotomu lebih menarik!
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 duration-300">
            <div className="bg-pink-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Share2 className="w-8 h-8 text-pink-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Simpan & Bagikan</h3>
            <p className="text-gray-600">
              Download fotomu atau langsung bagikan ke media sosial favorit!
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-pink-500 to-pink-400 rounded-3xl p-12 text-center shadow-2xl">
          <Sparkles className="w-12 h-12 text-white mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Siap Mencoba?
          </h2>
          <p className="text-pink-100 text-lg mb-6">
            Buat momen spesialmu menjadi lebih berkesan dengan SnapNow!
          </p>
          <button
            onClick={() => onNavigate('photobooth')}
            className="px-8 py-4 bg-white text-pink-500 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Mulai Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
