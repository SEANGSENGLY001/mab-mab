import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/*
 * Eager glob — all song URLs resolved at startup so play/next/prev
 * work synchronously inside user gesture handlers (required by mobile Safari).
 */
const musicModules = import.meta.glob('/src/assets/musics/**/*.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
});

const REPEAT_MODES = ['off', 'one', 'all'];
const REPEAT_ICONS = { off: 'repeat', one: 'repeat_one', all: 'repeat' };

function formatFilename(filepath) {
  const filename = filepath.split('/').pop().replace(/\.[^.]+$/, '');
  return filename
    .replace(/\s*\(copy\)\s*/gi, '')
    .replace(/\s*copy\s*/gi, '')
    .replace(/\[.*?\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildPlaylist() {
  const seen = new Set();
  const entries = Object.entries(musicModules);

  const originals = entries.filter(([fp]) => !/(copy)/i.test(fp));
  const copies = entries.filter(([fp]) => /copy/i.test(fp));

  const list = [];
  for (const [filepath, url] of originals) {
    const key = formatFilename(filepath);
    if (seen.has(key)) continue;
    seen.add(key);
    list.push({
      id: list.length,
      filepath,
      url,
      displayName: formatFilename(filepath) || 'Untitled',
    });
  }
  for (const [filepath, url] of copies) {
    const key = formatFilename(filepath);
    if (seen.has(key)) continue;
    seen.add(key);
    list.push({
      id: list.length,
      filepath,
      url,
      displayName: formatFilename(filepath) || 'Untitled',
    });
  }

  return list;
}

const storage = {
  get: (key, fallback) => {
    try {
      const v = localStorage.getItem(key);
      return v !== null ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  set: (key, val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* noop */ }
  },
};

export default function MusicPlayer() {
  const playlist = useMemo(() => buildPlaylist(), []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(() => storage.get('player-visible', true));
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [volume, setVolume] = useState(() => storage.get('player-volume', 0.5));
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [repeatMode, setRepeatMode] = useState(() => storage.get('player-repeat', 'off'));
  const [shuffleOn, setShuffleOn] = useState(() => storage.get('player-shuffle', false));
  const [isBuffering, setIsBuffering] = useState(false);
  const [isDownloadReady, setIsDownloadReady] = useState(false);

  const audioRef = useRef(null);
  const hasStartedRef = useRef(false);
  const isPlayingRef = useRef(false);
  const progressBarRef = useRef(null);
  const shuffleHistory = useRef([]);
  const shuffleIdx = useRef(0);
  const playlistRef = useRef(playlist);
  playlistRef.current = playlist;

  // Keep ref in sync with state
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  // Persist preferences
  useEffect(() => { storage.set('player-visible', isVisible); }, [isVisible]);
  useEffect(() => { storage.set('player-volume', volume); }, [volume]);
  useEffect(() => { storage.set('player-repeat', repeatMode); }, [repeatMode]);
  useEffect(() => { storage.set('player-shuffle', shuffleOn); }, [shuffleOn]);

  // Sync audio source when index changes — loads the new URL into <audio>
  // play() is never called here (must happen in user-gesture handlers for mobile)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || playlist.length === 0) return;
    const song = playlist[currentIndex];
    if (!song || song.url === audio.src) return;
    setIsDownloadReady(false);
    audio.src = song.url;
    audio.load();
    audio.volume = volume;
  }, [currentIndex, playlist, volume]);

  // Track playback progress
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const update = () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration);
      }
    };
    audio.addEventListener('timeupdate', update);
    audio.addEventListener('loadedmetadata', update);
    return () => {
      audio.removeEventListener('timeupdate', update);
      audio.removeEventListener('loadedmetadata', update);
    };
  }, []);

  // Track buffering and can-play state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onCanPlay = () => {
      setIsBuffering(false);
      setIsDownloadReady(true);
    };
    const onStalled = () => setIsBuffering(true);

    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('stalled', onStalled);

    if (audio.readyState >= 3) {
      setIsDownloadReady(true);
    }

    return () => {
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('stalled', onStalled);
    };
  }, []);

  // Shuffle helpers
  const getNextShuffleIndex = useCallback((current) => {
    const indices = Array.from({ length: playlist.length }, (_, i) => i).filter(i => i !== current);
    if (indices.length === 0) return current;
    const pick = indices[Math.floor(Math.random() * indices.length)];
    return pick;
  }, [playlist.length]);

  // --- All play/pause calls happen DIRECTLY in user-gesture handlers below ---

  const goNext = useCallback(() => {
    const pl = playlistRef.current;
    if (pl.length === 0) return;
    const audio = audioRef.current;

    let nextIdx;
    if (shuffleOn) {
      nextIdx = getNextShuffleIndex(currentIndex);
      shuffleHistory.current.push(currentIndex);
      shuffleIdx.current++;
    } else {
      nextIdx = (currentIndex + 1) % pl.length;
    }

    const nextSong = pl[nextIdx];
    if (!nextSong) return;

    setCurrentIndex(nextIdx);

    // Synchronously set src and play (inside user-gesture context)
    if (audio && isPlayingRef.current) {
      audio.src = nextSong.url;
      audio.load();
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [shuffleOn, currentIndex, getNextShuffleIndex]);

  const goPrev = useCallback(() => {
    const pl = playlistRef.current;
    if (pl.length === 0) return;
    const audio = audioRef.current;

    let prevIdx;
    if (shuffleOn && shuffleHistory.current.length > 0) {
      prevIdx = shuffleHistory.current.pop();
      shuffleIdx.current = Math.max(0, shuffleIdx.current - 1);
    } else {
      prevIdx = (currentIndex - 1 + pl.length) % pl.length;
    }

    const prevSong = pl[prevIdx];
    if (!prevSong) return;

    setCurrentIndex(prevIdx);

    // Synchronously set src and play (inside user-gesture context)
    if (audio && isPlayingRef.current) {
      audio.src = prevSong.url;
      audio.load();
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [shuffleOn, currentIndex]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlayingRef.current) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // URL is already loaded by the effect — play() is called in user-gesture context
      const p = audio.play();
      if (p) {
        p.then(() => setIsPlaying(true)).catch(() => {});
      } else {
        setIsPlaying(true);
      }
    }
  }, []);

  const handleEnded = useCallback(() => {
    if (repeatMode === 'one') {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    } else if (repeatMode === 'all') {
      goNext();
    } else {
      if (currentIndex < playlist.length - 1) {
        goNext();
      } else {
        setIsPlaying(false);
      }
    }
  }, [repeatMode, currentIndex, playlist.length, goNext]);

  const cycleRepeat = useCallback(() => {
    setRepeatMode(m => REPEAT_MODES[(REPEAT_MODES.indexOf(m) + 1) % REPEAT_MODES.length]);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffleOn(s => {
      if (!s) {
        shuffleHistory.current = [];
        shuffleIdx.current = 0;
      }
      return !s;
    });
  }, []);

  const seek = useCallback((clientX) => {
    const audio = audioRef.current;
    const bar = progressBarRef.current;
    if (!audio || !audio.duration || !bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    audio.currentTime = pct * audio.duration;
    setProgress(pct);
  }, []);

  const handleProgressDown = (e) => {
    setIsDragging(true);
    seek(e.clientX || e.touches?.[0]?.clientX);
  };

  useEffect(() => {
    if (!isDragging) return;
    const move = (e) => seek(e.clientX || e.touches?.[0]?.clientX);
    const up = () => setIsDragging(false);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, [isDragging, seek]);

  // Keyboard shortcut: Space to toggle
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlay]);

  // Download current song
  const handleDownload = useCallback(async () => {
    const song = playlistRef.current[currentIndex];
    const url = song?.url;
    if (!url) return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${song.displayName || 'song'}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn('Download failed:', err);
    }
  }, [currentIndex]);

  if (playlist.length === 0) return null;

  const currentSong = playlist[currentIndex];
  const progressPct = `${(progress * 100).toFixed(1)}%`;
  const showBufferingMsg = isBuffering && isPlaying;

  return (
    <>
      <audio
        ref={audioRef}
        onEnded={handleEnded}
        onError={() => {
          console.warn('Audio load error');
          setIsBuffering(false);
        }}
        preload="auto"
        playsInline
      />

      {/* Toggle button */}
      <motion.button
        className={`music-toggle-btn ${isPlaying ? 'is-playing' : ''}`}
        onClick={() => setIsVisible(v => !v)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label={isVisible ? 'Close player' : 'Open player'}
      >
        <span className="icon icon--fill">{isPlaying ? 'favorite' : 'music_note'}</span>
      </motion.button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={`music-player ${showPlaylist ? 'has-playlist-open' : ''}`}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {/* Status bar — loading / buffering / ready */}
            <div className="music-status-bar">
              {isBuffering && isPlaying && (
                <motion.span
                  className="music-status-msg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <span className="icon music-status-icon">wifi_find</span>
                  Buffering...
                </motion.span>
              )}
            </div>

            {/* Spinning record disc */}
            <div className="music-disc">
              <div className={`music-disc-inner ${isPlaying ? 'spinning' : ''} ${isBuffering && isPlaying ? 'buffering-pulse' : ''}`}>
                <div className="music-disc-label">
                  <span className="icon icon--fill">favorite</span>
                </div>
              </div>
            </div>

            {/* Song title */}
            <p className="music-title" title={currentSong?.displayName}>
              {currentSong?.displayName || 'No title'}
            </p>

            {/* Seekable progress bar */}
            <div
              className={`music-progress ${isDragging ? 'is-dragging' : ''} ${isBuffering && isPlaying ? 'is-buffering' : ''}`}
              ref={progressBarRef}
              onMouseDown={handleProgressDown}
              onTouchStart={handleProgressDown}
              role="slider"
              aria-label="Song progress"
              aria-valuenow={Math.round(progress * 100)}
              tabIndex={0}
            >
              <div className="music-progress-track">
                <div className="music-progress-fill" style={{ width: progressPct }} />
              </div>
            </div>

            {/* Controls */}
            <div className="music-controls">
              <motion.button
                className={`music-btn ${shuffleOn ? 'is-active' : ''}`}
                onClick={toggleShuffle}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Shuffle ${shuffleOn ? 'on' : 'off'}`}
                title={`Shuffle ${shuffleOn ? 'on' : 'off'}`}
              >
                <span className="icon">shuffle</span>
              </motion.button>

              <motion.button
                className="music-btn"
                onClick={goPrev}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Previous"
              >
                <span className="icon">skip_previous</span>
              </motion.button>

              <motion.button
                className={`music-btn play-btn ${isPlaying ? 'is-playing' : ''}`}
                onClick={togglePlay}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.9 }}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                <span className="icon">{isPlaying ? 'pause' : 'play_arrow'}</span>
              </motion.button>

              <motion.button
                className="music-btn"
                onClick={goNext}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Next"
              >
                <span className="icon">skip_next</span>
              </motion.button>

              <motion.button
                className={`music-btn ${repeatMode !== 'off' ? 'is-active' : ''}`}
                onClick={cycleRepeat}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.9 }}
                aria-label={`Repeat: ${repeatMode}`}
                title={`Repeat: ${repeatMode}`}
              >
                <span className="icon">{REPEAT_ICONS[repeatMode]}</span>
              </motion.button>
            </div>

            {/* Volume & Download */}
            <div className="music-volume">
              <span className="icon icon--sm">
                {volume === 0 ? 'volume_mute' : volume < 0.35 ? 'volume_down' : 'volume_up'}
              </span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={e => setVolume(parseFloat(e.target.value))}
                className="volume-slider"
                aria-label="Volume"
              />
              <motion.button
                className={`music-btn music-btn--sm ${isDownloadReady ? 'is-ready' : ''}`}
                onClick={handleDownload}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Download song"
                title={isDownloadReady ? 'Download song' : 'Loading...'}
              >
                <span className="icon">download</span>
              </motion.button>
              <motion.button
                className={`music-btn music-btn--sm ${showPlaylist ? 'is-active' : ''}`}
                onClick={() => setShowPlaylist(v => !v)}
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Playlist"
                title="Playlist"
              >
                <span className="icon">queue_music</span>
              </motion.button>
            </div>

            {/* Waveform */}
            {isPlaying && !showBufferingMsg && (
              <div className="music-waveform">
                {[1, 2, 3, 4, 5].map(i => (
                  <motion.div
                    key={i}
                    className="wf-bar"
                    animate={{
                      height: [5, 16, 8, 20, 12],
                      opacity: [0.35, 0.95, 0.55, 0.75, 0.45],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8 + i * 0.1,
                      delay: i * 0.07,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Playlist panel */}
            <AnimatePresence>
              {showPlaylist && (
                <motion.div
                  className="music-playlist"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <div className="music-playlist-header">
                    <span className="music-playlist-count">
                      {playlist.length} {playlist.length === 1 ? 'song' : 'songs'}
                    </span>
                  </div>
                  <div className="music-playlist-scroll">
                    {playlist.map((song, i) => (
                      <button
                        key={song.id}
                        className={`music-playlist-item ${i === currentIndex ? 'is-current' : ''}`}
                        onClick={() => {
                          const audio = audioRef.current;
                          setCurrentIndex(i);
                          setShowPlaylist(false);
                          // Play directly in user-gesture context if paused
                          if (audio && !isPlayingRef.current) {
                            audio.play().then(() => setIsPlaying(true)).catch(() => {});
                          }
                        }}
                      >
                        <span className="music-playlist-idx">{String(i + 1).padStart(2, '0')}</span>
                        <span className="music-playlist-name">{song.displayName}</span>
                        {i === currentIndex && isPlaying && (
                          <span className="music-playlist-indicator">
                            <span className="icon icon--sm icon--fill">equalizer</span>
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
