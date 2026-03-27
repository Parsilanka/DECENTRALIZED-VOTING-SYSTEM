from pymongo import MongoClient
from backend.config import Config

try:
    client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=5000)
    db = client.get_database('voting_dapp') 
except Exception as e:
    print(f"Failed to connect to MongoDB: {e}")
    db = None
    
mock_db = {
    'elections': [],
    'voters': [],
    'voter_requests': []
}

def get_col(name):
    if db is not None:
        return db[name]
    return mock_db[name]

def create_election_meta(election_id, title, description="", start_time=0, end_time=0):
    if db is not None:
        get_col('elections').insert_one({
            "election_id": election_id,
            "title": title,
            "description": description,
            "start_time": start_time,
            "end_time": end_time,
            "candidates": []
        })
    else:
        mock_db['elections'].append({
            "election_id": election_id,
            "title": title,
            "description": description,
            "start_time": start_time,
            "end_time": end_time,
            "candidates": []
        })

def add_candidate_meta(election_id, candidate_id, name, party, bio="", image_url="", manifesto=""):
    candidate_obj = {
        "candidate_id": candidate_id,
        "name": name,
        "party": party,
        "bio": bio,
        "image_url": image_url,
        "manifesto": manifesto
    }
    
    if db is not None:
        get_col('elections').update_one(
            {"election_id": election_id},
            {"$push": {"candidates": candidate_obj}}
        )
    else:
        for ex in mock_db['elections']:
            if ex['election_id'] == election_id:
                ex['candidates'].append(candidate_obj)

def get_all_elections_meta():
    try:
        if db is not None:
            return list(get_col('elections').find({}, {"_id": 0}))
        print("Using mock_db for elections")
        return mock_db['elections']
    except Exception as e:
        print(f"ERROR in get_all_elections_meta: {e}")
        raise e

def get_election_meta(election_id):
    if db is not None:
        return get_col('elections').find_one({"election_id": election_id}, {"_id": 0})
    for ex in mock_db['elections']:
        if ex['election_id'] == election_id:
            return ex
    return None
def log_protocol_event(message, event_type="info"):
    import datetime
    event = {
        "message": message,
        "type": event_type,
        "timestamp": datetime.datetime.utcnow().strftime("%H:%M:%S"),
        "date": datetime.datetime.utcnow().isoformat()
    }
    if db is not None:
        get_col('protocol_events').insert_one(event)
    else:
        if 'protocol_events' not in mock_db:
            mock_db['protocol_events'] = []
        mock_db['protocol_events'].append(event)
    print(f"PROTOCOL_EVENT: [{event_type.upper()}] {message}")
