import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [formData, setFormData] = useState({
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
      const response = await api.post('/auth/login', formData);
      const { accessToken, user } = response.data;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      toast.success(`Welcome back, ${user.username}!`);
      navigate('/'); // Redirect to dashboard/home
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to continue your journey</p>
        
        <form onSubmit={handleSubmit}>
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
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <Loader className="animate-spin" size={20} /> : 'Sign In'}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register" className="text-link">Create one</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
