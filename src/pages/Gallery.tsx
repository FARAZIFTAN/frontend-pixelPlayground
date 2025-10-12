import { useState, useEffect } from 'react';
import { Download, Trash2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Photo } from '../types';

interface GalleryProps {
  userId: string | null;
}

export default function Gallery({ userId }: GalleryProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    loadPhotos();
  }, [userId]);

  const loadPhotos = async () => {
    try {
      setLoading(true);

      if (userId) {
        const { data, error } = await supabase
          .from('photos')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPhotos(data || []);
      } else {
        const localPhotos = localStorage.getItem('snapnow_photos');
        if (localPhotos) {
          setPhotos(JSON.parse(localPhotos));
        }
      }
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (photo: Photo) => {
    const link = document.createElement('a');
    link.href = photo.image_data;
    link.download = `snapnow-${photo.id}.png`;
    link.click();
  };

  const handleDelete = async (photo: Photo) => {
    if (!confirm('Hapus foto ini?')) return;

    try {
      if (userId) {
        const { error } = await supabase
          .from('photos')
          .delete()
          .eq('id', photo.id);

        if (error) throw error;
      } else {
        const updatedPhotos = photos.filter(p => p.id !== photo.id);
        localStorage.setItem('snapnow_photos', JSON.stringify(updatedPhotos));
        setPhotos(updatedPhotos);
      }

      setPhotos(photos.filter(p => p.id !== photo.id));
      setSelectedPhoto(null);
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Galeri Foto
          </h1>
          <p className="text-gray-600">
            {photos.length} foto tersimpan
          </p>
        </div>

        {photos.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
            <div className="bg-pink-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="w-12 h-12 text-pink-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Belum Ada Foto
            </h3>
            <p className="text-gray-600 mb-6">
              Mulai ambil foto untuk mengisi galerimu!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2 duration-300 group cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={photo.image_data}
                    alt={`Photo ${photo.id}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(photo);
                        }}
                        className="p-2 bg-white text-pink-500 rounded-full hover:bg-pink-50 transition-colors"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(photo);
                        }}
                        className="p-2 bg-white text-red-500 rounded-full hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedPhoto && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <img
                  src={selectedPhoto.image_data}
                  alt="Selected"
                  className="w-full h-auto rounded-2xl"
                />
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => handleDownload(selectedPhoto)}
                    className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold rounded-full hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => handleDelete(selectedPhoto)}
                    className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-all flex items-center justify-center space-x-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
