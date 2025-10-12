import { useState, useRef, useEffect } from 'react';
import { Camera, X, Image as ImageIcon } from 'lucide-react';
import { Frame, Filter } from '../types';

interface PhotoboothProps {
  onPhotoTaken: (imageData: string, frame?: string, filter?: string) => void;
}

const frames: Frame[] = [
  { id: 'none', name: 'None', image: '' },
  { id: 'hearts', name: 'Hearts', image: '💕' },
  { id: 'stars', name: 'Stars', image: '⭐' },
  { id: 'flowers', name: 'Flowers', image: '🌸' },
];

const filters: Filter[] = [
  { id: 'none', name: 'Original', cssFilter: 'none' },
  { id: 'bright', name: 'Bright', cssFilter: 'brightness(1.2) contrast(1.1)' },
  { id: 'warm', name: 'Warm', cssFilter: 'sepia(0.3) saturate(1.3)' },
  { id: 'cool', name: 'Cool', cssFilter: 'hue-rotate(180deg) saturate(1.2)' },
  { id: 'vintage', name: 'Vintage', cssFilter: 'sepia(0.5) contrast(0.9) brightness(1.1)' },
  { id: 'bw', name: 'B&W', cssFilter: 'grayscale(1) contrast(1.2)' },
];

export default function Photobooth({ onPhotoTaken }: PhotoboothProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [selectedFrame, setSelectedFrame] = useState<string>('none');
  const [selectedFilter, setSelectedFilter] = useState<string>('none');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraError('');
    } catch (error) {
      setCameraError('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.');
    }
  };

  const takePhoto = () => {
    if (countdown !== null) return;

    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(timer);
          capturePhoto();
          return null;
        }
        return prev! - 1;
      });
    }, 1000);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const filter = filters.find(f => f.id === selectedFilter);
    if (filter && filter.cssFilter !== 'none') {
      ctx.filter = filter.cssFilter;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    const imageData = canvas.toDataURL('image/png');
    onPhotoTaken(imageData, selectedFrame, selectedFilter);
  };

  const currentFilter = filters.find(f => f.id === selectedFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Photobooth
          </h1>
          <p className="text-gray-600">
            Pilih frame dan filter, lalu ambil fotomu!
          </p>
        </div>

        {cameraError && (
          <div className="bg-pink-100 border border-pink-300 text-pink-700 px-4 py-3 rounded-xl mb-6 text-center">
            {cameraError}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-2xl p-6 mb-6">
          <div className="relative aspect-video bg-gray-900 rounded-2xl overflow-hidden mb-6">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{
                filter: currentFilter?.cssFilter !== 'none' ? currentFilter?.cssFilter : undefined,
                transform: 'scaleX(-1)'
              }}
            />

            {selectedFrame !== 'none' && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="text-8xl opacity-80">
                  {frames.find(f => f.id === selectedFrame)?.image}
                </div>
              </div>
            )}

            {countdown !== null && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-9xl font-bold animate-pulse">
                  {countdown}
                </div>
              </div>
            )}

            {flash && (
              <div className="absolute inset-0 bg-white animate-pulse" />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-pink-500" />
                Pilih Frame
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {frames.map(frame => (
                  <button
                    key={frame.id}
                    onClick={() => setSelectedFrame(frame.id)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      selectedFrame === frame.id
                        ? 'border-pink-500 bg-pink-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50'
                    }`}
                  >
                    <div className="text-3xl mb-1">{frame.image || '—'}</div>
                    <div className="text-xs text-gray-600">{frame.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-pink-500" />
                Pilih Filter
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {filters.map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      selectedFilter === filter.id
                        ? 'border-pink-500 bg-pink-50 shadow-lg scale-105'
                        : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-700">{filter.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={takePhoto}
            disabled={countdown !== null || !stream}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Camera className="w-6 h-6" />
            <span>Ambil Foto</span>
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
