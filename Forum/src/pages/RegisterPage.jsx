import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, CheckCircle, Loader } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/register', formData);
      toast.success('Account created successfully! Please login.');
      navigate('/login');
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join our community today</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                name="username"
                className="form-input" 
                placeholder="johndoe"
                style={{ paddingLeft: '40px' }}
                value={formData.username}
                onChange={handleChange}
                required
                minLength={4}
                maxLength={30}
              />
            </div>
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>4-30 characters</small>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                name="email"
                className="form-input" 
                placeholder="you@example.com"
                style={{ paddingLeft: '40px' }}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                name="password"
                className="form-input" 
                placeholder="••••••••"
                style={{ paddingLeft: '40px' }}
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
              />
            </div>
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>Min 8 characters</small>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <Loader className="animate-spin" size={20} /> : 'Sign Up'}
            {!loading && <CheckCircle size={20} />}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="text-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
