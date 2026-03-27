from flask import Blueprint, jsonify
from backend.services.mongo_service import get_all_elections_meta, get_election_meta
from backend.services.web3_service import get_onchain_results, get_voters_for_election

results_bp = Blueprint('results', __name__)

@results_bp.route('/api/elections', methods=['GET'])
def list_elections():
    try:
        elections = get_all_elections_meta()
        import time
        now = int(time.time())
        for e in elections:
            if e.get('end_time') and now > e['end_time']:
                e['status'] = 'Ended'
            else:
                e['status'] = 'Active'
        return jsonify(elections), 200
    except Exception as e:
        print(f"ERROR in list_elections: {e}")
        return jsonify({"error": str(e)}), 500

@results_bp.route('/api/elections/<int:election_id>', methods=['GET'])
def get_election_with_results(election_id):
    election_meta = get_election_meta(election_id)
    if not election_meta:
        return jsonify({"error": "Election not found"}), 404
        
    # Ensure total_votes and vote_count ARE ALWAYS initialized
    election_meta['total_votes'] = 0
    for candidate in election_meta.get('candidates', []):
        candidate['vote_count'] = 0
        candidate['id'] = candidate['candidate_id']
        
    try:
        onchain_data = get_onchain_results(election_id)
        election_meta['active'] = onchain_data['active']
        election_meta['endTime'] = onchain_data['endTime']
        
        # Use string keys for results_map to avoid type mismatches
        results_map = {str(c['id']): c['voteCount'] for c in onchain_data['candidates']}
        
        total_votes = 0
        for candidate in election_meta.get('candidates', []):
            cid = str(candidate['candidate_id'])
            votes = results_map.get(cid, 0)
            candidate['vote_count'] = votes
            total_votes += votes
            print(f"Mapped Candidate {cid} ({candidate['name']}): {votes} votes")
            
        election_meta['total_votes'] = total_votes
        election_meta['candidates_list'] = onchain_data['candidates']
    except Exception as e:
        print(f"ERROR Fetching On-Chain data: {e}")
        election_meta['results_error'] = str(e)
        
    return jsonify(election_meta), 200

@results_bp.route('/api/results/<int:election_id>', methods=['GET'])
def get_results_only(election_id):
    try:
        data = get_onchain_results(election_id)
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@results_bp.route('/api/elections/<int:election_id>/voters', methods=['GET'])
def list_voters(election_id):
    try:
        voters = get_voters_for_election(election_id)
        return jsonify({"election_id": election_id, "voters": voters}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400
