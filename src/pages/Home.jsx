import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Countdown from '../components/Countdown';
import Fireworks from '../components/Fireworks';
import LoveLetter from '../components/LoveLetter';
import RomanticParticles from '../components/RomanticParticles';

const DEFAULT_MESSAGES = [
  'អ្នកគឺជាអំណោយដ៏មានតម្លៃបំផុតក្នុងជីវិតរបស់ខ្ញុំ 💕',
  'រាល់ថ្ងៃដែលបាននៅក្បែរអ្នក គឺជាថ្ងៃដ៏ស្រស់ស្អាត 🌹',
  'សូមអោយស្នេហ៍យើងស្ថិតស្ថេររហូតតទៅ 💗',
  'អរគុណដែលបានមកក្នុងជីវិតរបស់ខ្ញុំ 🌟',
  'ខ្ញុំស្រលាញ់អ្នកជារៀងរហូត 💖',
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const wordVariants = {
  hidden: { opacity: 0, y: 24, rotateX: -20 },
  visible: {
    opacity: 1, y: 0, rotateX: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.4 + i * 0.15, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function Home() {
  const [fireworksActive, setFireworksActive] = useState(false);
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [messageIndex, setMessageIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [heroTitle, setHeroTitle] = useState('រីករាយថ្ងៃកំណើត!');
  const [heroSubtitle, setHeroSubtitle] = useState('Happy Birthday!');

  useEffect(() => {
    getDoc(doc(db, 'settings', 'messages')).then((snap) => {
      if (snap.exists() && snap.data().list?.length > 0) {
        setMessages(snap.data().list);
      }
    });
    getDoc(doc(db, 'settings', 'hero')).then((snap) => {
      if (snap.exists()) {
        if (snap.data().title) setHeroTitle(snap.data().title);
        if (snap.data().subtitle) setHeroSubtitle(snap.data().subtitle);
      }
    });
  }, []);

  useEffect(() => {
    setLoaded(true);
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [messages.length]);

  const handleBirthday = useCallback(() => setFireworksActive(true), []);
  const toggleFireworks = useCallback(() => setFireworksActive((prev) => !prev), []);

  const titleWords = heroTitle.split(' ');

  return (
    <div className="page home-page">
      <RomanticParticles />

      <Fireworks active={fireworksActive} onToggle={toggleFireworks} />

      {loaded && (
        <>
          {/* Hero — word-stagger entrance with breathing glow */}
          <motion.div
            className="home-hero"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 className="home-title home-title--glow" variants={containerVariants}>
              {titleWords.map((word, i) => (
                <motion.span
                  key={`${word}-${i}`}
                  className="home-title-word"
                  variants={wordVariants}
                  aria-hidden="true"
                >
                  {word}{i < titleWords.length - 1 ? '\u00A0' : ''}
                </motion.span>
              ))}
            </motion.h1>
            <motion.p
              className="home-greeting"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              {heroSubtitle}
            </motion.p>
          </motion.div>

          {/* Rotating message — smooth scale crossfade */}
          <motion.div
            className="home-message-card"
            custom={0}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="home-message-glow" />
            <AnimatePresence mode="wait">
              <motion.p
                key={messageIndex}
                className="special-message"
                initial={{ opacity: 0, scale: 0.88, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -6 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {messages[messageIndex]}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* Countdown */}
          <motion.div
            className="home-section"
            custom={1}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <Countdown onBirthday={handleBirthday} />
          </motion.div>

          {/* Love Letter */}
          <motion.div
            className="home-section"
            custom={2}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
          >
            <LoveLetter />
          </motion.div>
        </>
      )}
    </div>
  );
}