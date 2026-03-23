import os
import json
import argparse
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

def get_contract():
    rpc_url = os.getenv("SEPOLIA_RPC_URL")
    private_key = os.getenv("ADMIN_PRIVATE_KEY")
    
    if not rpc_url or not private_key:
        raise ValueError("Missing SEPOLIA_RPC_URL or ADMIN_PRIVATE_KEY")

    w3 = Web3(Web3.HTTPProvider(rpc_url))
    
    address = None
    try:
        with open("build/contract_address.txt", "r") as f:
            address = f.read().strip()
    except Exception:
        pass
        
    if not address:
        address = os.getenv("CONTRACT_ADDRESS")
        
    if not address:
        raise ValueError("Contract address not found in build/contract_address.txt or .env")

    with open("build/Voting_abi.json", "r") as f:
        abi = json.load(f)

    contract = w3.eth.contract(address=address, abi=abi)
    admin_account = w3.eth.account.from_key(private_key)
    return w3, contract, admin_account

def create_election(title, start_time, end_time):
    w3, contract, admin = get_contract()
    nonce = w3.eth.get_transaction_count(admin.address)
    
    tx = contract.functions.createElection(title, start_time, end_time).build_transaction({
        "chainId": w3.eth.chain_id,
        "from": admin.address,
        "nonce": nonce
    })
    
    signed_tx = w3.eth.account.sign_transaction(tx, private_key=admin.key)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    print(f"Transaction Hash: {w3.to_hex(tx_hash)}")
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    print("Election created!")

def get_election(election_id):
    _, contract, _ = get_contract()
    election = contract.functions.getElection(election_id).call()
    print(election)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Interact with Voting Contract")
    subparsers = parser.add_subparsers(dest="command")
    
    create_parser = subparsers.add_parser("create_election")
    create_parser.add_argument("title", type=str)
    create_parser.add_argument("start_time", type=int)
    create_parser.add_argument("end_time", type=int)
    
    get_parser = subparsers.add_parser("get_election")
    get_parser.add_argument("election_id", type=int)
    
    args = parser.parse_args()
    
    if args.command == "create_election":
        create_election(args.title, args.start_time, args.end_time)
    elif args.command == "get_election":
        get_election(args.election_id)
