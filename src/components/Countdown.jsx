import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

const KHMER_LABELS = {
  days: 'ថ្ងៃ',
  hours: 'ម៉ោង',
  minutes: 'នាទី',
  seconds: 'វិនាទី',
};

const MONTHS_KHMER = [
  'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
  'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ',
];

function padNumber(num) {
  return String(num).padStart(2, '0');
}

export default function Countdown({ onBirthday }) {
  const [birthdayDate, setBirthdayDate] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const isBirthdayRef = useRef(false);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    getDoc(doc(db, 'settings', 'birthday')).then((snap) => {
      if (snap.exists() && snap.data().date) {
        const raw = snap.data().date;
        const date = raw?.toDate ? raw.toDate() : new Date(raw);
        if (!isNaN(date.getTime())) {
          setBirthdayDate(date);
        } else {
          setBirthdayDate(null);
        }
      } else {
        setBirthdayDate(null);
      }
    });
  }, []);

  useEffect(() => {
    if (!birthdayDate) return;

    const tick = () => {
      const now = new Date();
      const currentYear = now.getFullYear();
      let target = new Date(
        currentYear,
        birthdayDate.getMonth(),
        birthdayDate.getDate(),
        0, 0, 0
      );

      if (now > target) {
        target = new Date(
          currentYear + 1,
          birthdayDate.getMonth(),
          birthdayDate.getDate(),
          0, 0, 0
        );
      }

      const diff = target.getTime() - now.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const isBirthdayDay =
        now.getDate() === birthdayDate.getDate() &&
        now.getMonth() === birthdayDate.getMonth();

      if (isBirthdayDay && !isBirthdayRef.current) {
        isBirthdayRef.current = true;
        if (onBirthday) onBirthday();
        forceUpdate((n) => n + 1);
      }

      setTimeLeft({ days, hours, minutes, seconds });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [birthdayDate, onBirthday]);

  const formattedDate = useMemo(() => {
    if (!birthdayDate) return '';
    const day = birthdayDate.getDate();
    const month = MONTHS_KHMER[birthdayDate.getMonth()];
    const year = birthdayDate.getFullYear();
    return `${day} ${month} ${year}`;
  }, [birthdayDate]);

  if (!birthdayDate || !timeLeft) {
    return (
      <div className="countdown-container">
        <p className="countdown-loading">កំពុងផ្ទុក...</p>
      </div>
    );
  }

  if (isBirthdayRef.current) {
    return (
      <motion.div
        className="countdown-container birthday-mode"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      >
        <h1 className="birthday-title">រីករាយថ្ងៃកំណើត! <span className="icon icon--md" style={{ verticalAlign: 'middle' }}>celebration</span></h1>
        <p className="birthday-subtitle">Happy Birthday!</p>
        <div className="birthday-sparkle"><span className="icon">cake</span></div>
      </motion.div>
    );
  }

  const { days, hours, minutes, seconds } = timeLeft;

  return (
    <div className="countdown-container">
      <h2 className="countdown-title">រាប់ថយក្រោយ</h2>
      <p className="countdown-date">ថ្ងៃកំណើត៖ {formattedDate}</p>
      <div className="countdown-grid">
        {[
          { value: days, label: KHMER_LABELS.days },
          { value: hours, label: KHMER_LABELS.hours },
          { value: minutes, label: KHMER_LABELS.minutes },
          { value: seconds, label: KHMER_LABELS.seconds },
        ].map(({ value, label }) => (
          <div key={label} className="countdown-item">
            <span className="countdown-value">{padNumber(value)}</span>
            <span className="countdown-label">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}