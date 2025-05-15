from bson import ObjectId
from datetime import datetime

def create_new_term(terms_collection, text, topics, version=None):
    """
    Cria um novo termo de uso na coleção.
    
    Args:
        terms_collection: Coleção de termos
        text (str): Texto completo do termo
        topics (list): Lista de tópicos (deve seguir o schema)
        version (str, optional): Versão do termo
    
    Returns:
        ObjectId: ID do termo criado ou None em caso de erro
    """
    try:

        terms_collection.update_many(
            {'status': 'ativo'},
            {'$set': {'status': 'inativo'}}
        )
        
        term_data = {
            'text': text,
            'status': 'ativo',
            'topics': topics,
            'created_at': datetime.utcnow()
        }
        
        if version:
            term_data['version'] = version
            
        result = terms_collection.insert_one(term_data)
        return result.inserted_id
    except Exception as e:
        print(f"Erro ao criar termo: {e}")
        return None

def get_active_term(terms_collection):
    """
    Retorna o termo ativo atual.
    
    Returns:
        dict: Termo ativo ou None se não houver
    """
    return terms_collection.find_one({'status': 'ativo'})

def update_term_text(terms_collection, term_id, new_text):
    """
    Atualiza o texto de um termo existente.
    
    Args:
        terms_collection: Coleção de termos
        term_id (str): ID do termo a ser atualizado
        new_text (str): Novo texto para o termo
    
    Returns:
        bool: True se atualizado com sucesso, False caso contrário
    """
    try:
        result = terms_collection.update_one(
            {'_id': ObjectId(term_id)},
            {'$set': {'text': new_text, 'updated_at': datetime.utcnow()}}
        )
        return result.modified_count > 0
    except Exception:
        return False

def toggle_topic_status(terms_collection, term_id, topic_description, new_status):
    """
    Altera o status de um tópico específico dentro de um termo.
    
    Args:
        terms_collection: Coleção de termos
        term_id (str): ID do termo
        topic_description (str): Descrição do tópico a ser modificado
        new_status (str): Novo status ('ativo' ou 'inativo')
    
    Returns:
        bool: True se atualizado com sucesso, False caso contrário
    """
    try:
        result = terms_collection.update_one(
            {
                '_id': ObjectId(term_id),
                'topics.description': topic_description
            },
            {
                '$set': {
                    'topics.$.status': new_status,
                    'updated_at': datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    except Exception:
        return False

def create_user_acceptance(user_acceptance_collection, user_id, topics):
    """
    Cria um registro de aceitação de termos por um usuário.
    
    Args:
        user_acceptance_collection: Coleção de aceitação
        user_id (str): ID do usuário
        topics (list): Lista de tópicos aceitos (deve seguir o schema)
    
    Returns:
        ObjectId: ID do registro criado ou None em caso de erro
    """
    try:
        acceptance_data = {
            'user_id': user_id,
            'topics': topics,
            'accepted_at': datetime.utcnow()
        }
        
        result = user_acceptance_collection.insert_one(acceptance_data)
        return result.inserted_id
    except Exception as e:
        print(f"Erro ao criar aceitação: {e}")
        return None

def get_user_acceptance(user_acceptance_collection, user_id):
    """
    Obtém a aceitação de termos mais recente de um usuário.
    
    Args:
        user_acceptance_collection: Coleção de aceitação
        user_id (str): ID do usuário
    
    Returns:
        dict: Dados de aceitação ou None se não encontrado
    """
    return user_acceptance_collection.find_one(
        {'user_id': user_id},
        sort=[('accepted_at', -1)]
    )

def update_user_acceptance(user_acceptance_collection, acceptance_id, new_topics):
    """
    Atualiza os tópicos aceitos por um usuário.
    
    Args:
        user_acceptance_collection: Coleção de aceitação
        acceptance_id (str): ID do registro de aceitação
        new_topics (list): Nova lista de tópicos aceitos
    
    Returns:
        bool: True se atualizado com sucesso, False caso contrário
    """
    try:
        result = user_acceptance_collection.update_one(
            {'_id': ObjectId(acceptance_id)},
            {'$set': {'topics': new_topics, 'updated_at': datetime.utcnow()}}
        )
        return result.modified_count > 0
    except Exception:
        return False

def check_user_acceptance_compliance(user_acceptance_collection, terms_collection, user_id):
    """
    Verifica se a aceitação do usuário está em conformidade com os termos atuais.
    
    Args:
        user_acceptance_collection: Coleção de aceitação
        terms_collection: Coleção de termos
        user_id (str): ID do usuário
    
    Returns:
        tuple: (bool: se está em conformidade, list: tópicos não conformes)
    """
    active_term = get_active_term(terms_collection)
    if not active_term:
        return (False, [])
    
    user_acceptance = get_user_acceptance(user_acceptance_collection, user_id)
    if not user_acceptance:
        return (False, [])
    
    non_compliant_topics = []
    
    # Verifica tópicos obrigatórios ativos
    for term_topic in active_term['topics']:
        if term_topic['status'] == 'ativo' and term_topic['required']:
            # Procura se o usuário aceitou este tópico
            accepted = False
            for user_topic in user_acceptance['topics']:
                if (user_topic['description'] == term_topic['description'] and 
                    user_topic['accepted']):
                    accepted = True
                    break
            
            if not accepted:
                non_compliant_topics.append(term_topic['description'])
    
    return (len(non_compliant_topics) == 0, non_compliant_topics)