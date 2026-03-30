import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:3000/api/user/login', formData);
      localStorage.setItem('token', response.data.token);
      const decoded = jwtDecode(response.data.token);
      if (decoded.role === 'admin') window.location.href = '/admin';
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Background blobs */}
      <div style={{ ...styles.blob, top: '-100px', left: '-100px', background: 'radial-gradient(circle, #AA367C55, transparent 70%)' }} />
      <div style={{ ...styles.blob, bottom: '-100px', right: '-100px', background: 'radial-gradient(circle, #4A2FBD55, transparent 70%)' }} />

      <div style={styles.card}>
        {/* Logo / Header */}
        <div style={styles.header}>
          <div style={styles.iconWrap}>
            <Lock size={28} color="#fff" />
          </div>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to your admin panel</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Username */}
          <div style={styles.fieldWrap}>
            <label style={styles.label}>Username</label>
            <div style={styles.inputWrap}>
              <User size={16} color="#71717a" style={styles.inputIcon} />
              <input
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                style={styles.input}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = '#3f3f46'}
              />
            </div>
          </div>

          {/* Password */}
          <div style={styles.fieldWrap}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <Lock size={16} color="#71717a" style={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                style={{ ...styles.input, paddingRight: '44px' }}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = '#3f3f46'}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                {showPassword ? <EyeOff size={16} color="#71717a" /> : <Eye size={16} color="#71717a" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={styles.error}>
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? (
              <span style={styles.spinner} />
            ) : 'Sign In'}
          </button>
        </form>

        <p style={styles.link}>
          <a href="/" style={styles.anchor}>← Back to Home</a>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#09090b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'inherit',
  },
  blob: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  card: {
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: '20px',
    padding: '40px 36px',
    width: '100%',
    maxWidth: '420px',
    position: 'relative',
    zIndex: 1,
    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  iconWrap: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #AA367C, #4A2FBD)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    boxShadow: '0 8px 24px rgba(124,58,237,0.35)',
  },
  title: {
    color: '#fff',
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 6px',
  },
  subtitle: {
    color: '#71717a',
    fontSize: '14px',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  fieldWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    color: '#a1a1aa',
    fontSize: '13px',
    fontWeight: '500',
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '11px 14px 11px 40px',
    background: '#09090b',
    border: '1px solid #3f3f46',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: 0,
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#450a0a',
    border: '1px solid #7f1d1d',
    color: '#fca5a5',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
  },
  btn: {
    padding: '12px',
    background: 'linear-gradient(135deg, #AA367C, #4A2FBD)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '44px',
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  },
  link: {
    textAlign: 'center',
    marginTop: '20px',
    marginBottom: 0,
  },
  anchor: {
    color: '#7c3aed',
    fontSize: '13px',
    textDecoration: 'none',
  },
};

export default Login;
