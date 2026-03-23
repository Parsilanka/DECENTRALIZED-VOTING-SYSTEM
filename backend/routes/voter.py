from flask import Blueprint, request, jsonify
from backend.services.web3_service import cast_vote_relay, verify_transaction

voter_bp = Blueprint('voter', __name__)

@voter_bp.route('/api/vote', methods=['POST'])
def submit_vote():
    data = request.json
    signed_tx = data.get('signed_tx')

    try:
        tx_hash = cast_vote_relay(signed_tx)
        return jsonify({"success": True, "tx_hash": tx_hash}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@voter_bp.route('/api/verify/<tx_hash>', methods=['GET'])
def verify_tx(tx_hash):
    success = verify_transaction(tx_hash)
    return jsonify({"success": success})
