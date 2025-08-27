'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { setLoggedInUser } from '../../lib/session';


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegisterPage() {
  const router = useRouter();
  const [domain, setDomain] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!domain || !password) return setError('Fill all fields');

    const { data: existing } = await supabase
      .from('users')
      .select('website')
      .eq('website', domain)
      .single();

    if (existing) return setError('Domain already taken');

    const { error: insertError } = await supabase
      .from('users')
      .insert({
        website: domain,
        pw: password,
        content: `<h1>Hello world, this is ${domain}!</h1>`
      });

    if (insertError) return setError(insertError.message);

    // Save login persistently
    setLoggedInUser(domain, password);

    router.push('/');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#1E1E1E', color: '#fff', gap: '1rem', padding: '2rem' }}>
      <h1>Register</h1>
      <input placeholder="Domain" value={domain} onChange={e => setDomain(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button onClick={handleRegister}>Register</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
