import { useState } from 'react';
import { motion } from 'framer-motion';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (err) {
      setError(
        err.code === 'auth/invalid-credential'
          ? 'អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ'
          : 'ការចូលប្រើប្រាស់បរាជ័យ។ សូមព្យាយាមម្តងទៀត'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page login-page">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <div className="login-header">
          <span className="login-icon"><span className="icon icon--xl">lock</span></span>
          <h2 className="login-title">Admin Login</h2>
          <p className="login-subtitle">ចូលប្រើប្រាស់ Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">អ៊ីមែល / Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">ពាក្យសម្ងាត់ / Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <motion.p
              className="login-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            className="login-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            {loading ? 'កំពុងចូល...' : 'ចូលប្រើប្រាស់'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}