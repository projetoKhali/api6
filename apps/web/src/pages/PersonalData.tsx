import React, { useState, useEffect } from 'react';
import DynamicForm from '../components/FormsComponent';
import { FieldSchema } from '../schemas/FormsSchema';
import { getUser, updateUser } from '../service/UserService';
import { NewUser, User } from '../schemas/UserSchema';

const editFormSchema: FieldSchema[] = [
    { name: 'name', label: 'Nome Completo', type: 'text' },
    { name: 'login', label: 'Login', type: 'text' },
    { name: 'email', label: 'E-mail', type: 'text' },
    { name: 'password', label: 'Nova Senha', type: 'text' },
    { name: 'confirmPassword', label: 'Confirmar Senha', type: 'text' },
];

const EditUserPage = ({ userId }: { userId: number }) => {
    const [currentUser, setCurrentUser] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState(true);

    const loadUser = async () => {
        setIsLoading(true);
        try {
            const user = await getUser(String(userId));
            setCurrentUser({
                id: user.id,
                name: user.name,
                login: user.login,
                email: user.email,
            });
        } catch (error) {
            console.error('Erro ao carregar usuário:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, [userId]);

    const handleEditSubmit = async (formData: Record<string, string>) => {
        try {
            const userData: Partial<NewUser> = {
                name: formData.name,
                login: formData.login,
                email: formData.email
            };
            // if (formData.password && formData.password === formData.confirmPassword) {
            //     userData.password = formData.password;
            // } else {
            //     alert('As senhas não coincidem ou estão vazias.');
            //     return;
            // }
            await updateUser(String(userId), userData);
            alert('Usuário atualizado com sucesso!');
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
        }
    };

    const resetForm = () => {
        loadUser();
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
                </>
            )}
        </div>
    );
};

export default EditUserPage;
