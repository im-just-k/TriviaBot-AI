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
    # Temporary: return a fixed response to test routing
    return {"response": "Test response from backend!"}

# Vercel serverless handler
from mangum import Mangum
handler = Mangum(app)