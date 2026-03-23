from flask import Blueprint, request, jsonify
from backend.services.web3_service import create_election_onchain, add_candidate_onchain, register_voter_onchain
from backend.services.mongo_service import create_election_meta, add_candidate_meta

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/api/admin/election', methods=['POST'])
def create_election():
    data = request.json
    title = data.get('title')
    description = data.get('description', '')
    start_time = int(data.get('start_time'))
    end_time = int(data.get('end_time'))

    try:
        election_id = create_election_onchain(title, start_time, end_time)
        if election_id is not None:
            create_election_meta(election_id, title, description)
            return jsonify({"success": True, "election_id": election_id}), 201
        return jsonify({"success": False, "error": "Transaction failed or event not caught"}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@admin_bp.route('/api/admin/candidate', methods=['POST'])
def add_candidate():
    data = request.json
    election_id = int(data.get('election_id'))
    name = data.get('name')
    party = data.get('party')
    bio = data.get('bio', '')

    try:
        candidate_id = add_candidate_onchain(election_id, name, party)
        if candidate_id is not None:
            add_candidate_meta(election_id, candidate_id, name, party, bio)
            return jsonify({"success": True, "candidate_id": candidate_id}), 201
        return jsonify({"success": False, "error": "Transaction failed or event not caught"}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@admin_bp.route('/api/admin/register-voter', methods=['POST'])
def register_voter():
    data = request.json
    address = data.get('address')
    
    try:
        tx_hash = register_voter_onchain(address)
        if tx_hash:
            return jsonify({"success": True, "tx_hash": tx_hash}), 200
        return jsonify({"success": False, "error": "Transaction failed"}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400
