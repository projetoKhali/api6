import { logout } from '../service/AuthService';
import { useNavigate } from 'react-router-dom';
import {
  clearLocalStorageData,
} from '../store/storage';
import { useEffect, useState } from 'react';

interface NavbarProps {
  setIsAuthenticated: (auth: boolean) => void;
}

const Navbar = ({ setIsAuthenticated }: NavbarProps) => {
  const [dashboard, setDashboard] = useState(false);
  const [register, setRegister] = useState(false);
  const [analitic, setAnalitic] = useState(false);
  const [terms, setTerms] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const permissions = localStorage.getItem('khali_api6:permissions');
    if (permissions) {
      const parsedPermissions = JSON.parse(permissions).map((p: string) =>
        p.trim()
      ); // <- aqui
      setDashboard(parsedPermissions.includes('dashboard'));
      setRegister(parsedPermissions.includes('register'));
      setAnalitic(parsedPermissions.includes('analitic'));
      setTerms(parsedPermissions.includes('terms'));
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      clearLocalStorageData();
      navigate('/login');
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    }
  };

  return (
    <main
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
        backgroundColor: '#026734',
      }}
    >
      {/* Logo */}
      <div>
        <a href="/">
          <img src="/kersys-logo.png" alt="Logo" />
        </a>
      </div>

      {/* Links */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          color: '#fff',
          flex: 1,
          marginLeft: '40px',
        }}
      >
        {/* Add conditional rendering here if needed, for example: */}
        {dashboard && (
          <a
            href="/dashboard"
            style={{ textDecoration: 'none', color: '#fff' }}
          >
            Dashboard
          </a>
        )}
        {register && (
          <>
            <a
              href="/register"
              style={{ textDecoration: 'none', color: '#fff' }}
            >
              Cadastro
            </a>
            <a href="/user" style={{ textDecoration: 'none', color: '#fff' }}>
              Usuários
            </a>
          </>
        )}

        {analitic && (
          <>
            <a
              href="/prevision"
              style={{ textDecoration: 'none', color: '#fff' }}
            >
              Previsões
            </a>
            <a
              href="/projection"
              style={{ textDecoration: 'none', color: '#fff' }}
            >
              Projeção
            </a>
            <a href="/report" style={{ textDecoration: 'none', color: '#fff' }}>
              Relatório
            </a>
          </>
        )}

        <a href="/user-data" style={{ textDecoration: 'none', color: '#fff' }}>
          Informações Pessoais
        </a>
      </div>

      {/* Botão sair */}
      <button
        onClick={handleLogout}
        style={{
          backgroundColor: 'transparent',
          color: '#fff',
          border: '1px solid #fff',
          padding: '4px 10px',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '4px',
        }}
      >
        Sair
      </button>
    </main>
  );
};

export default Navbar;
