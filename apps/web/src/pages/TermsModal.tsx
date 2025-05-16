import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();

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
                    <p>
                        Bem-vindo à plataforma Kersys. Antes de continuar, por favor leia e concorde com nossos Termos e Condições.
                    </p>

                    {/* Conteúdo resumido dos termos */}
                    <p style={{ marginTop: '15px' }}>
                        <strong>1. Aceitação dos Termos:</strong> Ao utilizar nossa plataforma, você concorda com estes termos.
                    </p>
                    <p>
                        <strong>2. Uso Adequado:</strong> Você concorda em utilizar a plataforma apenas para fins legais.
                    </p>
                    <p>
                        <strong>3. Privacidade:</strong> Respeitamos sua privacidade conforme nossa Política de Privacidade.
                    </p>
                    <p>
                        <strong>4. Comunicações Opcionais:</strong> Você pode optar por receber newsletters e atualizações.
                    </p>
                    <p>
                        <strong>5. Alterações:</strong> Você pode rever ou revogar seu aceite a qualquer momento.
                    </p>

                    <p style={{ marginTop: '15px', fontStyle: 'italic' }}>
                        Para ler os Termos completos, <a
                            href="/terms"
                            style={{ color: '#026734', fontWeight: 'bold' }}
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/terms');
                            }}
                        >clique aqui</a>.
                    </p>
                </div>

                {/* Opção de Newsletter */}
                <div style={{
                    margin: '20px 0',
                    padding: '15px',
                    backgroundColor: 'rgba(0,100,50,0.05)',
                    borderRadius: '4px'
                }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                        marginBottom: '10px'
                    }}>
                        <input
                            type="checkbox"
                            checked={newsletterOptIn}
                            onChange={(e) => setNewsletterOptIn(e.target.checked)}
                            style={{
                                marginRight: '10px',
                                width: '18px',
                                height: '18px',
                                cursor: 'pointer'
                            }}
                        />
                        <span>Desejo receber newsletters e atualizações por e-mail (opcional)</span>
                    </label>
                </div>

                {/* Aceite Obrigatório */}
                <div style={{
                    margin: '20px 0',
                    padding: '15px',
                    backgroundColor: 'rgba(0,100,50,0.1)',
                    borderRadius: '4px'
                }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer'
                    }}>
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => setIsChecked(e.target.checked)}
                            style={{
                                marginRight: '10px',
                                width: '18px',
                                height: '18px',
                                cursor: 'pointer'
                            }}
                        />
                        <span style={{ fontWeight: 'bold' }}>
                            Eu li e concordo com os Termos e Condições de Uso (obrigatório)
                        </span>
                    </label>
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