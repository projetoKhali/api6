import { useState, useEffect } from 'react';
import DynamicForm from '../components/FormsComponent';
import { FieldSchema } from '../schemas/FormsSchema';
import { getUser, updateUser } from '../service/UserService';
import { NewUser } from '../schemas/UserSchema';
import { useNavigate } from 'react-router-dom';
import { getLocalStorageData } from '../store/storage';

const editFormSchema: FieldSchema[] = [
  { name: 'name', label: 'Nome Completo', type: 'text' },
  { name: 'login', label: 'Login', type: 'text' },
  { name: 'email', label: 'E-mail', type: 'text' },
  { name: 'password', label: 'Nova Senha', type: 'password' },
  { name: 'confirmPassword', label: 'Confirmar Senha', type: 'password' },
];

const EditUserPage = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadUser = async () => {
    if (userId) {
      setIsLoading(true);
      const user = await getUser(userId);
      setCurrentUser({
        id: user.id,
        name: user.name,
        login: user.login,
        email: user.email,
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [userId]);

  useEffect(() => {
    const storedUserId = getLocalStorageData()?.id || null;
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      console.error('ID do usuário não encontrado no localStorage.');
      navigate('/login');
    }
  }, []);

  const handleEditSubmit = async (formData: Record<string, string>) => {
    if (userId) {
      const userData: Partial<NewUser> = {
        name: formData.name,
        login: formData.login,
        email: formData.email,
      };
      if (formData.password) {
        if (formData.password !== formData.confirmPassword) {
          alert('As senhas não coincidem.');
          return;
        }
        userData.password = formData.password;
      }
      await updateUser(userId, userData);
      alert('Usuário atualizado com sucesso!');
    }
  };

  const resetForm = () => {
    loadUser();
  };

  const handleTermsClick = () => {
    navigate('/terms-acceptance');
  };

  return (
    <div
      className="edit-user-container"
      style={{
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '80vh',
        padding: '20px',
        gap: '20px',
      }}
    >
      <h2>Editar Usuário</h2>
      {isLoading ? (
        <p>Carregando dados do usuário...</p>
      ) : (
        <>
          <DynamicForm
            schema={editFormSchema}
            initialValues={currentUser}
            onSubmit={handleEditSubmit}
          />
          {/* Botão para termos de aceitação */}
          <button
            onClick={handleTermsClick}
            style={{
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '20px',
            }}
          >
            Editar Termos de Aceitação
          </button>
        </>
      )}
    </div>
  );
};

export default EditUserPage;
