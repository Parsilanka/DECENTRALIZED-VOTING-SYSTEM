from flask import Blueprint, jsonify
from backend.services.mongo_service import get_all_elections_meta, get_election_meta
from backend.services.web3_service import get_onchain_results

results_bp = Blueprint('results', __name__)

@results_bp.route('/api/elections', methods=['GET'])
def list_elections():
    try:
        elections = get_all_elections_meta()
        return jsonify(elections), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@results_bp.route('/api/elections/<int:election_id>', methods=['GET'])
def get_election_with_results(election_id):
    election_meta = get_election_meta(election_id)
    if not election_meta:
        return jsonify({"error": "Election not found"}), 404
        
    try:
        onchain_data = get_onchain_results(election_id)
        election_meta['active'] = onchain_data['active']
        election_meta['endTime'] = onchain_data['endTime']
        
        results_map = {c['id']: c['voteCount'] for c in onchain_data['candidates']}
        for candidate in election_meta.get('candidates', []):
            cid = candidate['candidate_id']
            candidate['voteCount'] = results_map.get(cid, 0)
            candidate['id'] = cid
            
        election_meta['candidates_list'] = onchain_data['candidates']
    except Exception as e:
        election_meta['results_error'] = str(e)
        
    return jsonify(election_meta), 200

@results_bp.route('/api/results/<int:election_id>', methods=['GET'])
def get_results_only(election_id):
    try:
        data = get_onchain_results(election_id)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
