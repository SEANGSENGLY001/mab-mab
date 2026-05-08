import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Countdown from '../components/Countdown';
import Fireworks from '../components/Fireworks';
import LoveLetter from '../components/LoveLetter';
import FloatingHearts from '../components/FloatingHearts';

const DEFAULT_MESSAGES = [
  'អ្នកគឺជាអំណោយដ៏មានតម្លៃបំផុតក្នុងជីវិតរបស់ខ្ញុំ 💕',
  'រាល់ថ្ងៃដែលបាននៅក្បែរអ្នក គឺជាថ្ងៃដ៏ស្រស់ស្អាត 🌹',
  'សូមអោយស្នេហ៍យើងស្ថិតស្ថេររហូតតទៅ 💗',
  'អរគុណដែលបានមកក្នុងជីវិតរបស់ខ្ញុំ 🌟',
  'ខ្ញុំស្រលាញ់អ្នកជារៀងរហូត 💖',
];

export default function Home() {
  const [fireworksActive, setFireworksActive] = useState(false);
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [messageIndex, setMessageIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [heroTitle, setHeroTitle] = useState('រីករាយថ្ងៃកំណើត!');
  const [heroSubtitle, setHeroSubtitle] = useState('Happy Birthday!');

  // Load settings from Firestore once on mount
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

  const handleBirthday = useCallback(() => {
    setFireworksActive(true);
  }, []);

  const toggleFireworks = useCallback(() => {
    setFireworksActive((prev) => !prev);
  }, []);

  return (
    <div className="page home-page" style={{ transform: 'translateZ(0)' }}>
      <FloatingHearts />

      <Fireworks active={fireworksActive} onToggle={toggleFireworks} />

      {loaded && (
        <>
          <div className="home-hero">
            <h1 className="home-title">{heroTitle}</h1>
            <p className="home-greeting">{heroSubtitle}</p>
          </div>

          <div className="home-message">
            <AnimatePresence mode="wait">
              <motion.p
                key={messageIndex}
                className="special-message"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
              >
                {messages[messageIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="home-section">
            <Countdown onBirthday={handleBirthday} />
          </div>

          <div className="home-section">
            <LoveLetter />
          </div>
        </>
      )}
    </div>
  );
}