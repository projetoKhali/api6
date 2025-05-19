import { useState, useEffect } from 'react';
import DynamicForm from '../components/FormsComponent';
import TableComponent from '../components/TableComponent';
import { FieldSchema } from '../schemas/FormsSchema';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../service/UserService';
import { User, NewUser } from '../schemas/UserSchema';

// Dados mockados para teste
const mockUsers: User[] = [
  {
    id: 1,
    name: 'João Silva',
    login: 'joao.silva',
    email: 'joao@example.com',
    version_terms: '1.0',
    permission_id: 1,
  },
  {
    id: 2,
    name: 'Maria Souza',
    login: 'maria.souza',
    email: 'maria@example.com',
    version_terms: '1.0',
    permission_id: 2,
    disabled_since: '2023-01-01',
  },
  {
    id: 3,
    name: 'Carlos Oliveira',
    login: 'carlos.oliveira',
    email: 'carlos@example.com',
    version_terms: '1.1',
    permission_id: 1,
  },
];

// Função mock para getUsers
const mockGetUsers = async (page: number, size: number) => {
  return {
    items: mockUsers,
    total: mockUsers.length,
    totalPages: page,
    size: size,
  };
};

// Schema para cadastro de usuários
const registerFormSchema: FieldSchema[] = [
  { name: 'name', label: 'Nome Completo', type: 'text' },
  { name: 'login', label: 'Nome de Usuário', type: 'text' },
  { name: 'email', label: 'E-mail', type: 'text' },
  { name: 'password', label: 'Senha', type: 'text' },
];

// Schema para edição de usuários
const editFormSchema: FieldSchema[] = [
  { name: 'name', label: 'Nome Completo', type: 'text' },
  { name: 'login', label: 'Nome de Usuário', type: 'text' },
  { name: 'email', label: 'E-mail', type: 'text' },
  {
    name: 'permission_id',
    label: 'Permissão',
    type: 'text',
  },
];

const tableSchema = [
  { key: 'name', label: 'Nome', type: 'text' as const },
  { key: 'email', label: 'E-mail', type: 'text' as const },
  { key: 'login', label: 'Usuário', type: 'text' as const },
  { key: 'disabled_since', label: 'Status', type: 'text' as const },
  { key: 'actions', label: 'Ações', type: 'actions' as const },
];

const UserManagementPage = () => {
  // Estado inicial
  const [users, setUsers] = useState<User[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(false);

  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
      loadUsers();
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
      loadUsers();
    }
  };

  // Carrega os usuários
  const loadUsers = async () => {
    setIsLoading(true);
    let response;
    if (useMockData) {
      response = await mockGetUsers(0, 50);
    } else {
      response = await getUsers(0, 50);
      setTotalPages(response.totalPages)
    }
    setUsers(response.items);
    setIsLoading(false);
  };

  // Efeito para carregar os dados iniciais
  useEffect(() => {
    loadUsers();
  }, [useMockData]);

  // Manipuladores de eventos
  const handleRegisterSubmit = async (formData: Record<string, string>) => {
    const newUser: NewUser = {
      name: formData.name,
      login: formData.login,
      email: formData.email,
      password: formData.password,
      version_terms: '1.0',
      permission_id: 1,
    };
    await createUser(newUser);
    await loadUsers();
  };

  const handleEditSubmit = async (formData: Record<string, string>) => {
    if (currentUser.id) {
      const userData: Partial<User> = {
        name: formData.name,
        login: formData.login,
        email: formData.email,
        permission_id: Number(formData.permission_id),
      };
      await updateUser(currentUser.id, userData);
      await loadUsers();
      resetForm();
    }
  };

  const handleEdit = (row: Record<string, any>) => {
    const user: User = {
      id: Number(row.id),
      name: row.name,
      login: row.login,
      email: row.email,
      version_terms: row.version_terms_agreement || '1.0',
      permission_id: Number(row.permission_id),
      disabled_since: row.disabled_since,
    };

    console.log('Editando usuário:', user);
    setIsEditing(true);

    // Atualize o estado corretamente
    setCurrentUser({
      id: user.id ? user.id.toString() : '',
      name: user.name,
      login: user.login,
      email: user.email,
      permission_id: user.permission_id.toString(),
    });
  };

  const handleDelete = async (id: number) => {
    if (
      currentUser.id &&
      window.confirm('Tem certeza que deseja excluir este usuário?')
    ) {
      await deleteUser(id.toString());
      await loadUsers();
      resetForm();
    }
  };

  const resetForm = () => {
    setCurrentUser({});
    setIsEditing(false);
  };

  // Transforma os dados para a tabela
  const tableData = users.map((user) => ({
    ...user,
    disabled_since: user.disabled_since ? 'Desativado' : 'Ativo',
    actions: user.id,
  }));

  return (
    <div
      className="user-management-container"
      style={{
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '100vh',
        padding: '20px',
        gap: '20px',
      }}
    >
      <div
        className="form-section"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          width: '20%',
          height: '100%',
        }}
      >
        {!isEditing ? (
          <>
            <h2>Cadastrar Usuário</h2>
            <DynamicForm
              schema={registerFormSchema}
              initialValues={{}}
              onSubmit={handleRegisterSubmit}
            />
          </>
        ) : (
          <>
            <h2>Editar Usuário</h2>
            <DynamicForm
              schema={editFormSchema}
              initialValues={currentUser}
              onSubmit={handleEditSubmit}
            />
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
              <button
                onClick={resetForm}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d', // cinza para "cancelar"
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Cancelar Edição
              </button>

              <button
                onClick={async () => await handleDelete(Number(currentUser.id))}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc3545', // vermelho para "excluir"
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Excluir Usuário
              </button>
            </div>
          </>
        )}
      </div>

      <div
        className="table-section"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          width: '78%',
          height: '100%',
        }}
      >
        <h2>Lista de Usuários</h2>
        {isLoading ? (
          <p>Carregando usuários...</p>
        ) : (
          <>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'space-between',
                padding: 10,
                marginBlock: 10,
              }}
            >
              <button
                style={{ margin: 4 }}
                onClick={handlePreviousPage}
                disabled={page === 1}
              >
                Anterior
              </button>
              <p
                style={{
                  margin: 4,
                  textAlign: 'center',
                  alignContent: 'center',
                }}
              >
                Página {page} de {totalPages}
              </p>
              <button
                style={{ margin: 4 }}
                onClick={handleNextPage}
                disabled={page === totalPages}
              >
                Próxima
              </button>
            </div>
            <TableComponent
              schema={tableSchema}
              data={tableData}
              onEdit={(row) => handleEdit(row)}
              onRowSelect={(row) => handleEdit(row)}
              style={{ width: '100%' }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;
