import jwt
import datetime
import threading
from flask import Blueprint, request, jsonify
from backend.config import Config
from eth_account.messages import encode_defunct
from web3 import Web3
from functools import wraps

auth_bp = Blueprint('auth', __name__)

# Temporary nonce storage (In production, use Redis or MongoDB with TTL)
nonces = {}

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            # Remove 'Bearer ' if present
            if token.startswith('Bearer '):
                token = token.split(" ")[1]
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
            request.user_address = data['address']
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401
        return f(*args, **kwargs)
    return decorated

@auth_bp.route('/api/auth/challenge/<address>', methods=['GET'])
def get_challenge(address):
    import uuid
    nonce = str(uuid.uuid4())
    nonces[address.lower()] = nonce
    message = f"Sign in to VoteChain\nNonce: {nonce}"
    return jsonify({"message": message, "nonce": nonce})

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    address = data.get('address').lower()
    signature = data.get('signature')
    message = data.get('message')

    # Verify message matches our nonce
    stored_nonce = nonces.get(address)
    if not stored_nonce or stored_nonce not in message:
        return jsonify({"error": "Invalid or expired nonce"}), 400

    try:
        w3 = Web3()
        encoded_msg = encode_defunct(text=message)
        recovered_address = w3.eth.account.recover_message(encoded_msg, signature=signature)
        
        if recovered_address.lower() != address:
            return jsonify({"error": "Signature verification failed"}), 401

        # Issue JWT
        token = jwt.encode({
            'address': address,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=4),
            'role': 'admin' if address == Config.ADMIN_ADDRESS.lower() else 'voter'
        }, Config.SECRET_KEY, algorithm="HS256")

        # Cleanup nonce
        if address in nonces: del nonces[address]

        return jsonify({
            "token": token,
            "address": address,
            "role": 'admin' if address == Config.ADMIN_ADDRESS.lower() else 'voter'
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@auth_bp.route('/api/auth/me', methods=['GET'])
@token_required
def get_me():
    role = 'admin' if request.user_address.lower() == Config.ADMIN_ADDRESS.lower() else 'voter'
    return jsonify({
        "address": request.user_address,
        "role": role
    })
