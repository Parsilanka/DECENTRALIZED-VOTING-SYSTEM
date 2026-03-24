import threading
from flask import Blueprint, request, jsonify
from backend.services.mongo_service import get_col
from backend.services.web3_service import register_voter_onchain
from backend.routes.auth import token_required
from backend.config import Config

voter_req_bp = Blueprint('voter_requests', __name__)

@voter_req_bp.route('/api/voters/apply', methods=['POST'])
def apply_to_vote():
    data = request.json
    address = data.get('address').lower()
    name = data.get('name')
    
    if not address or not name:
        return jsonify({"error": "Address and name required"}), 400
        
    # Check if already registered or applied
    if get_col('voter_requests').find_one({"address": address}):
        return jsonify({"message": "Application already submitted"}), 200
        
    get_col('voter_requests').insert_one({
        "address": address,
        "name": name,
        "status": "pending",
        "timestamp": request.json.get('timestamp') # Optional from frontend
    })
    return jsonify({"message": "Application submitted successfully"}), 201

@voter_req_bp.route('/api/voters/pending', methods=['GET'])
@token_required
def get_pending_voters():
    if request.user_address.lower() != Config.ADMIN_ADDRESS.lower():
        return jsonify({"error": "Admin only"}), 403
        
    requests = list(get_col('voter_requests').find({"status": "pending"}, {"_id": 0}))
    return jsonify(requests), 200

@voter_req_bp.route('/api/voters/approve', methods=['POST'])
@token_required
def approve_voter():
    if request.user_address.lower() != Config.ADMIN_ADDRESS.lower():
        return jsonify({"error": "Admin only"}), 403
        
    data = request.json
    address = data.get('address').lower()
    
    # Update status immediately to prevent double approval
    get_col('voter_requests').update_one({"address": address}, {"$set": {"status": "approving"}})
    
    def background_approve(addr):
        try:
            register_voter_onchain(addr)
            get_col('voter_requests').update_one({"address": addr}, {"$set": {"status": "approved"}})
        except Exception as e:
            get_col('voter_requests').update_one({"address": addr}, {"$set": {"status": "failed", "error": str(e)}})

    thread = threading.Thread(target=background_approve, args=(address,))
    thread.start()
    
    return jsonify({"message": "Approval broadcasted to blockchain"}), 202
