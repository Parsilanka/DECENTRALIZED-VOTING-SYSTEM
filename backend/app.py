import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Flask
from flask_cors import CORS

from backend.routes.admin import admin_bp
from backend.routes.voter import voter_bp
from backend.routes.results import results_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(admin_bp)
app.register_blueprint(voter_bp)
app.register_blueprint(results_bp)

@app.route('/')
def health_check():
    return {"status": "ok", "message": "Decentralized Voting API is running"}

if __name__ == '__main__':
    app.run(debug=True, port=5000)
