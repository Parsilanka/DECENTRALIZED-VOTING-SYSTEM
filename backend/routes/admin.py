from flask import Blueprint, request, jsonify
from backend.services.web3_service import (
    create_election_onchain, 
    add_candidate_onchain, 
    register_voter_onchain,
    end_election_onchain
)
from backend.services.mongo_service import (
    create_election_meta, 
    add_candidate_meta
)
from eth_account.messages import encode_defunct
from web3 import Web3

admin_bp = Blueprint('admin', __name__)

def verify_admin_signature(signature, message, admin_address):
    try:
        w3 = Web3()
        encoded_msg = encode_defunct(text=message)
        recovered_address = w3.eth.account.recover_message(encoded_msg, signature=signature)
        return recovered_address.lower() == admin_address.lower()
    except Exception:
        return False

def get_admin_auth():
    signature = request.headers.get('X-Signature')
    message = request.headers.get('X-Message')
    admin_address = Config.ADMIN_ADDRESS # Need to add this to Config
    if not signature or not message:
        return False
    return verify_admin_signature(signature, message, admin_address)

@admin_bp.route('/api/admin/election', methods=['POST'])
def create_election():
    if not get_admin_auth():
        return jsonify({"error": "Admin signature required"}), 401
    data = request.json
    try:
        election_id = create_election_onchain(data['title'], data['start_time'], data['end_time'])
        if election_id is not None:
            create_election_meta(election_id, data['title'], data['description'], data['start_time'], data['end_time'])
            return jsonify({"message": "Election created", "election_id": election_id}), 201
        return jsonify({"error": "Failed to create on-chain"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@admin_bp.route('/api/admin/candidate', methods=['POST'])
def add_candidate():
    if not get_admin_auth():
        return jsonify({"error": "Admin signature required"}), 401
    data = request.json
    try:
        candidate_id = add_candidate_onchain(data['election_id'], data['name'], data['party'])
        if candidate_id is not None:
            add_candidate_meta(data['election_id'], candidate_id, data['name'], data['party'], data['bio'])
            return jsonify({"message": "Candidate added", "candidate_id": candidate_id}), 201
        return jsonify({"error": "Failed to add on-chain"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@admin_bp.route('/api/admin/register-voter', methods=['POST'])
def register_voter():
    if not get_admin_auth():
        return jsonify({"error": "Admin signature required"}), 401
    data = request.json
    try:
        tx_hash = register_voter_onchain(data['address'])
        return jsonify({"message": "Voter registered", "tx_hash": tx_hash}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@admin_bp.route('/api/admin/end-election/<int:election_id>', methods=['POST'])
def end_election_route(election_id):
    if not get_admin_auth():
        return jsonify({"error": "Admin signature required"}), 401
    try:
        tx_hash = end_election_onchain(election_id)
        return jsonify({"message": "Election ended", "tx_hash": tx_hash}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
