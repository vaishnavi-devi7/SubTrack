import { useState } from 'react';
import API from '../api/api';

type LoginProps = {
  onLogin: () => void;
};

export default function Login({ onLogin }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async () => {
    try {
      if (isSignUp) {
        await API.post('/auth/register', { email, password });
        alert('Account created successfully ✅ Now log in.');
        setIsSignUp(false);
        setPassword('');
        return;
      }

      const res = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      alert('Login successful ✅');
      onLogin();
    } catch (err: any) {
      console.error(err);

      const message =
        err?.response?.data?.message ||
        (isSignUp ? 'Sign up failed ❌' : 'Login failed ❌');

      alert(message);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '430px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 14px 34px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1
            style={{
              margin: 0,
              marginBottom: '8px',
              color: '#1e3a8a',
              fontSize: '34px',
            }}
          >
            SubTrack
          </h1>

          <p
            style={{
              margin: 0,
              color: '#64748b',
              fontSize: '15px',
            }}
          >
            {isSignUp
              ? 'Create your account to start tracking subscriptions'
              : 'Login to manage all your digital subscriptions'}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            backgroundColor: '#eff6ff',
            padding: '6px',
            borderRadius: '14px',
            marginBottom: '22px',
          }}
        >
          <button
            onClick={() => setIsSignUp(false)}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 700,
              backgroundColor: !isSignUp ? '#60a5fa' : 'transparent',
              color: !isSignUp ? '#ffffff' : '#1e3a8a',
            }}
          >
            Sign In
          </button>

          <button
            onClick={() => setIsSignUp(true)}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 700,
              backgroundColor: isSignUp ? '#60a5fa' : 'transparent',
              color: isSignUp ? '#ffffff' : '#1e3a8a',
            }}
          >
            Sign Up
          </button>
        </div>

        <label
          style={{
            display: 'block',
            marginBottom: '8px',
            color: '#334155',
            fontWeight: 600,
          }}
        >
          Email
        </label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <label
          style={{
            display: 'block',
            marginBottom: '8px',
            color: '#334155',
            fontWeight: 600,
          }}
        >
          Password
        </label>
        <input
          type="password"
          placeholder={isSignUp ? 'Create a password' : 'Enter your password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button
          onClick={handleAuth}
          style={{
            width: '100%',
            padding: '13px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: '#2563eb',
            color: '#fff',
            fontWeight: 700,
            fontSize: '16px',
            cursor: 'pointer',
            marginTop: '8px',
          }}
        >
          {isSignUp ? 'Create Account' : 'Login'}
        </button>

        <p
          style={{
            textAlign: 'center',
            marginTop: '18px',
            color: '#64748b',
            fontSize: '14px',
          }}
        >
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span
            onClick={() => setIsSignUp(!isSignUp)}
            style={{
              color: '#2563eb',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </span>
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid #dbeafe',
  marginBottom: '16px',
  boxSizing: 'border-box',
  backgroundColor: '#ffffff',
  color: '#0f172a',
  fontSize: '15px',
};