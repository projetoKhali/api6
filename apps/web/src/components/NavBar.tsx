import { logout } from '../service/AuthService';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  setIsAuthenticated: (auth: boolean) => void;
}

const Navbar = ({ setIsAuthenticated }: NavbarProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      navigate('/login');
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    }
  };

  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'row',
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

      {/* Links + Logout */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '40%',
          justifyContent: 'space-evenly',
          padding: '20px',
          color: '#fff',
          gap: '24px',
        }}
      >
        <a href="/dashboard" style={{ textDecoration: 'none', color: '#fff' }}>
          Dashboard
        </a>
        <div style={{ height: '35px', width: '2px', backgroundColor: '#fff' }} />
        <a href="/prevision" style={{ textDecoration: 'none', color: '#fff' }}>
          Previsões
        </a>
        <div style={{ height: '35px', width: '2px', backgroundColor: '#fff' }} />
        <a href="/projection" style={{ textDecoration: 'none', color: '#fff' }}>
          Projeção
        </a>
        <div style={{ height: '35px', width: '2px', backgroundColor: '#fff' }} />
        <a href="/register" style={{ textDecoration: 'none', color: '#fff' }}>
          Cadastro
        </a>
        <div style={{ height: '35px', width: '2px', backgroundColor: '#fff' }} />
        <a href="/user" style={{ textDecoration: 'none', color: '#fff' }}>
          Usuários
        </a>
        <div style={{ height: '35px', width: '2px', backgroundColor: '#fff' }} />

        {/* Botão de logout */}
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: 'transparent',
            color: '#fff',
            border: '1px solid #fff',
            padding: '4px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginLeft: '24px',
            marginTop: '-2px',
          }}
        >
          Sair
        </button>
        <div
          style={{
            height: '35px',
            width: '3px',
            backgroundColor: '#fff',
          }}
        ></div>
        <a
          href="/user-data"
          style={{ textDecoration: 'none', color: '#fff' }}
        >
          Informações Pessoais
        </a>
      </div>
    </main>
  );
};

export default Navbar;

