'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLoggedInUser, logout } from '../lib/session';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomePage() {
  const router = useRouter();
  const [domainInput, setDomainInput] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [userDomain, setUserDomain] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [avatar, setAvatar] = useState('');
  const [websiteContent, setWebsiteContent] = useState('');

  useEffect(() => {
    const user = getLoggedInUser();
    if (user) {
      setLoggedIn(true);
      setUserDomain(user.domain);
      setAvatar(user.avatar || '');

      // fetch user's website content
      const fetchContent = async () => {
        const { data, error } = await supabase
          .from('users')
          .select('content')
          .eq('website', user.domain)
          .maybeSingle(); // <-- changed from .single() to maybeSingle()

        if (error) {
          console.error(error);
          return;
        }

        // If user hasn't created content yet, show default message
        setWebsiteContent(data?.content || `Maybe you should make a website!`);
      };

      fetchContent();
    }
  }, []);

  const viewDomain = () => {
    if (!domainInput) return;
    router.push(`/${domainInput}`);
  };

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    setUserDomain('');
    setUserMenuOpen(false);
    router.push('/');
  };

  const goToDashboard = () => router.push('/dashboard');
  const goToChat = () => router.push('/chat.taxi');

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1E1E1E',
      color: '#fff',
      fontFamily: 'sans-serif',
      padding: '2rem',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Mac-style navbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '3rem', width: '100%', maxWidth: '600px', position: 'relative' }}>
  <div style={{ display: 'flex', gap: '0.4rem' }}>
    <div style={macBtn('#ff5f56')} />
    <div style={macBtn('#ffbd2e')} />
    <div style={macBtn('#27c93f')} />
  </div>

  {/* input + Go button wrapper */}
  <div style={{ flex: 1, display: 'flex', gap: '0.5rem', position: 'relative' }}>
    <input
      type="text"
      placeholder="Type a website..."
      value={domainInput}
      onChange={e => setDomainInput(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && viewDomain()}
      style={{
        flex: 1,
        padding: '0.5rem 0.8rem',
        borderRadius: '12px',
        border: '2px solid #fff',
        background: '#1E1E1E',
        color: '#fff'
      }}
    />
    <button onClick={viewDomain} style={goBtn}>Go</button>
  </div>

  {/* User avatar */}
  {loggedIn && (
    <div style={{ marginLeft: '0.5rem', zIndex: 10 }}>
      <div
        onClick={() => setUserMenuOpen(!userMenuOpen)}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: avatar ? `url(${avatar}) center/cover` : '#2c2c2c',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s',
          border: '2px solid #fff'
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        {!avatar && <span style={{ color: '#fff', fontWeight: 'bold' }}>{userDomain[0]?.toUpperCase()}</span>}
      </div>

      {userMenuOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '36px',
          background: '#2c2c2c',
          borderRadius: '8px',
          padding: '1rem',
          minWidth: '200px',
          boxShadow: '0 0 10px rgba(0,0,0,0.5)'
        }}>
          <p style={{ marginBottom: '0.5rem' }}>Logged in as <strong>{userDomain}</strong></p>
          <button onClick={() => router.push('/settings.taxi')} style={menuBtn}>Settings</button>
          <button onClick={handleLogout} style={menuBtn}>Logout</button>
        </div>
      )}
    </div>
  )}
</div>

      {/* Welcome / website content */}
      <h1 style={{
        fontSize: '3rem',
        background: 'linear-gradient(90deg,#ff85c1,#ff4081)',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        textAlign: 'center',
        marginBottom: '1rem'
      }}>Welcome to CupidNet!</h1>

      <p style={{ fontSize: '1.2rem', textAlign: 'center', maxWidth: '500px', marginBottom: '2rem' }}>
        Broke? Want to test portfolio ideas? Check this out!
      </p>

      {loggedIn && (
        <div style={{ fontSize: '1.2rem', textAlign: 'center', maxWidth: '500px', marginBottom: '2rem' }}>
          {websiteContent ? websiteContent : <em>Maybe you should make a website!</em>}
        </div>
      )}

      {!loggedIn ? (
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button style={gradientBtn} onClick={() => router.push('/register.taxi')}>Register</button>
          <button style={gradientBtn} onClick={() => router.push('/sign.in')}>Login</button>
        </div>
      ) : (
        <div style={{ marginTop: '2rem', textAlign: 'center', maxWidth: '500px' }}>
          <p>
            Lost? Go to the{' '}
            <span style={{ textDecoration: 'underline', cursor: 'pointer', color: '#ff85c1' }} onClick={goToDashboard}>
              dashboard
            </span>{' '}
            or{' '}
            <span style={{ textDecoration: 'underline', cursor: 'pointer', color: '#ff85c1' }} onClick={goToChat}>
              chat with others
            </span>.
          </p>
        </div>
      )}
    </div>
  );
}

const macBtn = (color: string) => ({
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  background: color,
  display: 'inline-block'
});

const goBtn: React.CSSProperties = {
  padding: '0.5rem 1rem',
  borderRadius: '8px',
  border: 'none',
  background: 'linear-gradient(90deg,#ff85c1,#ff4081)',
  color: '#fff',
  fontWeight: 'bold',
  cursor: 'pointer'
};

const gradientBtn: React.CSSProperties = {
  padding: '0.6rem 1.2rem',
  borderRadius: '8px',
  border: '2px solid #fff',
  background: 'transparent',
  color: '#fff',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'all 0.2s'
};

const menuBtn: React.CSSProperties = {
  padding: '0.4rem 0.8rem',
  borderRadius: '6px',
  border: '2px solid #fff',
  background: 'transparent',
  color: '#fff',
  cursor: 'pointer',
  width: '100%',
  marginBottom: '0.3rem'
};
