from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from dotenv import load_dotenv
import os

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
SEARCH_ENGINE_ID = os.getenv("SEARCH_ENGINE_ID")
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic models ---
class ChatRequest(BaseModel):
    message: str

class SurveyRequest(BaseModel):
    topic: str

# --- Google Custom Search helper ---
def google_custom_search(query):
    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "key": GOOGLE_API_KEY,
        "cx": SEARCH_ENGINE_ID,
        "q": query,
        "num": 5
    }
    resp = requests.get(url, params=params)
    data = resp.json()
    results = []
    for item in data.get("items", []):
        results.append({
            "title": item.get("title"),
            "link": item.get("link"),
            "snippet": item.get("snippet")
        })
    return results

# --- Simple survey generator ---
def make_survey_from_snippets(snippets):
    questions = []
    for snippet in snippets:
        words = snippet.split()
        if len(words) > 5:
            idx = 3  # Example: blank out the 4th word
            if idx < len(words):
                answer = words[idx]
                words[idx] = "_____"
                question = " ".join(words)
                questions.append({'question': question, 'answer': answer})
    return questions

# --- Endpoints ---
@app.get("/")
async def root():
    return {"message": "TriviaBot backend is running!"}

@app.post("/chat")
async def chat(request: ChatRequest):
    url = "https://api.mistral.ai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "mistral-tiny",
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
        print("Mistral API status:", resp.status_code)
        print("Mistral API response:", resp.text)
        resp.raise_for_status()
        result = resp.json()
        return {"response": result["choices"][0]["message"]["content"]}
    except Exception as e:
        print("Error in /chat:", e, flush=True)
        raise HTTPException(status_code=500, detail="Mistral API error: " + str(e))

@app.post("/survey")
async def survey(request: SurveyRequest):
    print("Received /survey request:", request.topic, flush=True)
    try:
        results = google_custom_search(request.topic)
        snippets = [r['snippet'] for r in results if r['snippet']]
        questions = make_survey_from_snippets(snippets)
        return {"questions": questions}
    except Exception as e:
        print("Error in /survey:", e, flush=True)
        raise HTTPException(status_code=500, detail=str(e))