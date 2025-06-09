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
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Auth Integration Demo</h1>

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
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Fetch Portability Data
        </button>
      )}

      {/* Step 5: Display user data */}
      {user && (
        <div className="bg-gray-100 p-4 rounded shadow">
          <h2 className="text-xl font-semibold">User Data</h2>
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
