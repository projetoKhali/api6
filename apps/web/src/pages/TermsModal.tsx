import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { TermsService } from '../service/TermsService';
import {
  AcceptedTopic,
  TermStatus,
  UserAcceptanceRequest,
} from '../schemas/TermsSchema';
import { getLocalStorageData, clearLocalStorageData } from '../store/storage';
import { deleteUser } from '../service/UserService';
import { logout } from '../service/AuthService';

interface TermsModalProps {
  onAccept: (newsletterOptIn: boolean) => void;
  initialNewsletterOptIn?: boolean;
  showBackOption?: boolean;
  setIsAuthenticated: (auth: boolean) => void;
}

interface NavbarProps {
  setIsAuthenticated: (auth: boolean) => void;
}

const TermsModal = ({
  onAccept,
  initialNewsletterOptIn = false,
  showBackOption = false,
  setIsAuthenticated,
}: TermsModalProps) => {
  const [isChecked, setIsChecked] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(
    initialNewsletterOptIn
  );
  const [termsText, setTermsText] = useState<string>('');
  const navigate = useNavigate();
  const [termTopics, setTermTopics] = useState<AcceptedTopic[]>([]);
  const [acceptanceId, setAcceptanceId] = useState<string | null>(null);
  const [initialAcceptedTopics, setInitialAcceptedTopics] = useState<
    AcceptedTopic[]
  >([]);

  useEffect(() => {
    const fetchTermsAndUserAcceptance = async () => {
      const userId = getLocalStorageData()?.id || null;
      const term = await TermsService.getActiveTerm();
      setTermsText(term.text);

      let initialTopics: AcceptedTopic[] = term.topics.map((topic) => ({
        description: topic.description,
        status: topic.status,
        accepted: false,
      }));

      if (userId) {
        try {
          const userAcceptance = await TermsService.getUserAcceptance(userId);

          if (userAcceptance && userAcceptance.topics) {
            setInitialAcceptedTopics(userAcceptance.topics);
            initialTopics = term.topics.map((termTopic) => {
              const userTopic = userAcceptance.topics.find(
                (t) => t.description === termTopic.description
              );
              return {
                description: termTopic.description,
                status:
                  termTopic.required === true
                    ? TermStatus.ACTIVE
                    : TermStatus.INACTIVE,
                accepted: userTopic ? userTopic.accepted : false,
              };
            });
            setAcceptanceId(userAcceptance.user_id);
          }
        } catch (e) {
          console.log(e);
        }
      }

      setTermTopics(initialTopics);
    };

    fetchTermsAndUserAcceptance();
  }, []);

  const handleAccept = async () => {
    const userId = getLocalStorageData()?.id;
    if (!userId) {
      console.error('ID do usuário não encontrado no localStorage.');
      return;
    }

    const handleDelete = async () => {
      const currentUser = getLocalStorageData()?.id;
      if (
        currentUser &&
        window.confirm('Tem certeza que deseja excluir este usuário?')
      ) {
        await deleteUser(currentUser);
      }
    };

    const hasAcceptedBefore = acceptanceId !== null;

    const isUncheckingMandatory =
      hasAcceptedBefore &&
      termTopics.some((topic) => {
        const wasAcceptedBefore = initialAcceptedTopics.find(
          (t) => t.description === topic.description
        )?.accepted;
        const isNowUncheckedMandatory =
          topic.status === TermStatus.ACTIVE && !topic.accepted;
        return wasAcceptedBefore && isNowUncheckedMandatory;
      });

    if (isUncheckingMandatory) {
      const confirmDelete = window.confirm(
        'Você está desmarcando um tópico obrigatório, isso acarretará na exclusão total dos dados do usuário. Deseja continuar?'
      );

      if (confirmDelete) {
        await handleDelete();
        await logout();
        setIsAuthenticated(false);

        clearLocalStorageData();
        navigate('/login');
        return;
      } else {
        return;
      }
    }

    const data: UserAcceptanceRequest = {
      user_id: String(userId),
      topics: termTopics,
    };

    let response;
    if (acceptanceId) {
      response = await TermsService.updateUserAcceptance(acceptanceId, {
        topics: termTopics,
      });
      navigate('/', { replace: true });
    } else {
      response = await TermsService.acceptTerms(data);
      navigate('/', { replace: true });
    }

    if (response.success) {
      onAccept(newsletterOptIn);
    } else {
      console.error('Erro ao registrar/atualizar aceite dos termos.');
    }
  };

  const areAllRequiredTopicsAccepted = termTopics
    .filter((topic) => topic.status === 'ativo') // status ativo
    .every((topic) => topic.accepted); // se for obrigatório, deve estar aceito

  // Verifica se usuário é antigo (já aceitou alguma vez)
  const hasAcceptedBefore = acceptanceId !== null;

  // Se usuário novo, bloqueia o botão se não aceitou tudo obrigatório
  // Se usuário antigo, botão sempre habilitado (liberado para tentar salvar / alterar)
  const isButtonDisabled = !hasAcceptedBefore && !areAllRequiredTopicsAccepted;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '30px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}
      >
        <h2
          style={{
            color: '#026734',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          Termos e Condições de Uso
        </h2>

        <div
          style={{
            marginBottom: '25px',
            lineHeight: '1.6',
            maxHeight: '50vh',
            overflowY: 'auto',
            paddingRight: '10px',
          }}
        >
          {termsText ? (
            <div dangerouslySetInnerHTML={{ __html: termsText }} />
          ) : (
            <p>Carregando termos...</p>
          )}
        </div>

        <div
          style={{
            margin: '20px 0',
            padding: '15px',
            backgroundColor: 'rgba(0,100,50,0.1)',
            borderRadius: '4px',
          }}
        >
          <h3>Concordância com os tópicos:</h3>
          {termTopics.map((topic, index) => (
            <label
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer',
                marginBottom: '10px',
              }}
            >
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
                  cursor: 'pointer',
                }}
                disabled={!topic}
              />
              <span style={{ fontWeight: topic ? 'bold' : 'normal' }}>
                {topic.description}{' '}
                {topic.status === TermStatus.ACTIVE
                  ? '(Obrigatório)'
                  : '(Opcional)'}
              </span>
            </label>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '15px',
            flexWrap: 'wrap',
          }}
        >
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
                transition: 'all 0.3s',
              }}
            >
              Voltar
            </button>
          )}

          <button
            onClick={handleAccept}
            disabled={isButtonDisabled}
            style={{
              padding: '12px 24px',
              backgroundColor: isButtonDisabled ? '#cccccc' : '#026734',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              transition: 'all 0.3s',
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
