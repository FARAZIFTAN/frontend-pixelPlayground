import { useState, useRef } from 'react';
import { Save, Share2, RotateCw, Sun, Type, Sticker, Undo } from 'lucide-react';

interface EditorProps {
  imageData: string;
  onSave: (editedImage: string) => void;
  onReset: () => void;
}

const stickers = ['😊', '❤️', '⭐', '🎉', '🌸', '✨', '🎈', '🦋', '🌈', '💖', '🌺', '🎀'];

export default function Editor({ imageData, onSave, onReset }: EditorProps) {
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [text, setText] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [selectedStickers, setSelectedStickers] = useState<Array<{ emoji: string; x: number; y: number }>>([]);
  const [showTextInput, setShowTextInput] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const applyFiltersAndSave = () => {
    if (!canvasRef.current || !imageRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    ctx.restore();

    ctx.filter = 'none';

    if (text) {
      ctx.font = 'bold 48px Arial';
      ctx.fillStyle = 'white';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      const x = (textPosition.x / 100) * canvas.width;
      const y = (textPosition.y / 100) * canvas.height;
      ctx.strokeText(text, x, y);
      ctx.fillText(text, x, y);
    }

    selectedStickers.forEach(sticker => {
      ctx.font = '64px Arial';
      const x = (sticker.x / 100) * canvas.width;
      const y = (sticker.y / 100) * canvas.height;
      ctx.fillText(sticker.emoji, x, y);
    });

    const editedImage = canvas.toDataURL('image/png');
    onSave(editedImage);
  };

  const handleDownload = () => {
    applyFiltersAndSave();
  };

  const handleShare = async () => {
    applyFiltersAndSave();
  };

  const addSticker = (emoji: string) => {
    setSelectedStickers([...selectedStickers, { emoji, x: 50, y: 50 }]);
    setShowStickerPicker(false);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Editor Foto
          </h1>
          <p className="text-gray-600">
            Edit fotomu dan buat lebih menarik!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl p-6">
              <div className="relative bg-gray-900 rounded-2xl overflow-hidden">
                <img
                  ref={imageRef}
                  src={imageData}
                  alt="Preview"
                  className="w-full h-auto"
                  style={{
                    filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                    transform: `rotate(${rotation}deg)`
                  }}
                  crossOrigin="anonymous"
                />

                {text && (
                  <div
                    className="absolute text-white font-bold text-4xl"
                    style={{
                      left: `${textPosition.x}%`,
                      top: `${textPosition.y}%`,
                      transform: 'translate(-50%, -50%)',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                    }}
                  >
                    {text}
                  </div>
                )}

                {selectedStickers.map((sticker, index) => (
                  <div
                    key={index}
                    className="absolute text-6xl cursor-move"
                    style={{
                      left: `${sticker.x}%`,
                      top: `${sticker.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    {sticker.emoji}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Sun className="w-5 h-5 mr-2 text-pink-500" />
                Brightness
              </h3>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-full accent-pink-500"
              />
              <div className="text-center text-sm text-gray-600 mt-2">{brightness}%</div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Sun className="w-5 h-5 mr-2 text-pink-500" />
                Contrast
              </h3>
              <input
                type="range"
                min="50"
                max="150"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-full accent-pink-500"
              />
              <div className="text-center text-sm text-gray-600 mt-2">{contrast}%</div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <RotateCw className="w-5 h-5 mr-2 text-pink-500" />
                Rotate
              </h3>
              <button
                onClick={handleRotate}
                className="w-full py-3 bg-pink-100 text-pink-700 font-semibold rounded-xl hover:bg-pink-200 transition-colors"
              >
                Rotate 90°
              </button>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Type className="w-5 h-5 mr-2 text-pink-500" />
                Add Text
              </h3>
              {!showTextInput ? (
                <button
                  onClick={() => setShowTextInput(true)}
                  className="w-full py-3 bg-pink-100 text-pink-700 font-semibold rounded-xl hover:bg-pink-200 transition-colors"
                >
                  Add Text
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter text..."
                    className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl focus:border-pink-500 focus:outline-none"
                  />
                  <button
                    onClick={() => setShowTextInput(false)}
                    className="w-full py-2 bg-pink-500 text-white font-semibold rounded-xl hover:bg-pink-600 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Sticker className="w-5 h-5 mr-2 text-pink-500" />
                Add Sticker
              </h3>
              {!showStickerPicker ? (
                <button
                  onClick={() => setShowStickerPicker(true)}
                  className="w-full py-3 bg-pink-100 text-pink-700 font-semibold rounded-xl hover:bg-pink-200 transition-colors"
                >
                  Choose Sticker
                </button>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {stickers.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => addSticker(emoji)}
                      className="text-3xl p-2 hover:bg-pink-50 rounded-lg transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          <button
            onClick={handleDownload}
            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Simpan</span>
          </button>

          <button
            onClick={handleShare}
            className="px-8 py-4 bg-white text-pink-500 border-2 border-pink-500 text-lg font-semibold rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center space-x-2"
          >
            <Share2 className="w-5 h-5" />
            <span>Bagikan</span>
          </button>

          <button
            onClick={onReset}
            className="px-8 py-4 bg-gray-100 text-gray-700 text-lg font-semibold rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center space-x-2"
          >
            <Undo className="w-5 h-5" />
            <span>Ulangi</span>
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
