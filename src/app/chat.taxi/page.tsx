'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getLoggedInUser } from '../../lib/session';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Chat() {
  const router = useRouter();
  const [user, setUser] = useState<{ domain: string } | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check login & fetch messages
  useEffect(() => {
    const u = getLoggedInUser();
    if (!u) return router.push('/404');
    setUser({ domain: u.domain });

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }
      if (data) setMessages(data);
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [router]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;

    const { error } = await supabase.from('messages').insert({
      username: user.domain,
      text: input.trim(),
      created_at: new Date().toISOString()
    });

    if (error) {
      console.error('Error sending message:', error);
      return;
    }

    setInput('');
  };

  const goToUserWebsite = (username: string) => {
    router.push(`/${username}`);
  };

  return (
    <div style={{
      padding: '2rem',
      background: '#121212',
      minHeight: '100vh',
      color: '#fff',
      fontFamily: 'sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#ff85c1' }}>Global Chat</h1>

      <div style={{
        flex: 1,
        width: '100%',
        maxWidth: '600px',
        background: '#1e1e1e',
        borderRadius: '12px',
        padding: '1rem',
        overflowY: 'auto',
        maxHeight: '60vh',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)'
      }}>
        {messages.length === 0 && <p style={{ textAlign: 'center', color: '#888' }}>No messages yet. Start chatting!</p>}
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: msg.avatar || '#ff85c1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '0.8rem',
              cursor: msg.avatar ? 'pointer' : 'default'
            }}
              onClick={() => msg.avatar && goToUserWebsite(msg.username)}
            >
              {!msg.avatar && msg.username[0].toUpperCase()}
            </div>
            <div style={{
              background: '#2c2c2c',
              padding: '0.5rem 0.8rem',
              borderRadius: '8px',
              wordBreak: 'break-word',
              flex: 1
            }}>
              <strong
                style={{ color: '#ff85c1', cursor: 'pointer' }}
                onClick={() => goToUserWebsite(msg.username)}
              >
                {msg.username}
              </strong>: {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '600px' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: '0.6rem 1rem',
            borderRadius: '8px',
            border: 'none',
            outline: 'none',
            background: '#2c2c2c',
            color: '#fff'
          }}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: '0.6rem 1rem',
            borderRadius: '8px',
            border: '2px solid #ff85c1',
            background: 'transparent',
            color: '#ff85c1',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#ff85c1'; e.currentTarget.style.color = '#121212'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ff85c1'; }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
