# C:\Users\Home\Desktop\Repositorios\NEW API6\api6\apps\api\src\app.py

from flask import Flask, request, jsonify
from models.dashboard_model import DashboardModel

app = Flask(__name__)

@app.route('/get_yield_data', methods=['POST'])
def get_yield_data():
    # Aqui você pode verificar se o corpo da requisição está vazio
    if request.is_json and not request.get_json():
        model = DashboardModel()  # Inicializa o modelo
        data = model.get_all_data()  # Obtém todos os dados da coleção
        return jsonify(data), 200  # Retorna os dados como resposta JSON
    return jsonify({"error": "Corpo vazio esperado"}), 400

if __name__ == '__main__':
    app.run(debug=True)
