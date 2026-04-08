import requests
from dotenv import load_dotenv
import os

load_dotenv()

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

url = "https://api.mistral.ai/v1/models"
headers = {
    "Authorization": f"Bearer {MISTRAL_API_KEY}",
    "Content-Type": "application/json"
}

resp = requests.get(url, headers=headers)
data = resp.json()

for model in data.get("data", []):
    print(model["id"])