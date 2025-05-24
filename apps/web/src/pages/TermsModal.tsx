import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Ajuste o import conforme a exportação real do TermsService
import { TermsService } from '../service/TermsService';
import { AcceptedTopic } from '../schemas/TermsSchema';

interface TermsModalProps {
    onAccept: (newsletterOptIn: boolean) => void;
    initialNewsletterOptIn?: boolean;
    showBackOption?: boolean;
}

const TermsModal: React.FC<TermsModalProps> = ({
    onAccept,
    initialNewsletterOptIn = false,
    showBackOption = false
}) => {
    const [isChecked, setIsChecked] = useState(false);
    const [newsletterOptIn, setNewsletterOptIn] = useState(initialNewsletterOptIn);
    const [termsText, setTermsText] = useState<string>('');
    const navigate = useNavigate();
    const [termTopics, setTermTopics] = useState<AcceptedTopic[]>([]);


    useEffect(() => {
        const fetchActiveTerm = async () => {
            try {
                const term = await TermsService.getActiveTerm();
                console.log('Termo ativo:', term);
                setTermsText(term.text);

                // Inicializa os tópicos para controle de aceite do usuário
                const initialTopics: AcceptedTopic[] = term.topics.map(topic => ({
                    description: topic.description,
                    status: topic.status,
                    accepted: false, // inicia não aceito
                }));
                setTermTopics(initialTopics);

            } catch (error) {
                console.error('Erro ao buscar os termos ativos:', error);
            }
        };
        fetchActiveTerm();
    }, []);


    const handleAccept = () => {
        if (isChecked) {
            onAccept(newsletterOptIn);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '30px',
                maxWidth: '600px',
                width: '90%',
                maxHeight: '80vh',
                overflowY: 'auto',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
                <h2 style={{
                    color: '#026734',
                    textAlign: 'center',
                    marginBottom: '20px'
                }}>Termos e Condições de Uso</h2>

                <div style={{
                    marginBottom: '25px',
                    lineHeight: '1.6',
                    maxHeight: '50vh',
                    overflowY: 'auto',
                    paddingRight: '10px'
                }}>
                    {termsText ? (
                        <div dangerouslySetInnerHTML={{ __html: termsText }} />
                    ) : (
                        <p>Carregando termos...</p>
                    )}

                </div>

                <div style={{
                    margin: '20px 0',
                    padding: '15px',
                    backgroundColor: 'rgba(0,100,50,0.1)',
                    borderRadius: '4px'
                }}>
                    <h3>Concordância com os tópicos:</h3>
                    {termTopics.map((topic, index) => (
                        <label key={index} style={{
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            marginBottom: '10px'
                        }}>
                            <input
                                type="checkbox"
                                checked={topic.accepted}
                                onChange={() => {
                                    const newTopics = [...termTopics];
                                    newTopics[index].accepted = !newTopics[index].accepted;
                                    setTermTopics(newTopics);
                                }}
                                style={{
                                    marginRight: '10px',
                                    width: '18px',
                                    height: '18px',
                                    cursor: 'pointer'
                                }}
                                disabled={!topic} // bloqueia checkbox se for obrigatório? Ou deixa liberado? (opcional)
                            />
                            <span style={{ fontWeight: topic ? 'bold' : 'normal' }}>
                                {topic.description} {topic ? '(Obrigatório)' : '(Opcional)'}
                            </span>
                        </label>
                    ))}
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '15px',
                    flexWrap: 'wrap'
                }}>
                    {showBackOption && (
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#f5f5f5',
                                color: '#026734',
                                border: '1px solid #026734',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                transition: 'all 0.3s'
                            }}
                        >
                            Voltar
                        </button>
                    )}

                    <button
                        onClick={handleAccept}
                        disabled={!isChecked}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: isChecked ? '#026734' : '#cccccc',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: isChecked ? 'pointer' : 'not-allowed',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            transition: 'all 0.3s'
                        }}
                    >
                        {showBackOption ? 'Salvar Alterações' : 'Aceitar e Continuar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;
