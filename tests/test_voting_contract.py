import pytest
from web3 import Web3
import json
import time

# Connecting to local hardhat node deployed via `npx hardhat node`
@pytest.fixture(scope="module")
def w3():
    w3_instance = Web3(Web3.HTTPProvider('http://127.0.0.1:8545'))
    return w3_instance

@pytest.fixture(scope="module")
def contract(w3):
    if not w3.is_connected():
        pytest.skip("Local hardhat node is not running at http://127.0.0.1:8545")

    with open("build/Voting_abi.json") as f:
        abi = json.load(f)
    with open("build/Voting_bytecode.txt") as f:
        bytecode = f.read()

    Voting = w3.eth.contract(abi=abi, bytecode=bytecode)
    admin = w3.eth.accounts[0]
    
    # Deploy contract
    tx_hash = Voting.constructor().transact({'from': admin})
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    return w3.eth.contract(
        address=tx_receipt.contractAddress,
        abi=abi
    )

def test_deploy(w3, contract):
    if not w3.is_connected(): return
    assert contract.address is not None

def test_admin_create_election(w3, contract):
    if not w3.is_connected(): return
    admin = w3.eth.accounts[0]
    
    # 0 -> way into the future
    tx_hash = contract.functions.createElection("Test Election", 0, int(time.time() + 100000)).transact({'from': admin})
    w3.eth.wait_for_transaction_receipt(tx_hash)

    election = contract.functions.getElection(1).call()
    assert election[1] == "Test Election"
    assert election[4] is True

def test_add_candidate(w3, contract):
    if not w3.is_connected(): return
    admin = w3.eth.accounts[0]
    
    tx_hash = contract.functions.addCandidate(1, "Alice", "Party A").transact({'from': admin})
    w3.eth.wait_for_transaction_receipt(tx_hash)

    candidates = contract.functions.getCandidates(1).call()
    assert len(candidates) == 1
    assert candidates[0][1] == "Alice"

def test_register_voter_and_vote(w3, contract):
    if not w3.is_connected(): return
    admin = w3.eth.accounts[0]
    voter = w3.eth.accounts[1]
    
    tx_hash = contract.functions.registerVoter(voter).transact({'from': admin})
    w3.eth.wait_for_transaction_receipt(tx_hash)
    
    assert contract.functions.isRegistered(voter).call() is True
    
    tx_hash2 = contract.functions.castVote(1, 1).transact({'from': voter})
    w3.eth.wait_for_transaction_receipt(tx_hash2)
    
    results = contract.functions.getResults(1).call()
    assert results[0][3] == 1 # Vote count is 1

def test_double_vote_reverts(w3, contract):
    if not w3.is_connected(): return
    voter = w3.eth.accounts[1]
    
    with pytest.raises(Exception):
        contract.functions.castVote(1, 1).transact({'from': voter})

def test_unregistered_voter_reverts(w3, contract):
    if not w3.is_connected(): return
    unregistered_voter = w3.eth.accounts[2]
    
    with pytest.raises(Exception):
        contract.functions.castVote(1, 1).transact({'from': unregistered_voter})
