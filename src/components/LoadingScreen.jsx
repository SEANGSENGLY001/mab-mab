import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="loading-content"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <div className="loading-heart"><span className="icon icon--fill">favorite</span></div>
        <div className="loading-spinner" />
        <p className="loading-text">កំពុងផ្ទុក...</p>
      </motion.div>
    </motion.div>
  );
}