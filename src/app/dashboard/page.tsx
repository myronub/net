'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { getLoggedInUser } from '../../lib/session';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const router = useRouter();
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [js, setJs] = useState('');
  const [domain, setDomain] = useState('');

  useEffect(() => {
    const user = getLoggedInUser();
    if (!user) return router.push('/404');
    setDomain(user.domain);

    // fetch content from Supabase
    supabase
      .from('users')
      .select('content')
      .eq('website', user.domain)
      .single()
      .then(res => {
        if (res.data?.content) setHtml(res.data.content); // simple default
      });
  }, [router]);

  const save = async () => {
    const combined = `<style>${css}</style>${html}<script>${js}</script>`;
    await supabase.from('users').update({ content: combined }).eq('website', domain);
    alert('Saved!');
  };

  return (
    <div style={{ padding: '2rem', background: '#1E1E1E', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: '1rem' }}>Dashboard - {domain}</h1>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h2>HTML</h2>
          <textarea value={html} onChange={e => setHtml(e.target.value)} style={{ width: '100%', height: '150px', background: '#2c2c2c', color: '#fff', padding: '0.5rem' }} />
        </div>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h2>CSS</h2>
          <textarea value={css} onChange={e => setCss(e.target.value)} style={{ width: '100%', height: '150px', background: '#2c2c2c', color: '#fff', padding: '0.5rem' }} />
        </div>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h2>JS</h2>
          <textarea value={js} onChange={e => setJs(e.target.value)} style={{ width: '100%', height: '150px', background: '#2c2c2c', color: '#fff', padding: '0.5rem' }} />
        </div>
      </div>

      <button onClick={save} style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', border: '2px solid #fff', background: 'transparent', color: '#fff', cursor: 'pointer' }}>Save</button>

      <div style={{ marginTop: '2rem' }}>
        <h2>Live Preview</h2>
        <iframe
          srcDoc={`<style>${css}</style>${html}<script>${js}</script>`}
          style={{ width: '100%', height: '300px', background: '#fff' }}
        />
      </div>
    </div>
  );
}
