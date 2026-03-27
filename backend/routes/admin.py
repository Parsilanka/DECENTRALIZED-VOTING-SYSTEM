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
    add_candidate_meta,
    get_col,
    log_protocol_event
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
    admin_address = Config.ADMIN_ADDRESS
    if not signature or not message:
        return False
    return verify_admin_signature(signature, message, admin_address)

@admin_bp.route('/api/admin/protocol-events', methods=['GET'])
def get_protocol_events():
    # Fetch last 20 events
    events = list(get_col('protocol_events').find({}, {"_id": 0}).sort("date", -1).limit(20))
    return jsonify(events), 200

@admin_bp.route('/api/admin/election', methods=['POST'])
def create_election():
    if not get_admin_auth():
        return jsonify({"error": "Admin signature required"}), 401
    data = request.json
    log_protocol_event(f"Broadcast: New Election '{data['title']}'", "process")
    try:
        def sync_election_task(title, description, start_time, end_time):
            try:
                election_id = create_election_onchain(title, start_time, end_time)
                if election_id is not None:
                    create_election_meta(election_id, title, description, start_time, end_time)
                    log_protocol_event(f"Election '{title}' Mined (ID: {election_id})", "success")
                else:
                    log_protocol_event(f"Failed to mine election '{title}'", "error")
            except Exception as e:
                log_protocol_event(f"Election Sync Error: {str(e)}", "error")

        thread = threading.Thread(target=sync_election_task, args=(
            data['title'], 
            data.get('description', ''), 
            data['start_time'], 
            data['end_time']
        ))
        thread.start()

        return jsonify({
            "message": "Election transaction broadcasted.",
            "status": "processing"
        }), 202
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@admin_bp.route('/api/admin/candidate', methods=['POST'])
def add_candidate():
    if not get_admin_auth():
        return jsonify({"error": "Admin signature required"}), 401
    data = request.json
    log_protocol_event(f"Broadcast: Register Candidate '{data['name']}'", "process")
    try:
        def sync_candidate_task(election_id, name, party, bio, image_url, manifesto):
            try:
                candidate_id = add_candidate_onchain(election_id, name, party)
                if candidate_id is not None:
                    add_candidate_meta(election_id, candidate_id, name, party, bio, image_url, manifesto)
                    log_protocol_event(f"Candidate '{name}' Added to Election {election_id}", "success")
                else:
                    log_protocol_event(f"Failed to add candidate '{name}'", "error")
            except Exception as e:
                log_protocol_event(f"Candidate Sync Error: {str(e)}", "error")

        thread = threading.Thread(target=sync_candidate_task, args=(
            data['election_id'], 
            data['name'], 
            data['party'], 
            data.get('bio', ''),
            data.get('image_url', ''),
            data.get('manifesto', '')
        ))
        thread.start()

        return jsonify({
            "message": "Candidate addition broadcasted.",
            "status": "processing"
        }), 202
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@admin_bp.route('/api/admin/register-voter', methods=['POST'])
def register_voter():
    if not get_admin_auth():
        return jsonify({"error": "Admin signature required"}), 401
    data = request.json
    address = data['address']
    log_protocol_event(f"Broadcast: Whitelist Voter {address[:8]}...", "process")
    try:
        def sync_voter_task(addr):
            try:
                register_voter_onchain(addr)
                log_protocol_event(f"Voter {addr[:8]}... Whitelisted Successfully", "success")
            except Exception as e:
                log_protocol_event(f"Manual Whitelisting Failed for {addr[:8]}: {str(e)}", "error")

        thread = threading.Thread(target=sync_voter_task, args=(address,))
        thread.start()

        return jsonify({
            "message": "Voter registration broadcasted.",
            "status": "processing"
        }), 202
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@admin_bp.route('/api/admin/end-election/<int:election_id>', methods=['POST'])
def end_election_route(election_id):
    if not get_admin_auth():
        return jsonify({"error": "Admin signature required"}), 401
    log_protocol_event(f"Broadcast: Terminating Election ID {election_id}", "process")
    try:
        def sync_end_task(eid):
            try:
                end_election_onchain(eid)
                log_protocol_event(f"Election ID {eid} Terminated Successfully", "success")
            except Exception as e:
                log_protocol_event(f"Termination Failed for Election {eid}: {str(e)}", "error")

        thread = threading.Thread(target=sync_end_task, args=(election_id,))
        thread.start()

        return jsonify({
            "message": "Election termination broadcasted.",
            "status": "processing"
        }), 202
    except Exception as e:
        return jsonify({"error": str(e)}), 400
