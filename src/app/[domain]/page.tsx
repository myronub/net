'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DomainPage() {
  const { domain } = useParams<{ domain: string }>();
  const router = useRouter();
  const [siteCode, setSiteCode] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchSite = async () => {
      if (!domain) return;

      const { data, error } = await supabase
        .from('domains')
        .select('html, css, js')
        .eq('name', domain)
        .single();

      if (error || !data) {
        setNotFound(true);
        return;
      }

      const fullPage = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${domain}</title>
            <style>${data.css || ''}</style>
          </head>
          <body>
            ${data.html || ''}
            <script>${data.js || ''}</script>
          </body>
        </html>
      `;

      setSiteCode(fullPage);
    };

    fetchSite();
  }, [domain]);

  if (notFound) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1E1E1E',
          color: '#fff',
          fontFamily: 'sans-serif',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Giant low-opacity 404 in the background */}
        <h1
          style={{
            fontSize: '20rem',
            fontWeight: 'bold',
            color: 'rgba(255,255,255,0.05)',
            position: 'absolute',
            userSelect: 'none',
            pointerEvents: 'none',
            zIndex: 0
          }}
        >
          404
        </h1>

        {/* Foreground message */}
        <div style={{ zIndex: 1 }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            Oops! Can’t find that website...
          </h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.8, marginBottom: '2rem' }}>
            The domain <span style={{ color: '#ff85c1' }}>{domain}</span> doesn’t exist yet.
          </p>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '0.7rem 1.5rem',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(90deg,#ff85c1,#ff4081)',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(255,64,129,0.6)'
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!siteCode) return <p style={{ color: '#fff', textAlign: 'center' }}>Loading...</p>;

  return (
    <iframe
      srcDoc={siteCode}
      style={{
        width: '100%',
        height: '100vh',
        border: 'none',
        background: '#fff'
      }}
      sandbox="allow-scripts allow-same-origin"
    />
  );
}
