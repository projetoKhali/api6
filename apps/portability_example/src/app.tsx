import { useEffect, useState, useRef } from 'react';
import { login } from './service/auth';
import {
  getPortabilityButton,
  getPortabilityData,
} from './service/portability';
import { User } from './schemas/user';

const App = () => {
  const [clientLoggedIn, setClientLoggedIn] = useState('');
  const [buttonHtml, setButtonHtml] = useState<string | null>(null);
  const [portabilityToken, setPortabilityToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Step 1: Authenticate external client
  useEffect(() => {
    const authenticate = async () => {
      try {
        setClientLoggedIn(
          await login({
            login: 'canva',
            password: 'secret',
          })
        );
      } catch (err) {
        console.error('Failed to authenticate external client', err);
      }
    };

    authenticate();
  }, []);

  // Step 2: Fetch login button HTML
  useEffect(() => {
    if (!clientLoggedIn) return;

    const fetchButton = async () => {
      try {
        const html = await getPortabilityButton(clientLoggedIn);
        setButtonHtml(html);
      } catch (err) {
        console.error('Failed to fetch login button', err);
      }
    };

    fetchButton();
  }, [clientLoggedIn]);

  // Step 3: Capture portability_token via postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data === 'object' && event.data?.portability_token) {
        setPortabilityToken(event.data.portability_token);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Step 4: Fetch data using portability_token
  const fetchPortabilityData = async () => {
    if (!portabilityToken) return;

    try {
      const userData = await getPortabilityData(portabilityToken);
      setUser(userData);
    } catch (err) {
      console.error('Failed to fetch portability data', err);
    }
  };

  return (
    <div
      style={{
        padding: '16px',
        maxWidth: '640px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}
    >
      <h1
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
        }}
      >
        Auth Integration Demo
      </h1>

      {/* Step 2: Render fetched button HTML */}
      {buttonHtml && (
        <div
          ref={containerRef}
          dangerouslySetInnerHTML={{ __html: buttonHtml }}
        />
      )}

      {/* Step 4: Button to fetch data */}
      {portabilityToken && !user && (
        <button
          onClick={fetchPortabilityData}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor = '#1e40af')
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor = '#2563eb')
          }
        >
          Fetch Portability Data
        </button>
      )}

      {/* Step 5: Display user data */}
      {user && (
        <div
          style={{
            backgroundColor: '#f3f4f6',
            padding: '16px',
            borderRadius: '4px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '600',
              marginBottom: '8px',
            }}
          >
            User Data
          </h2>
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Username:</strong> {user.login}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
