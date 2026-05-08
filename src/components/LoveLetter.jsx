import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

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

  return (
    <div className="love-letter-container">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="envelope"
            className="envelope"
            onClick={() => setIsOpen(true)}
            whileHover={{ scale: 1.05, rotate: [-2, 2, -2] }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: -10 }}
            transition={{ duration: 0.5 }}
          >
            <div className="envelope-flap">
              <div className="envelope-heart"><span className="icon">mail</span></div>
            </div>
            <div className="envelope-body">
              <p className="envelope-text">ចុចដើម្បីអានសំបុត្រ</p>
              <p className="envelope-subtext">Click to open the letter</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            className="letter-paper"
            initial={{ opacity: 0, rotateX: 90, y: 100 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            exit={{ opacity: 0, rotateX: -90, y: -100 }}
            transition={{ type: 'spring', stiffness: 120, damping: 15 }}
          >
            <motion.button
              className="letter-close"
              onClick={() => setIsOpen(false)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="icon">close</span>
            </motion.button>
            <div className="letter-header">
              <span className="letter-heart"><span className="icon icon--fill">favorite</span></span>
              <h3 className="letter-title">សំបុត្រស្នេហ៍</h3>
              <span className="letter-heart"><span className="icon icon--fill">favorite</span></span>
            </div>
            <div className="letter-body">
              {letterContent ? (
                letterContent.split('\n').map((line, i) => (
                  <motion.p
                    key={i}
                    className="letter-line"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {line}
                  </motion.p>
                ))
              ) : (
                <p className="letter-placeholder">
                  សំបុត្ររបស់អ្នកនៅទទេ... សូមបន្ថែមតាមរយៈ Admin Panel
                </p>
              )}
            </div>
            <div className="letter-footer">
              <span className="icon icon--fill">favorite</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}