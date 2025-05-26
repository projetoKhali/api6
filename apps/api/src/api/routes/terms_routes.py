from api.service.terms_service import update_user_acceptance
from flask import Blueprint, jsonify, request
from bson import ObjectId
from datetime import datetime
from api.middleware.auth import require_auth

def create_terms_blueprint(db):
    assert db is not None

    terms_collection = db.get_collection('terms_of_use_collection')
    user_acceptance_collection = db.get_collection('user_acceptance_collection')
    assert terms_collection is not None
    assert user_acceptance_collection is not None

    terms_blueprint = Blueprint('terms', __name__, url_prefix="/terms")
    
    def create_user_acceptance_service(collection, user_id, topics):
        result = collection.insert_one({
            'user_id': user_id,
            'topics': topics,
            'created_at': datetime.utcnow()
        })
        return result.inserted_id

    # Endpoint existente para criar termos
    @terms_blueprint.route('/new', methods=['POST'])
    @require_auth
    def create_terms():
        data = request.get_json()

        # Validação básica
        required_fields = ['text', 'status', 'topics']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Campos obrigatórios ausentes'}), 400

        inserted = terms_collection.insert_one(data)
        return jsonify({'message': 'Termo criado com sucesso', 'id': str(inserted.inserted_id)}), 201

    # Endpoint existente para listar termos
    @terms_blueprint.route('/', methods=['GET'])
    @require_auth
    def list_terms():
        terms = list(terms_collection.find())

        for term in terms:
            term['_id'] = str(term['_id'])

        return jsonify(terms), 200

    # 1. Endpoint para verificar aceitação do usuário
    @terms_blueprint.route('/user/<user_id>', methods=['GET'])
    @require_auth
    def get_user_acceptance(user_id):
        acceptance = user_acceptance_collection.find_one({'user_id': user_id})
        
        if not acceptance:
            return jsonify({'message': 'Nenhuma aceitação encontrada para este usuário'}), 404
        
        acceptance['_id'] = str(acceptance['_id'])
        return jsonify(acceptance), 200

    # 2. Endpoint para cadastrar aceitação do usuário
    @terms_blueprint.route('/user/accept', methods=['POST'])
    @require_auth
    def create_user_acceptance():
        data = request.get_json()
        
        required_fields = ['user_id', 'topics']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Campos obrigatórios ausentes'}), 400
        
        existing = user_acceptance_collection.find_one({'user_id': data['user_id']})
        if existing:
            return jsonify({'error': 'Usuário já possui uma aceitação registrada'}), 400
        
        acceptance_id = create_user_acceptance_service(
            user_acceptance_collection,
            data['user_id'],
            data['topics']
        )
                
        if not acceptance_id:
            return jsonify({'error': 'Falha ao registrar aceitação'}), 500
            
        return jsonify({
            'message': 'Aceitação registrada com sucesso',
            'id': str(acceptance_id)
        }), 201

    # 3. Endpoint para obter termo ativo
    @terms_blueprint.route('/active', methods=['GET'])
    @require_auth
    def get_active_term():
        active_term = terms_collection.find_one({'status': 'ativo'})
        
        if not active_term:
            return jsonify({'message': 'Nenhum termo ativo encontrado'}), 404
        
        active_term['_id'] = str(active_term['_id'])
        return jsonify(active_term), 200

    # 4. Endpoint para adicionar novo termo (inativa os antigos e limpa aceitações)
    @terms_blueprint.route('/new-version', methods=['POST'])
    @require_auth
    def create_new_term_version():
        data = request.get_json()
        
        required_fields = ['text', 'topics']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Campos obrigatórios ausentes'}), 400
        
        # Inativa todos os termos ativos
        terms_collection.update_many(
            {'status': 'ativo'},
            {'$set': {'status': 'inativo'}}
        )
        
        # Limpa todas as aceitações de usuários
        user_acceptance_collection.delete_many({})
        
        # Cria novo termo ativo
        term_data = {
            'text': data['text'],
            'status': 'ativo',
            'topics': data['topics'],
            'created_at': datetime.utcnow()
        }
        
        if 'version' in data:
            term_data['version'] = data['version']
            
        result = terms_collection.insert_one(term_data)
        
        return jsonify({
            'message': 'Nova versão de termo criada com sucesso',
            'id': str(result.inserted_id)
        }), 201

    # 5. Endpoint para atualizar aceitação do usuário
    @terms_blueprint.route('/user/update/<user_id>', methods=['PUT'])
    @require_auth
    def update_acceptance(user_id):
        data = request.get_json()
        print(data)

        
        if 'topics' not in data:
            return jsonify({'error': 'Campo topics é obrigatório'}), 400

        success = update_user_acceptance(
            user_acceptance_collection,
            user_id,
            data['topics']
        )

        if not success:
            return jsonify({'error': 'Falha ao atualizar aceitação'}), 400

        return jsonify({'message': 'Aceitação atualizada com sucesso'}), 200



    # 6. Endpoint para verificar conformidade do usuário
    @terms_blueprint.route('/user/compliance/<user_id>', methods=['GET'])
    @require_auth
    def check_user_compliance(user_id):
        compliant, non_compliant_topics = check_user_acceptance_compliance(
            user_acceptance_collection,
            terms_collection,
            user_id
        )
        
        return jsonify({
            'compliant': compliant,
            'non_compliant_topics': non_compliant_topics
        }), 200

    return terms_blueprint