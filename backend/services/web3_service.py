from web3 import Web3
from backend.config import Config
from builtins import Exception

def get_w3():
    return Web3(Web3.HTTPProvider(Config.SEPOLIA_RPC_URL))

def get_contract():
    w3 = get_w3()
    if Config.CONTRACT_ADDRESS and Config.CONTRACT_ABI:
        return w3, w3.eth.contract(address=Config.CONTRACT_ADDRESS, abi=Config.CONTRACT_ABI)
    return w3, None

def get_admin_account(w3):
    return w3.eth.account.from_key(Config.ADMIN_PRIVATE_KEY)

def create_election_onchain(title, start_time, end_time):
    w3, contract = get_contract()
    if not contract: return None
    
    admin = get_admin_account(w3)
    nonce = w3.eth.get_transaction_count(admin.address)
    tx = contract.functions.createElection(title, start_time, end_time).build_transaction({
        "chainId": w3.eth.chain_id,
        "from": admin.address,
        "nonce": nonce
    })
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=admin.key)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=240)
    
    events = contract.events.ElectionCreated().process_receipt(receipt)
    if events:
        return events[0]['args']['electionId']
    return None

def add_candidate_onchain(election_id, name, party):
    w3, contract = get_contract()
    if not contract: return None
    
    admin = get_admin_account(w3)
    nonce = w3.eth.get_transaction_count(admin.address)
    tx = contract.functions.addCandidate(election_id, name, party).build_transaction({
        "chainId": w3.eth.chain_id,
        "from": admin.address,
        "nonce": nonce
    })
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=admin.key)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=240)
    
    events = contract.events.CandidateAdded().process_receipt(receipt)
    if events:
        return events[0]['args']['candidateId']
    return None

def register_voter_onchain(address):
    w3, contract = get_contract()
    if not contract: return None
    
    admin = get_admin_account(w3)
    nonce = w3.eth.get_transaction_count(admin.address)
    tx = contract.functions.registerVoter(w3.to_checksum_address(address)).build_transaction({
        "chainId": w3.eth.chain_id,
        "from": admin.address,
        "nonce": nonce
    })
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=admin.key)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=240)
    return w3.to_hex(tx_hash)

def end_election_onchain(election_id):
    w3, contract = get_contract()
    if not contract: return None
    
    admin = get_admin_account(w3)
    nonce = w3.eth.get_transaction_count(admin.address)
    tx = contract.functions.endElection(election_id).build_transaction({
        "chainId": w3.eth.chain_id,
        "from": admin.address,
        "nonce": nonce
    })
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=admin.key)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=240)
    return w3.to_hex(tx_hash)

def get_onchain_results(election_id):
    w3, contract = get_contract()
    if not contract: return []
    
    candidates = contract.functions.getResults(election_id).call()
    result = []
    for c in candidates:
        result.append({
            "id": c[0],
            "name": c[1],
            "party": c[2],
            "voteCount": c[3]
        })
    election = contract.functions.getElection(election_id).call()
    return {
        "active": election[4],
        "endTime": election[3],
        "candidates": result
    }

def verify_transaction(tx_hash):
    w3 = get_w3()
    try:
        receipt = w3.eth.get_transaction_receipt(tx_hash)
        if hasattr(receipt, 'status'):
            return receipt['status'] == 1
        return False
    except Exception:
        return False

def cast_vote_relay(signed_tx_hex):
    w3 = get_w3()
    tx_hash = w3.eth.send_raw_transaction(signed_tx_hex)
    return w3.to_hex(tx_hash)

def get_voters_for_election(election_id):
    w3, contract = get_contract()
    if not contract: return []
    
    try:
        # Use get_logs for better compatibility with RPC providers
        latest_block = w3.eth.block_number
        # Use a small range (50,000 blocks) to prevent RPC timeouts
        search_from = max(0, latest_block - 50000)
        
        # Get VoteCast events
        events = contract.events.VoteCast.get_logs(
            from_block=search_from,
            to_block='latest',
            argument_filters={'electionId': election_id}
        )
        
        # Extract unique voter addresses
        voters = []
        for event in events:
            voters.append(event['args']['voter'])
        
        return list(set(voters))
    except Exception as e:
        print(f"Error fetching voters from chain via get_logs: {e}")
        return []

def check_user_voted(election_id, address):
    w3, contract = get_contract()
    if not contract: return False
    try:
        # hasVoted is a mapping from electionId => (from address => bool)
        return contract.functions.hasVoted(election_id, address).call()
    except Exception as e:
        print(f"Error checking hasVoted: {e}")
        return False

def get_voter_history_onchain(address):
    w3, contract = get_contract()
    if not contract: return []
    
    try:
        latest_block = w3.eth.block_number
        # Search last 5,000 blocks for voter history (faster and more reliable)
        search_from = max(0, latest_block - 5000)
        
        events = contract.events.VoteCast.get_logs(
            from_block=search_from,
            to_block='latest',
            argument_filters={'voter': w3.to_checksum_address(address)}
        )
        
        history = []
        for event in events:
            election_id = event['args']['electionId']
            candidate_id = event['args']['candidateId']
            
            # Fetch election and candidate names for display
            election = contract.functions.elections(election_id).call()
            # election = [id, title, start, end, active]
            
            # Candidates are stored in a mapping/array inside the contract logic
            # We can get the candidate name from the results or a helper
            # For simplicity, we'll return the IDs and let the caller enrich if needed,
            # but let's try to get the title at least.
            
            history.append({
                "election_id": election_id,
                "candidate_id": candidate_id,
                "election_title": election[1],
                "block_number": event['blockNumber'],
                "transaction_hash": w3.to_hex(event['transactionHash'])
            })
            
        return history
    except Exception as e:
        print(f"Error fetching voter history: {e}")
        return []
