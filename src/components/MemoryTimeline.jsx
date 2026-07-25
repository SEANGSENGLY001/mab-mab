import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

function resolveImageUrl(url) {
  if (!url) return '';
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/);
  if (driveMatch) {
    const id = driveMatch[1];
    return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
  }
  return url;
}

/**
 * SwipeDetector — captures horizontal touch gestures on its children.
 * Calls onSwipeLeft / onSwipeRight when the threshold (px) is exceeded.
 */
/**
 * useSwipe — returns stable handlers to spread onto an element for horizontal swipe detection.
 * Callbacks via ref to avoid stale closure issues.
 */
function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 60 } = {}) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const leftRef = useRef(onSwipeLeft);
  const rightRef = useRef(onSwipeRight);

  // Keep refs in sync with latest callbacks
  leftRef.current = onSwipeLeft;
  rightRef.current = onSwipeRight;

  const onTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback((e) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
      if (dx > 0) rightRef.current?.();
      else leftRef.current?.();
    }
  }, [threshold]);

  return { onTouchStart, onTouchEnd };
}

const cardVariants = {
  hidden: (i) => ({
    opacity: 0,
    y: 40,
    scale: 0.94,
    rotate: (i % 2 === 0 ? -1 : 1) * (1.5 + Math.random()),
  }),
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

const modalVariants = {
  hidden: { scale: 0.6, opacity: 0, y: 60 },
  visible: { scale: 1, opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 20 } },
  exit: { scale: 0.6, opacity: 0, y: 60, transition: { duration: 0.25 } },
};

export default function MemoryTimeline() {
  const [memories, setMemories] = useState([]);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hoveredId, setHoveredId] = useState(null);
  const [failedImages, setFailedImages] = useState(new Set());
  const containerRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, 'memories'), orderBy('date', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMemories(list);
    });
    return () => unsub();
  }, []);

  // --- Modal navigation ---
  const openMemory = (memory, index) => {
    setSelectedMemory(memory);
    setSelectedIndex(index);
  };

  const closeModal = () => {
    setSelectedMemory(null);
    setSelectedIndex(-1);
  };

  const goToPrev = () => {
    if (selectedIndex > 0) {
      const prev = memories[selectedIndex - 1];
      setSelectedMemory(prev);
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex < memories.length - 1) {
      const next = memories[selectedIndex + 1];
      setSelectedMemory(next);
      setSelectedIndex(selectedIndex + 1);
    }
  };

  // Swipe gestures on the modal overlay
  const swipeHandlers = useSwipe({
    onSwipeLeft: goToNext,
    onSwipeRight: goToPrev,
    threshold: 60,
  });

  // Keyboard navigation
  useEffect(() => {
    if (!selectedMemory) return;
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') goToPrev();
      else if (e.key === 'ArrowRight') goToNext();
      else if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedMemory, selectedIndex, memories.length]);

  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex < memories.length - 1;

  return (
    <div className="timeline-container" ref={containerRef}>
      {memories.length === 0 && (
        <motion.div
          className="timeline-empty"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <p>មិនទាន់មានអនុស្សាវរីយ៍នៅឡើយទេ...</p>
          <p>(No memories yet. Add from Admin panel.)</p>
        </motion.div>
      )}

      <div className="timeline-list">
        {memories.map((memory, index) => (
          <motion.div
            key={memory.id}
            className={`timeline-card ${hoveredId === memory.id ? 'is-hovered' : ''}`}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            onMouseEnter={() => setHoveredId(memory.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => openMemory(memory, index)}
          >
            {memory.imageUrl && !failedImages.has(memory.id) && (
              <div className="timeline-image-wrapper">
                <div className="timeline-image-glow" />
                <img
                  src={resolveImageUrl(memory.imageUrl)}
                  alt={memory.description || 'Memory'}
                  className="timeline-image"
                  loading="lazy"
                  onError={() => setFailedImages((prev) => new Set(prev).add(memory.id))}
                />
                {/* Hover overlay with floating hearts — always visible on touch (tap to preview) */}
                <AnimatePresence>
                  {(hoveredId === memory.id) && (
                    <motion.div
                      className="timeline-hover-overlay"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.span
                        className="icon icon--fill timeline-hover-icon"
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 30 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                      >
                        favorite
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            {memory.imageUrl && failedImages.has(memory.id) && (
              <div className="timeline-image-wrapper timeline-image-wrapper--broken">
                <div className="timeline-image-glow" />
                <div className="timeline-image-fallback">
                  <span className="icon icon--fill" style={{ fontSize: '2.5rem', color: 'var(--text-muted)' }}>broken_image</span>
                </div>
              </div>
            )}
            <div className="timeline-info">
              <span className="timeline-date">
                <span className="timeline-date-icon icon icon--sm">favorite</span>
                {memory.date?.toDate?.().toLocaleDateString('km-KH', {
                  year: 'numeric', month: 'long', day: 'numeric',
                }) || memory.date}
              </span>
              <p className="timeline-desc">{memory.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedMemory && (
          <motion.div
            className="timeline-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            {...swipeHandlers}
          >
            <motion.div
              className="timeline-modal"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={closeModal}>
                <span className="icon">close</span>
              </button>

              {/* Previous button */}
              <button
                className={`modal-nav-btn modal-nav-prev ${hasPrev ? '' : 'is-disabled'}`}
                onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                disabled={!hasPrev}
                aria-label="Previous memory"
              >
                <span className="icon">chevron_left</span>
              </button>

              {/* Next button */}
              <button
                className={`modal-nav-btn modal-nav-next ${hasNext ? '' : 'is-disabled'}`}
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                disabled={!hasNext}
                aria-label="Next memory"
              >
                <span className="icon">chevron_right</span>
              </button>

              {selectedMemory.imageUrl && (
                <div className="modal-image-wrapper">
                  <img
                    src={resolveImageUrl(selectedMemory.imageUrl)}
                    alt={selectedMemory.description}
                    className="modal-image"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
              {/* Counter indicator */}
              <div className="modal-counter">
                {selectedIndex + 1} / {memories.length}
              </div>
              <div className="modal-info">
                <span className="modal-date">
                  <span className="timeline-date-icon icon icon--sm">favorite</span>
                  {selectedMemory.date?.toDate?.().toLocaleDateString('km-KH', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  }) || selectedMemory.date}
                </span>
                <p className="modal-desc">{selectedMemory.description}</p>
              </div>
              <div className="modal-hearts">
                <span className="icon icon--fill modal-heart-1">favorite</span>
                <span className="icon icon--fill modal-heart-2">favorite</span>
                <span className="icon icon--fill modal-heart-3">favorite</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
