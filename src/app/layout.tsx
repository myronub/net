'use client';

import { useState, useEffect, ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';
import '../globals.css'; // make sure this path is correct

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RootLayout({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Get session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for login/logout changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <html lang="en" style={{ height: '100%', width: '100%' }}>
      <body style={{
        margin: 0,
        padding: 0,
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#1E1E1E',
        color: '#fff',
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif"
      }}>
        {children}
      </body>
    </html>
  );
}
