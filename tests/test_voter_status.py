import pytest
from backend.app import app
from backend.services.mongo_service import get_col
from unittest.mock import patch

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

import jwt
import datetime
from backend.config import Config

def test_get_voter_status_none(client):
    address = "0x1234567890123456789012345678901234567890"
    token = jwt.encode({
        'address': address,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }, Config.SECRET_KEY, algorithm="HS256")
    
    # Ensure the address is NOT in the database
    get_col('voter_requests').delete_one({"address": address.lower()})
    
    rv = client.get('/api/voters/status', headers={"Authorization": f"Bearer {token}"})
    assert rv.status_code == 200
    assert rv.json['status'] == 'none'

def test_get_voter_status_pending(client):
    address = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
    token = jwt.encode({
        'address': address,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }, Config.SECRET_KEY, algorithm="HS256")
    
    # Insert a pending request
    get_col('voter_requests').update_one(
        {"address": address.lower()},
        {"$set": {"address": address.lower(), "status": "pending", "name": "Tester"}},
        upsert=True
    )
    
    rv = client.get('/api/voters/status', headers={"Authorization": f"Bearer {token}"})
    assert rv.status_code == 200
    assert rv.json['status'] == 'pending'

def test_get_protocol_events(client):
    from backend.services.mongo_service import log_protocol_event
    log_protocol_event("Test Event 1", "info")
    log_protocol_event("Test Event 2", "success")
    
    rv = client.get('/api/admin/protocol-events')
    assert rv.status_code == 200
    assert len(rv.json) >= 2
    assert rv.json[0]['message'] == "Test Event 2"
    assert rv.json[1]['message'] == "Test Event 1"
