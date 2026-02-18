import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import Hero from './components/Hero/Hero';
import About from './components/About/About';
import Members from './components/Members/Members';
import Gallery from './components/Gallery/Gallery';
import CastleWallGallery from './components/Gallery/CastleWallGallery';
import Timeline from './components/Timeline/Timeline';
import TreasureRitual from './components/TreasureRitual/TreasureRitual';
import Contact from './components/Contact/Contact';
import Footer from './components/Footer/Footer';
import MobileMenu from './components/MobileMenu/MobileMenu';
import MemberDetail from './pages/MemberDetail';
import Legends from './pages/Legends';
import Treasure from './pages/Treasure';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import './App.css';


function HomePage() {
  useSmoothScroll();

  return (
    <div className="app">
      <MobileMenu />
      <Hero />
      <About />
      <Members />
      <Gallery />
      <Timeline />
      <CastleWallGallery />
      <TreasureRitual />
      <Contact />
      <Footer />
    </div>
  );
}

function App() {
  const playerRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if API is already loaded
    if (window.YT) {
      initializePlayer();
      return;
    }

    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Initialize player when API is ready
    window.onYouTubeIframeAPIReady = initializePlayer;
  }, []);

  const initializePlayer = () => {
    playerRef.current = new window.YT.Player('youtube-audio', {
      height: '0',
      width: '0',
      videoId: 'Ty81ibUn75E',
      playerVars: {
        autoplay: 1,
        controls: 0,
        loop: 1,
        playlist: 'Ty81ibUn75E',
        playsinline: 1,
      },
      events: {
        onReady: (event) => {
          setIsReady(true);
          event.target.setVolume(30);
          // Mute initially to allow autoplay
          event.target.mute();
          event.target.playVideo();
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING && !isReady) {
            setIsReady(true);
          }
        },
      },
    });
  };

  const toggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
        playerRef.current.setVolume(30);
      } else {
        playerRef.current.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  return (
    <Router>
      {/* Hidden YouTube player for background music */}
      <div id="youtube-audio" />

      {/* Music control button */}
      {isReady && (
        <button
          onClick={toggleMute}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 9999,
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: '2px solid #8b7355',
            background: 'rgba(26, 21, 18, 0.9)',
            color: '#d4a574',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.borderColor = '#d4a574';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.borderColor = '#8b7355';
          }}
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/member/:memberId" element={<MemberDetail />} />
        <Route path="/member/leader/:leaderId" element={<MemberDetail />} />
        <Route path="/legends" element={<Legends />} />
        <Route path="/treasure" element={<Treasure />} />
      </Routes>
    </Router>
  );
}

export default App;
