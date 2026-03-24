import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

class Config:
    SECRET_KEY = os.environ.get('FLASK_SECRET_KEY', 'default_secret')
    MONGO_URI = os.environ.get('MONGODB_URI', 'mongodb://127.0.0.1:27017/voting_dapp')
    SEPOLIA_RPC_URL = os.environ.get('SEPOLIA_RPC_URL')
    ADMIN_PRIVATE_KEY = os.environ.get('ADMIN_PRIVATE_KEY')
    ADMIN_ADDRESS = os.environ.get('ADMIN_ADDRESS', '0x272b49179565b4A6103c8939f24Fcd4da12f8Ed3')
    
    # Try local build output
    try:
        with open(os.path.join(os.path.dirname(__file__), '..', 'build', 'contract_address.txt'), 'r') as f:
            CONTRACT_ADDRESS = f.read().strip()
    except Exception:
        CONTRACT_ADDRESS = os.environ.get('CONTRACT_ADDRESS')
        
    try:
        with open(os.path.join(os.path.dirname(__file__), '..', 'build', 'Voting_abi.json'), 'r') as f:
            import json
            CONTRACT_ABI = json.load(f)
    except Exception:
        CONTRACT_ABI = []
