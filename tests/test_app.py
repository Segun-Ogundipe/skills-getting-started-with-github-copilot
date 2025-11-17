from fastapi import FastAPI
from fastapi.testclient import TestClient

app = FastAPI()

@app.get("/activities")
async def read_activities():
    return [{"name": "Activity 1", "description": "Description 1", "schedule": "Schedule 1", "participants": [], "max_participants": 10}]

client = TestClient(app)

def test_read_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    assert len(response.json()) > 0
