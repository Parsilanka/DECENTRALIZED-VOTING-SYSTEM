import threading
from flask import Blueprint, request, jsonify
from backend.services.mongo_service import get_col, log_protocol_event
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
        
    requests = list(get_col('voter_requests').find({"status": {"$in": ["pending", "failed", "approving"]}}, {"_id": 0}))
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
    log_protocol_event(f"Whitelisting Initiated for {address[:6]}...", "process")
    
    def background_approve(addr):
        try:
            register_voter_onchain(addr)
            get_col('voter_requests').update_one({"address": addr}, {"$set": {"status": "approved"}})
            log_protocol_event(f"Voter {addr[:6]}... Successfully Whitelisted", "success")
        except Exception as e:
            get_col('voter_requests').update_one({"address": addr}, {"$set": {"status": "failed", "error": str(e)}})
            log_protocol_event(f"Whitelisting Failed for {addr[:6]}: {str(e)}", "error")

    thread = threading.Thread(target=background_approve, args=(address,))
    thread.start()
    
    return jsonify({"message": "Approval broadcasted to blockchain"}), 202
@voter_req_bp.route('/api/voters/status', methods=['GET'])
@token_required
def get_voter_status():
    address = request.user_address.lower()
    voter_req = get_col('voter_requests').find_one({"address": address}, {"_id": 0})
    
    if not voter_req:
        return jsonify({"status": "none"}), 200
        
    return jsonify({
        "status": voter_req.get('status', 'pending'),
        "name": voter_req.get('name', '')
    }), 200

@voter_req_bp.route('/api/voters/force-approve', methods=['POST'])
@token_required
def force_approve_voter():
    if request.user_address.lower() != Config.ADMIN_ADDRESS.lower():
        return jsonify({"error": "Admin only"}), 403
        
    data = request.json
    address = data.get('address').lower()
    
    get_col('voter_requests').update_one({"address": address}, {"$set": {"status": "approved"}})
    log_protocol_event(f"Manual Override: Voter {address[:6]}... marked as Approved", "success")
    
    
    return jsonify({"message": "Status updated manually"}), 200

@voter_req_bp.route('/api/voters/update-profile', methods=['POST'])
@token_required
def update_profile():
    data = request.json
    new_name = data.get('name')
    if not new_name:
        return jsonify({"error": "Name is required"}), 400
        
    get_col('voter_requests').update_one(
        {"address": request.user_address.lower()}, 
        {"$set": {"name": new_name}}
    )
    
    return jsonify({"message": "Profile updated successfully"}), 200

@voter_req_bp.route('/api/voters/activity', methods=['GET'])
@token_required
def get_voter_activity():
    history = get_voter_history_onchain(request.user_address)
    return jsonify(history), 200
