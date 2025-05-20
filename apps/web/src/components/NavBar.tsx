import { logout } from '../service/AuthService';
import { useNavigate } from 'react-router-dom';
import { clearLocalStorageData, clearUserIdFromLocalStorage } from '../store/storage';

interface NavbarProps {
  setIsAuthenticated: (auth: boolean) => void;
}

const Navbar = ({ setIsAuthenticated }: NavbarProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      clearUserIdFromLocalStorage();
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
        <a href="/dashboard" style={{ textDecoration: 'none', color: '#fff' }}>Dashboard</a>
        <a href="/prevision" style={{ textDecoration: 'none', color: '#fff' }}>Previsões</a>
        <a href="/projection" style={{ textDecoration: 'none', color: '#fff' }}>Projeção</a>
        <a href="/register" style={{ textDecoration: 'none', color: '#fff' }}>Cadastro</a>
        <a href="/user" style={{ textDecoration: 'none', color: '#fff' }}>Usuários</a>
        <a href="/user-data" style={{ textDecoration: 'none', color: '#fff' }}>Informações Pessoais</a>
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

