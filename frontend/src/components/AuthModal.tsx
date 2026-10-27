import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { apiClient } from '../api/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { email: string; name: string; role: 'STUDENT' | 'ADMIN' }) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = 'login',
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        const res = await apiClient.register(name.trim(), email.trim(), password);
        if (res.success && res.user) {
          setSuccessMsg('Account created successfully! Logging you in...');
          setTimeout(() => {
            onSuccess({
              email: res.user.email,
              name: res.user.username || name,
              role: res.user.role === 'ADMIN' ? 'ADMIN' : 'STUDENT',
            });
            onClose();
          }, 1000);
        } else {
          setErrorMsg(res.error || 'Failed to create account. Email may already be in use.');
        }
      } else {
        const res = await apiClient.login(email.trim(), password);
        if (res.success && res.user) {
          setSuccessMsg('Welcome back!');
          setTimeout(() => {
            onSuccess({
              email: res.user.email,
              name: res.user.username || res.user.email.split('@')[0],
              role: res.user.role === 'ADMIN' ? 'ADMIN' : 'STUDENT',
            });
            onClose();
          }, 800);
        } else {
          setErrorMsg(res.error || 'Invalid email or password.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 460, backgroundColor: '#ffffff', padding: 0, overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff'
        }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              {mode === 'login' ? 'Sign In to Lost & Found' : 'Create Campus Account'}
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              {mode === 'login' ? 'Access your reports, claims, and campus matches' : 'Register to report items and verify recovery claims'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-surface)',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          padding: '4px 24px 0',
          gap: 8,
          backgroundColor: '#ffffff'
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              padding: '10px',
              border: 'none',
              borderBottom: mode === 'login' ? '2px solid var(--primary)' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: mode === 'login' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: mode === 'login' ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              padding: '10px',
              border: 'none',
              borderBottom: mode === 'register' ? '2px solid var(--primary)' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: mode === 'register' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: mode === 'register' ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer'
            }}
          >
            Register
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 28px' }}>
          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              backgroundColor: 'var(--lost-bg)',
              color: 'var(--lost-color)',
              border: '1px solid var(--lost-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.86rem',
              marginBottom: 16
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              backgroundColor: 'var(--found-bg)',
              color: 'var(--found-color)',
              border: '1px solid var(--found-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.86rem',
              marginBottom: 16
            }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'register' && (
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Full Name *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12 }} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label className="form-label">College / University Email *</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12 }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="form-input"
                style={{ paddingLeft: 38 }}
              />
            </div>
          </div>

          <div style={{ marginBottom: mode === 'register' ? 16 : 22 }}>
            <label className="form-label">Password *</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12 }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="form-input"
                style={{ paddingLeft: 38, paddingRight: 38 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div style={{ marginBottom: 22 }}>
              <label className="form-label">Confirm Password *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12 }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

          <div style={{ marginTop: 18, textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            {mode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <strong
                  onClick={() => { setMode('register'); setErrorMsg(''); }}
                  style={{ color: 'var(--primary)', cursor: 'pointer' }}
                >
                  Register here
                </strong>
              </span>
            ) : (
              <span>
                Already registered?{' '}
                <strong
                  onClick={() => { setMode('login'); setErrorMsg(''); }}
                  style={{ color: 'var(--primary)', cursor: 'pointer' }}
                >
                  Sign in here
                </strong>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
