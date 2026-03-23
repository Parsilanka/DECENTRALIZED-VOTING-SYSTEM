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
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
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
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
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
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
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
