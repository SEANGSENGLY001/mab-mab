import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

/* Paper texture overlay (SVG data URI) */
const PAPER_TEXTURE = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E`;

const envelopeVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.92 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 14, delay: 0.2 },
  },
  exit: {
    opacity: 0, scale: 0.6, rotate: -8, y: -40,
    transition: { duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] },
  },
};

const sealVariants = {
  idle: { scale: 1, rotate: 0 },
  hover: {
    scale: [1, 1.06, 1],
    rotate: [0, -4, 4, 0],
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
};

const letterVariants = {
  hidden: {
    opacity: 0,
    rotateX: 85,
    y: 120,
    scale: 0.9,
    filter: 'blur(6px)',
  },
  visible: {
    opacity: 1,
    rotateX: 0,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring', stiffness: 90, damping: 14,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    rotateX: -70,
    y: -80,
    scale: 0.85,
    filter: 'blur(4px)',
    transition: { duration: 0.35, ease: [0.43, 0.13, 0.23, 0.96] },
  },
};

const lineVariants = {
  hidden: { opacity: 0, y: 12, x: -8, rotate: -1 },
  visible: (i) => ({
    opacity: 1, y: 0, x: 0, rotate: 0,
    transition: {
      delay: 0.45 + i * 0.08,
      type: 'spring', stiffness: 70, damping: 12,
    },
  }),
};

/* Floating decorative hearts around the letter */
const floatingHearts = [
  { x: '-10%', y: '5%', size: 0.8, delay: 0 },
  { x: '105%', y: '15%', size: 0.6, delay: 0.6 },
  { x: '-8%', y: '50%', size: 0.5, delay: 1.2 },
  { x: '103%', y: '65%', size: 0.7, delay: 0.3 },
  { x: '50%', y: '-6%', size: 0.9, delay: 0.9 },
];

export default function LoveLetter() {
  const [isOpen, setIsOpen] = useState(false);
  const [letterContent, setLetterContent] = useState('');

  useEffect(() => {
    getDoc(doc(db, 'settings', 'letter')).then((snap) => {
      if (snap.exists()) {
        setLetterContent(snap.data().content || '');
      }
    });
  }, []);

  const lines = letterContent ? letterContent.split('\n') : [];

  return (
    <div className="love-letter-container">
      {/* Ambient floating background particles */}
      <div className="letter-ambient-particles" aria-hidden="true">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="letter-ambient-particle"
            style={{
              left: `${10 + i * 16}%`,
              animationDelay: `${i * 0.7}s`,
              fontSize: `${0.5 + Math.random() * 0.6}rem`,
            }}
            animate={{
              y: [0, -20 - Math.random() * 20, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 3 + Math.random() * 2,
              delay: i * 0.5,
              ease: 'easeInOut',
            }}
          >
            <span className="icon icon--fill" style={{ color: 'rgba(255,107,107,0.3)' }}>favorite</span>
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {!isOpen ? (
          /* ---- ENVELOPE ---- */
          <motion.div
            key="envelope"
            className="envelope"
            onClick={() => setIsOpen(true)}
            variants={envelopeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            {/* Envelope flap with fold shadow */}
            <div className="envelope-flap">
              <div className="envelope-flap-shape">
                <svg viewBox="0 0 200 120" className="envelope-flap-svg">
                  <path d="M0 0 L100 90 L200 0 Z" fill="rgba(255,255,255,0.15)" />
                </svg>
              </div>
              <motion.div
                className="envelope-seal"
                variants={sealVariants}
                initial="idle"
                whileHover="hover"
                animate={{
                  scale: [1, 1.08, 1],
                  rotate: [0, -3, 3, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3.5,
                  ease: 'easeInOut',
                }}
              >
                <span className="icon icon--fill" style={{ fontSize: '1.8rem' }}>favorite</span>
              </motion.div>
            </div>

            {/* Envelope body */}
            <div className="envelope-body">
              <p className="envelope-text">ចុចដើម្បីអានសំបុត្រ</p>
              <p className="envelope-subtext">Click to open the letter</p>
            </div>

            {/* Envelope decorative border */}
            <div className="envelope-border" />
          </motion.div>
        ) : (
          /* ---- LETTER PAPER ---- */
          <motion.div
            key="letter"
            className="letter-paper"
            variants={letterVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Paper texture overlay */}
            <div
              className="letter-paper-texture"
              style={{ backgroundImage: `url("${PAPER_TEXTURE}")` }}
            />

            {/* Floating hearts around letter */}
            {floatingHearts.map((h, i) => (
              <motion.div
                key={i}
                className="letter-float-heart"
                style={{ left: h.x, top: h.y, fontSize: `${h.size}rem` }}
                animate={{
                  y: [0, -8 - i * 2, 0],
                  rotate: [0, 5, -5, 0],
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 3 + i * 0.4,
                  delay: h.delay,
                  ease: 'easeInOut',
                }}
              >
                <span className="icon icon--fill">favorite</span>
              </motion.div>
            ))}

            {/* Close button */}
            <motion.button
              className="letter-close"
              onClick={() => setIsOpen(false)}
              whileHover={{ scale: 1.15, rotate: 90 }}
              whileTap={{ scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <span className="icon">close</span>
            </motion.button>

            {/* Header */}
            <motion.div
              className="letter-header"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
            >
              <span className="letter-heart">
                <span className="icon icon--fill">favorite</span>
              </span>
              <h3 className="letter-title">សំបុត្រស្នេហ៍</h3>
              <span className="letter-heart">
                <span className="icon icon--fill">favorite</span>
              </span>
            </motion.div>

            {/* Decorative divider */}
            <motion.div
              className="letter-divider"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Body with line-by-line reveal */}
            <div className="letter-body">
              {lines.length > 0 ? (
                lines.map((line, i) => (
                  <motion.p
                    key={i}
                    className="letter-line"
                    custom={i}
                    variants={lineVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {line || '\u00A0'}
                  </motion.p>
                ))
              ) : (
                <motion.p
                  className="letter-placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  សំបុត្ររបស់អ្នកនៅទទេ... សូមបន្ថែមតាមរយៈ Admin Panel
                </motion.p>
              )}
            </div>

            {/* Footer with wax seal */}
            <motion.div
              className="letter-footer"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 + lines.length * 0.08, type: 'spring', stiffness: 150 }}
            >
              <div className="letter-wax-seal">
                <span className="icon icon--fill">favorite</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
