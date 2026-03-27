from flask import Blueprint, request, jsonify
from backend.services.web3_service import cast_vote_relay, verify_transaction
from backend.services.mongo_service import log_protocol_event

voter_bp = Blueprint('voter', __name__)

@voter_bp.route('/api/vote', methods=['POST'])
def submit_vote():
    data = request.json
    signed_tx = data.get('signed_tx')

    try:
        tx_hash = cast_vote_relay(signed_tx)
        log_protocol_event(f"Vote Broadcasted! Tx: {tx_hash[:10]}...", "success")
        return jsonify({"success": True, "tx_hash": tx_hash}), 200
    except Exception as e:
        log_protocol_event(f"Vote Failed: {str(e)[:50]}", "error")
        return jsonify({"success": False, "error": str(e)}), 400

@voter_bp.route('/api/verify/<tx_hash>', methods=['GET'])
def verify_tx(tx_hash):
    success = verify_transaction(tx_hash)
    return jsonify({"success": success})

@voter_bp.route('/api/voters/has-voted/<int:election_id>/<address>', methods=['GET'])
def check_voted_status(election_id, address):
    from backend.services.web3_service import check_user_voted
    has_voted = check_user_voted(election_id, address)
    return jsonify({"election_id": election_id, "address": address, "has_voted": has_voted}), 200
