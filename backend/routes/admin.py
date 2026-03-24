import threading
from flask import Blueprint, request, jsonify
from backend.config import Config
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
        # Define a background task
        def sync_election_task(title, description, start_time, end_time):
            print(f"BACKGROUND: Starting sync for election '{title}'...")
            try:
                election_id = create_election_onchain(title, start_time, end_time)
                if election_id is not None:
                    print(f"BACKGROUND: Election mined with ID {election_id}. Updating meta...")
                    create_election_meta(election_id, title, description, start_time, end_time)
                    print(f"BACKGROUND: Meta updated for election {election_id}")
                else:
                    print(f"BACKGROUND ERROR: Failed to get election_id for '{title}'")
            except Exception as e:
                print(f"BACKGROUND ERROR in sync_election_task: {e}")

        # Start the background thread
        thread = threading.Thread(target=sync_election_task, args=(
            data['title'], 
            data.get('description', ''), 
            data['start_time'], 
            data['end_time']
        ))
        thread.start()

        return jsonify({
            "message": "Election transaction broadcasted. It will appear once mined on-chain (approx. 20s).",
            "status": "processing"
        }), 202
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@admin_bp.route('/api/admin/candidate', methods=['POST'])
def add_candidate():
    if not get_admin_auth():
        return jsonify({"error": "Admin signature required"}), 401
    data = request.json
    try:
        def sync_candidate_task(election_id, name, party, bio):
            print(f"BACKGROUND: Adding candidate '{name}' to election {election_id}...")
            try:
                candidate_id = add_candidate_onchain(election_id, name, party)
                if candidate_id is not None:
                    print(f"BACKGROUND: Candidate mined with ID {candidate_id}. Updating meta...")
                    add_candidate_meta(election_id, candidate_id, name, party, bio)
                    print(f"BACKGROUND: Meta updated for candidate {candidate_id}")
            except Exception as e:
                print(f"BACKGROUND ERROR in sync_candidate_task: {e}")

        thread = threading.Thread(target=sync_candidate_task, args=(
            data['election_id'], 
            data['name'], 
            data['party'], 
            data.get('bio', '')
        ))
        thread.start()

        return jsonify({
            "message": "Candidate addition broadcasted. It will appear once mined on-chain.",
            "status": "processing"
        }), 202
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@admin_bp.route('/api/admin/register-voter', methods=['POST'])
def register_voter():
    if not get_admin_auth():
        return jsonify({"error": "Admin signature required"}), 401
    data = request.json
    try:
        def sync_voter_task(address):
            register_voter_onchain(address)

        thread = threading.Thread(target=sync_voter_task, args=(data['address'],))
        thread.start()

        return jsonify({
            "message": "Voter registration broadcasted. Whitelisting will be complete in ~20s.",
            "status": "processing"
        }), 202
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@admin_bp.route('/api/admin/end-election/<int:election_id>', methods=['POST'])
def end_election_route(election_id):
    if not get_admin_auth():
        return jsonify({"error": "Admin signature required"}), 401
    try:
        def sync_end_task(eid):
            end_election_onchain(eid)

        thread = threading.Thread(target=sync_end_task, args=(election_id,))
        thread.start()

        return jsonify({
            "message": "Election termination broadcasted. Results will be finalized shortly.",
            "status": "processing"
        }), 202
    except Exception as e:
        return jsonify({"error": str(e)}), 400
