import { motion } from 'framer-motion';
import MemoryTimeline from '../components/MemoryTimeline';

export default function Memories() {
  return (
    <div className="page memories-page">
      <motion.div
        className="page-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="page-title"><span className="icon" style={{ verticalAlign: 'middle', marginRight: '0.4rem' }}>photo_camera</span> អនុស្សាវរីយ៍របស់យើង</h1>
        <p className="page-subtitle">Our Precious Memories Together</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <MemoryTimeline />
      </motion.div>
    </div>
  );
}
