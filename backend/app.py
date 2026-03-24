import os
import sys

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from flask import Flask
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv

from backend.routes.admin import admin_bp
from backend.routes.voter import voter_bp
from backend.routes.results import results_bp
from backend.routes.auth import auth_bp
from backend.routes.voter_requests import voter_req_bp

load_dotenv()

app = Flask(__name__)
CORS(app)

# Rate Limiting
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["100 per day", "30 per minute"],
    storage_uri="memory://",
)

app.register_blueprint(admin_bp)
app.register_blueprint(voter_bp)
app.register_blueprint(results_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(voter_req_bp)

@app.route('/')
def health_check():
    return {"status": "ok", "message": "Decentralized Voting API is running"}

if __name__ == '__main__':
    app.run(debug=True, port=5000)
