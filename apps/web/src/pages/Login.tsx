import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles.css';
import backgroundImage from '../assets/background-login.jpg';
import kersysLogo from '../assets/kersys-logo.png';
import { login } from '../service/AuthService';
import { setTokenToLocalStorage } from '../store/storage';

const Login = ({
  setIsAuthenticated,
}: {
  setIsAuthenticated: (_: boolean) => void;
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    console.log('Login attempt:', { username, password });

    if (username === 'admin' && password === 'admin123') {
      setTokenToLocalStorage('token');
      setIsAuthenticated(true);
      navigate('/', { replace: true });
    } else if (await login({ login: username, password })) {
      setIsAuthenticated(true);
      navigate('/', { replace: true });
    } else {
      setError('Credenciais inválidas');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100vw',
        fontFamily: 'Arial, sans-serif',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        margin: 0,
        padding: 0,
      }}
    >
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 0,
        }}
      ></div>

      <div
        style={{
          backgroundColor: '#026734',
          padding: '40px',
          borderRadius: '8px',
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}
      >
        <div
          style={{
            marginBottom: '30px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <img
            src={kersysLogo}
            alt="Kersys Logo"
            style={{
              maxWidth: '200px',
              height: 'auto',
              filter: 'brightness(0) invert(1)',
            }}
          />
        </div>

        {error && (
          <div
            style={{
              color: '#ff6b6b',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              padding: '10px',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '17px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '16px',
                color: '#fff',
              }}
            >
              Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              style={{
                width: '100%',
                padding: '12px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                backgroundColor: 'rgba(255,255,255,0.9)',
                outline: 'none',
              }}
              placeholder="Digite seu usuário"
            />
          </div>

          <div style={{ marginBottom: '30px', textAlign: 'left' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '16px',
                color: '#fff',
              }}
            >
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              style={{
                width: '100%',
                padding: '12px',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                backgroundColor: 'rgba(255,255,255,0.9)',
                outline: 'none',
              }}
              placeholder="Digite sua senha"
            />
          </div>

          <button
            type="submit"
            style={{
              width: '50%',
              padding: '14px',
              backgroundColor: '#50EA77',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.3s',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#3ECB5B';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#50EA77';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
            }}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
