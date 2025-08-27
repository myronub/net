'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getLoggedInUser } from '../../lib/session';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ uid: string, domain: string, avatar?: string } | null>(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'other'>('profile');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const u = getLoggedInUser();
    if (!u) return router.push('/404');
    setUser(u);
    setAvatarUrl(u.avatar || '');
  }, [router]);

  const updateSettings = async () => {
    if (!user || !user.uid) return;

    setSaving(true);
    const { error } = await supabase
      .from('users')
      .update({ avatar: avatarUrl })
      .eq('uid', user.uid);

    if (error) console.error('Error updating settings:', error);
    else setUser(prev => prev ? { ...prev, avatar: avatarUrl } : prev);

    setSaving(false);
  };

  if (!user) return null; // Loading state

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1E1E1E',
      color: '#fff',
      fontFamily: 'sans-serif',
      padding: '2rem'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ff85c1' }}>Settings</h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          style={{
            padding: '0.5rem 1rem',
            borderBottom: activeTab === 'profile' ? '2px solid #ff85c1' : '2px solid transparent',
            background: 'transparent',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          style={{
            padding: '0.5rem 1rem',
            borderBottom: activeTab === 'other' ? '2px solid #ff85c1' : '2px solid transparent',
            background: 'transparent',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onClick={() => setActiveTab('other')}
        >
          Other
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
          <label>Profile Picture URL:</label>
          <input
            type="text"
            value={avatarUrl}
            onChange={e => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.png"
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '2px solid #fff',
              background: '#2c2c2c',
              color: '#fff'
            }}
          />
          {avatarUrl && (
            <img src={avatarUrl} alt="Avatar Preview" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
          )}
          <button
            onClick={updateSettings}
            disabled={saving}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              border: '2px solid #ff85c1',
              background: saving ? '#555' : 'transparent',
              color: '#ff85c1',
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              width: 'fit-content'
            }}
            onMouseEnter={e => { if(!saving) { e.currentTarget.style.background = '#ff85c1'; e.currentTarget.style.color = '#121212'; } }}
            onMouseLeave={e => { if(!saving) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ff85c1'; } }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}

      {activeTab === 'other' && (
        <p style={{ color: '#888' }}>Other settings coming soon...</p>
      )}
    </div>
  );
}
