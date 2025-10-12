import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { User, Page } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Photobooth from './pages/Photobooth';
import Editor from './pages/Editor';
import Gallery from './pages/Gallery';
import Auth from './pages/Auth';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedFrame, setCapturedFrame] = useState<string | undefined>();
  const [capturedFilter, setCapturedFilter] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email! });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email! });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setCapturedImage(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('landing');
  };

  const handlePhotoTaken = (imageData: string, frame?: string, filter?: string) => {
    setCapturedImage(imageData);
    setCapturedFrame(frame);
    setCapturedFilter(filter);
    setCurrentPage('editor');
  };

  const handleSavePhoto = async (editedImage: string) => {
    try {
      if (user) {
        const { error } = await supabase.from('photos').insert({
          user_id: user.id,
          image_data: editedImage,
          frame: capturedFrame,
          filter: capturedFilter,
        });

        if (error) throw error;
        alert('Foto berhasil disimpan!');
        setCurrentPage('gallery');
      } else {
        const localPhotos = localStorage.getItem('snapnow_photos');
        const photos = localPhotos ? JSON.parse(localPhotos) : [];
        photos.unshift({
          id: Date.now().toString(),
          image_data: editedImage,
          frame: capturedFrame,
          filter: capturedFilter,
          created_at: new Date().toISOString(),
        });
        localStorage.setItem('snapnow_photos', JSON.stringify(photos));
        alert('Foto berhasil disimpan!');

        const link = document.createElement('a');
        link.href = editedImage;
        link.download = `snapnow-${Date.now()}.png`;
        link.click();
      }
    } catch (error) {
      console.error('Error saving photo:', error);
      alert('Gagal menyimpan foto');
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setCurrentPage('photobooth');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {currentPage !== 'login' && currentPage !== 'register' && (
        <Header user={user} onNavigate={handleNavigate} onLogout={handleLogout} />
      )}

      <main className="flex-grow">
        {currentPage === 'landing' && (
          <Landing onNavigate={() => setCurrentPage('photobooth')} />
        )}

        {currentPage === 'photobooth' && (
          <Photobooth onPhotoTaken={handlePhotoTaken} />
        )}

        {currentPage === 'editor' && capturedImage && (
          <Editor
            imageData={capturedImage}
            onSave={handleSavePhoto}
            onReset={handleReset}
          />
        )}

        {currentPage === 'gallery' && (
          <Gallery userId={user?.id || null} />
        )}

        {(currentPage === 'login' || currentPage === 'register') && (
          <Auth
            onAuthSuccess={() => setCurrentPage('photobooth')}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {currentPage !== 'login' && currentPage !== 'register' && <Footer />}
    </div>
  );
}

export default App;
