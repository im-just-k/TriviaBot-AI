from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

app = FastAPI()

# CORS middleware allowing all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic models ---
class ChatRequest(BaseModel):
    message: str

# --- Endpoints ---
@app.get("/")
async def root():
    return {"message": "TriviaBot backend is running!"}

@app.post("/chat")
async def chat(request: ChatRequest):
    url = "https://api.mistral.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",  # Adding Bearer prefix
        "Content-Type": "application/json"
    }
    data = {
        "model": "mistral-small-3.2",
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a friendly trivia game host. "
                    "Format your answers using Markdown: use titles, bullet points, and paragraphs where appropriate. "
                    "Ask the user trivia questions, evaluate their answers, and provide explanations and fun facts. "
                    "Support a variety of topics and difficulty levels."
                )
            },
            {"role": "user", "content": request.message}
        ]
    }
    try:
        resp = requests.post(url, headers=headers, json=data)
        resp.raise_for_status()
        result = resp.json()
        return {"response": result["choices"][0]["message"]["content"]}
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail="Mistral API error: " + str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Server error: " + str(e))

# Vercel serverless handler
from mangum import Mangum
handler = Mangum(app)