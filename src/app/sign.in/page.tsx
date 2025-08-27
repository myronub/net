'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { setLoggedInUser } from '../../lib/session';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const router = useRouter();
  const [domain, setDomain] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!domain || !password) {
      setError('Fill all fields');
      return;
    }

    const { data, error: loginError } = await supabase
      .from('users')
      .select('*')
      .eq('website', domain.trim())
      .eq('pw', password.trim())
      .maybeSingle(); // safer than .single()

    if (loginError) {
      console.error('Supabase error:', loginError);
      setError('Server error, try again');
      return;
    }

    if (!data) {
      setError('Invalid login credentials');
      return;
    }

    setLoggedInUser({
      domain: data.website,
      avatar: data.avatar || ''
    });

    router.push('/');
  };

  return (
    <div style={container}>
      <h1 style={{ marginBottom: '1rem' }}>Login</h1>
      <input
        style={inputStyle}
        placeholder="Domain"
        value={domain}
        onChange={e => setDomain(e.target.value)}
      />
      <input
        style={inputStyle}
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <button style={buttonStyle} onClick={handleLogin}>Login</button>
      {error && <p style={{ color: 'red', marginTop: '0.5rem' }}>{error}</p>}
    </div>
  );
}

const container: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#1E1E1E',
  color: '#fff',
  gap: '1rem',
  padding: '2rem'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '300px',
  padding: '0.8rem',
  marginBottom: '1rem',
  borderRadius: '8px',
  border: 'none',
  outline: 'none',
  background: '#3c3c3c',
  color: '#fff'
};

const buttonStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '300px',
  padding: '0.8rem',
  borderRadius: '8px',
  border: 'none',
  background: 'linear-gradient(90deg,#ff85c1,#ff4081)',
  color: '#fff',
  fontWeight: 'bold',
  cursor: 'pointer'
};
