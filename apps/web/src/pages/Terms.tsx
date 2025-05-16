import React from 'react';
import { useNavigate } from 'react-router-dom';

const TermsPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#f5f5f5',
            padding: '20px',
            lineHeight: '1.6'
        }}>
            {/* Cabeçalho */}
            <header style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '30px'
            }}>
            </header>

            {/* Conteúdo dos Termos */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '40px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                maxWidth: '900px',
                margin: '0 auto',
                flex: 1
            }}>
                <h1 style={{
                    color: '#026734',
                    textAlign: 'center',
                    marginBottom: '40px',
                    fontSize: '28px'
                }}>Termos e Condições de Uso da Plataforma Kersys</h1>

                <div style={{ fontSize: '16px' }}>
                    {/* Seção 1 - Introdução */}
                    <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: '#026734', marginBottom: '15px', fontSize: '22px' }}>1. Introdução</h2>
                        <p>
                            Bem-vindo(a) à plataforma Kersys. Estes Termos e Condições regulam o uso do nosso sistema e serviços
                            relacionados. Ao acessar ou utilizar a plataforma, você concorda em ficar vinculado(a) por estes Termos.
                        </p>
                    </section>

                    {/* Seção 2 - Definições */}
                    <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: '#026734', marginBottom: '15px', fontSize: '22px' }}>2. Definições</h2>
                        <p>Para fins destes Termos:</p>
                        <ul style={{ marginLeft: '20px', listStyleType: 'disc' }}>
                            <li><strong>"Plataforma"</strong> refere-se ao sistema Kersys e todos os seus módulos</li>
                            <li><strong>"Usuário"</strong> é qualquer pessoa física que acessa ou utiliza a plataforma</li>
                            <li><strong>"Dados"</strong> são todas as informações inseridas na plataforma pelo Usuário</li>
                        </ul>
                    </section>

                    {/* Seção 3 - Cadastro e Acesso */}
                    <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: '#026734', marginBottom: '15px', fontSize: '22px' }}>3. Cadastro e Acesso</h2>
                        <p>3.1. O acesso à plataforma requer cadastro prévio com informações verdadeiras e atualizadas.</p>
                        <p>3.2. Cada usuário é responsável por manter a confidencialidade de suas credenciais de acesso.</p>
                        <p>3.3. A Kersys reserva-se o direito de suspender contas com informações falsas ou em caso de violação destes Termos.</p>
                    </section>

                    {/* Seção 4 - Uso Adequado */}
                    <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: '#026734', marginBottom: '15px', fontSize: '22px' }}>4. Uso Adequado</h2>
                        <p>O Usuário concorda em:</p>
                        <ul style={{ marginLeft: '20px', listStyleType: 'disc' }}>
                            <li>Utilizar a plataforma apenas para fins legítimos e autorizados</li>
                            <li>Não realizar atividades que possam prejudicar o funcionamento do sistema</li>
                            <li>Não tentar acessar dados de outros usuários sem autorização</li>
                            <li>Não utilizar bots, scrapers ou outros métodos automatizados sem consentimento</li>
                        </ul>
                    </section>

                    {/* Seção 5 - Propriedade Intelectual */}
                    <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: '#026734', marginBottom: '15px', fontSize: '22px' }}>5. Propriedade Intelectual</h2>
                        <p>5.1. Todo o conteúdo da plataforma, exceto dados dos usuários, é propriedade da Kersys.</p>
                        <p>5.2. Os usuários mantêm os direitos sobre seus dados, mas concedem à Kersys licença para processá-los conforme os serviços contratados.</p>
                    </section>

                    {/* Seção 6 - Responsabilidades */}
                    <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: '#026734', marginBottom: '15px', fontSize: '22px' }}>7. Responsabilidades</h2>
                        <p>7.1. A Kersys não se responsabiliza por:</p>
                        <ul style={{ marginLeft: '20px', listStyleType: 'disc' }}>
                            <li>Uso indevido da plataforma por terceiros</li>
                            <li>Interrupções temporárias por manutenção ou fatores externos</li>
                            <li>Dados inseridos incorretamente pelos usuários</li>
                        </ul>
                        <p>7.2. O usuário é integralmente responsável por:</p>
                        <ul style={{ marginLeft: '20px', listStyleType: 'disc' }}>
                            <li>Precisão e veracidade dos dados fornecidos</li>
                            <li>Conteúdo que compartilha através da plataforma</li>
                            <li>Manutenção da segurança de suas credenciais</li>
                        </ul>
                    </section>

                    {/* Seção 7 - Modificações */}
                    <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: '#026734', marginBottom: '15px', fontSize: '22px' }}>8. Modificações nos Termos</h2>
                        <p>
                            A Kersys poderá atualizar estes Termos periodicamente. Alterações significativas serão comunicadas
                            com antecedência. O uso continuado da plataforma após mudanças constitui aceitação dos novos Termos.
                        </p>
                    </section>

                    {/* Seção 8 - Rescisão */}
                    <section style={{ marginBottom: '30px' }}>
                        <h2 style={{ color: '#026734', marginBottom: '15px', fontSize: '22px' }}>9. Rescisão</h2>
                        <p>
                            A Kersys pode suspender ou encerrar o acesso de usuários que violarem estes Termos, sem prejuízo
                            de outras medidas legais cabíveis.
                        </p>
                    </section>

                    {/* Seção 9 - Disposições Finais */}
                    <section style={{ marginBottom: '40px' }}>
                        <h2 style={{ color: '#026734', marginBottom: '15px', fontSize: '22px' }}>10. Disposições Finais</h2>
                        <p>10.1. Estes Termos são regidos pelas leis brasileiras.</p>
                        <p>10.2. Eventuais disputas serão resolvidas no foro da comarca da sede da Kersys.</p>
                        <p>10.3. Se qualquer disposição destes Termos for considerada inválida, as demais permanecem em pleno vigor.</p>
                    </section>

                    {/* Data de atualização */}
                    <p style={{
                        fontStyle: 'italic',
                        borderTop: '1px solid #eee',
                        paddingTop: '20px',
                        textAlign: 'center'
                    }}>
                        Última atualização: 13 de Maio de 2025
                    </p>
                </div>
            </div>

            {/* Rodapé com botão de voltar */}
            <footer style={{
                textAlign: 'center',
                marginTop: '30px',
                padding: '20px'
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: '#026734',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        transition: 'background-color 0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#024526'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#026734'}
                >
                    Voltar
                </button>
            </footer>
        </div>
    );
};

export default TermsPage;