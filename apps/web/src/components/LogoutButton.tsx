import { useNavigate } from 'react-router-dom';
import { logout } from '../service/AuthService';

interface Props {
    setIsAuthenticated: (auth: boolean) => void;
}

export const LogoutButton = ({ setIsAuthenticated }: Props) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            setIsAuthenticated(false);
            navigate('/login');
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    };

    return <button onClick={handleLogout}>Sair</button>;
};
