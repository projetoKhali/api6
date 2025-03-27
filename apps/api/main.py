from flask import Flask, jsonify
from db.mongo import MongoDB

app = Flask(__name__)


@app.route("/")
def home():
    return jsonify({"message": "Hello from Flask!"})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
