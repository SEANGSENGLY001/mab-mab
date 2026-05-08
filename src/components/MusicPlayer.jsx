import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';

export default function MusicPlayer() {
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef(null);
  const hasInteractedRef = useRef(false);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'music'), limit(50)), (snap) => {
      const songs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      if (songs.length > 0) {
        setPlaylist(songs);
      }
    });
    return () => unsub();
  }, []);

  const handleUserInteraction = () => {
    if (!hasInteractedRef.current) {
      hasInteractedRef.current = true;
      if (playlist.length > 0) {
        setIsPlaying(true);
      }
    }
  };

  useEffect(() => {
    if (!audioRef.current) return;
    if (playlist.length === 0) return;

    const currentSong = playlist[currentIndex];
    if (!currentSong?.fileUrl) return;

    audioRef.current.src = currentSong.fileUrl;
    audioRef.current.volume = volume;

    if (isPlaying) {
      audioRef.current.play().catch(() => {
        // Autoplay blocked - wait for user interaction
      });
    } else {
      audioRef.current.pause();
    }
  }, [currentIndex, isPlaying, playlist, volume]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = () => {
    handleUserInteraction();
    setIsPlaying(!isPlaying);
  };

  const nextSong = () => {
    handleUserInteraction();
    setCurrentIndex((prev) => (prev + 1) % playlist.length);
  };

  const prevSong = () => {
    handleUserInteraction();
    setCurrentIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  const handleEnded = () => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsPlaying(false);
    }
  };

  if (playlist.length === 0) return null;

  const currentSong = playlist[currentIndex];

  return (
    <>
      <audio
        ref={audioRef}
        onEnded={handleEnded}
        onError={() => console.warn('Audio load error')}
      />

      <motion.button
        className="music-toggle-btn"
        onClick={() => setIsVisible(!isVisible)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <span className="icon">music_note</span>
      </motion.button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="music-player"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            onClick={handleUserInteraction}
          >
            <p className="music-title" title={currentSong?.title}>
              {currentSong?.title || 'No title'}
            </p>

            <div className="music-controls">
              <motion.button
                className="music-btn"
                onClick={prevSong}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="icon">skip_previous</span>
              </motion.button>

              <motion.button
                className="music-btn play-btn"
                onClick={togglePlay}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="icon">{isPlaying ? 'pause' : 'play_arrow'}</span>
              </motion.button>

              <motion.button
                className="music-btn"
                onClick={nextSong}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="icon">skip_next</span>
              </motion.button>
            </div>

            <div className="music-volume">
              <span className="icon icon--sm">volume_up</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="volume-slider"
              />
            </div>

            {isPlaying && (
              <div className="music-equalizer">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    className="eq-bar"
                    animate={{ height: [10, 30, 15, 35, 20] }}
                    transition={{ repeat: Infinity, duration: 0.5 + i * 0.1, delay: i * 0.05 }}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}