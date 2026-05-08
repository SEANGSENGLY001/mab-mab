import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

/**
 * Converts various image URLs (Google Drive, etc.) to a directly embeddable URL.
 */
function resolveImageUrl(url) {
  if (!url) return '';
  // Google Drive share link: https://drive.google.com/file/d/{FILE_ID}/view
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/);
  if (driveMatch) {
    const id = driveMatch[1];
    // Use thumbnail endpoint — more reliable than uc?id= for images
    return `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
  }
  return url;
}

export default function MemoryTimeline() {
  const [memories, setMemories] = useState([]);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, 'memories'), orderBy('date', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMemories(list);
    });
    return () => unsub();
  }, []);

  return (
    <div className="timeline-container" ref={containerRef}>
      <motion.h2
        className="timeline-title"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="icon" style={{ verticalAlign: 'middle', marginRight: '0.4rem' }}>photo_camera</span>
        អនុស្សាវរីយ៍របស់យើង
      </motion.h2>
      <motion.p
        className="timeline-subtitle"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        Our Memories Together
      </motion.p>

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
            className="timeline-card"
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{
              duration: 0.6,
              delay: index * 0.12,
              type: 'spring',
              stiffness: 80,
              damping: 15,
            }}
            whileHover={{ scale: 1.03, y: -4 }}
            onClick={() => setSelectedMemory(memory)}
          >
            {memory.imageUrl && (
              <div className="timeline-image-wrapper">
                <img
                  src={resolveImageUrl(memory.imageUrl)}
                  alt={memory.description || 'Memory'}
                  className="timeline-image"
                  loading="lazy"
                  onError={(e) => {
                    // Remove the broken image element and show fallback
                    const wrapper = e.target.closest('.timeline-image-wrapper');
                    if (wrapper) wrapper.style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="timeline-info">
              <span className="timeline-date">
                {memory.date?.toDate?.().toLocaleDateString('km-KH', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
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
            onClick={() => setSelectedMemory(null)}
          >
            <motion.div
              className="timeline-modal"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setSelectedMemory(null)}>
                <span className="icon">close</span>
              </button>
              {selectedMemory.imageUrl && (
                <img
                  src={resolveImageUrl(selectedMemory.imageUrl)}
                  alt={selectedMemory.description}
                  className="modal-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <div className="modal-info">
                <span className="modal-date">
                  {selectedMemory.date?.toDate?.().toLocaleDateString('km-KH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) || selectedMemory.date}
                </span>
                <p className="modal-desc">{selectedMemory.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}