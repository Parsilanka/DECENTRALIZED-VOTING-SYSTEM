import os
import json
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

def deploy():
    rpc_url = os.getenv("SEPOLIA_RPC_URL")
    private_key = os.getenv("ADMIN_PRIVATE_KEY")
    
    if not rpc_url or not private_key:
        print("Missing SEPOLIA_RPC_URL or ADMIN_PRIVATE_KEY in environment.")
        return

    w3 = Web3(Web3.HTTPProvider(rpc_url))
    if not w3.is_connected():
        print("Failed to connect to Ethereum node.")
        return

    admin_address = w3.eth.account.from_key(private_key).address

    try:
        with open("build/Voting_abi.json", "r") as f:
            abi = json.load(f)
        
        with open("build/Voting_bytecode.txt", "r") as f:
            bytecode = f.read()
    except FileNotFoundError:
        print("Compiled contract not found. Please run compile.py first.")
        return

    VotingContract = w3.eth.contract(abi=abi, bytecode=bytecode)

    chain_id = w3.eth.chain_id
    nonce = w3.eth.get_transaction_count(admin_address)
    
    print(f"Deploying contract from {admin_address} to chain ID {chain_id}...")
    
    transaction = VotingContract.constructor().build_transaction({
        "chainId": chain_id,
        "from": admin_address,
        "nonce": nonce,
    })
    
    signed_txn = w3.eth.account.sign_transaction(transaction, private_key=private_key)
    
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
    print(f"Waiting for transaction {w3.to_hex(tx_hash)} to clear...")
    
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    contract_address = tx_receipt.contractAddress
    print(f"Contract deployed to {contract_address}")
    
    with open("build/contract_address.txt", "w") as f:
        f.write(contract_address)
        
if __name__ == "__main__":
    deploy()
