import pytest
from backend.app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    rv = client.get('/')
    assert rv.status_code == 200
    assert b"Decentralized Voting API" in rv.data

def test_get_elections(client):
    rv = client.get('/api/elections')
    assert rv.status_code == 200
    assert isinstance(rv.json, list)

def test_get_single_election_not_found(client):
    rv = client.get('/api/elections/999')
    assert rv.status_code == 404

def test_submit_vote_invalid(client):
    rv = client.post('/api/vote', json={"signed_tx": "invalid_hex"})
    assert rv.status_code == 400
