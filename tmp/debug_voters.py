import sys
import os
sys.path.append(os.getcwd())

from backend.services.web3_service import get_voters_for_election, get_onchain_results
from backend.config import Config

def test():
    election_id = 3
    print(f"--- DIAGNOSTICS FOR ELECTION {election_id} ---")
    
    try:
        results = get_onchain_results(election_id)
        print(f"Results Success! Active: {results['active']}")
        for c in results['candidates']:
            print(f"  Candidate {c['id']}: {c['name']} | Votes: {c['voteCount']}")
    except Exception as e:
        print(f"RESULTS FETCH FAILED: {e}")

    try:
        voters = get_voters_for_election(election_id)
        print(f"Voters (Auditing) Success! Found {len(voters)}: {voters}")
    except Exception as e:
        print(f"VOTER FETCH FAILED: {str(e)}")

if __name__ == "__main__":
    test()
