import { motion } from 'framer-motion';
import MemoryTimeline from '../components/MemoryTimeline';
import RomanticParticles from '../components/RomanticParticles';

export default function Memories() {
  return (
    <div className="page memories-page">
      <RomanticParticles />

      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <motion.h1
          className="page-title"
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
        >
          <span className="icon" style={{ verticalAlign: 'middle', marginRight: '0.4rem' }}>photo_camera</span>
          អនុស្សាវរីយ៍របស់យើង
        </motion.h1>
        <motion.p
          className="page-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          Our Precious Memories Together
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <MemoryTimeline />
      </motion.div>
    </div>
  );
}