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

print("API Keys Status:")
print("API Keys Status:")
print("MISTRAL_API_KEY present:", "Yes" if MISTRAL_API_KEY else "No")
print("GOOGLE_API_KEY present:", "Yes" if GOOGLE_API_KEY else "No")
print("SEARCH_ENGINE_ID present:", "Yes" if SEARCH_ENGINE_ID else "No")

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
        "Authorization": f"Bearer {MISTRAL_API_KEY}",  # Adding Bearer prefix
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
        print("Attempting to call Mistral API...")
        print("API URL:", url)
        print("Headers:", {k: '...' if k == 'Authorization' else v for k, v in headers.items()})
        print("Request data:", data)
        
        resp = requests.post(url, headers=headers, json=data)
        print("\nMistral API Response:")
        print("Status code:", resp.status_code)
        print("Response headers:", dict(resp.headers))
        print("Response text:", resp.text)
        
        resp.raise_for_status()
        result = resp.json()
        return {"response": result["choices"][0]["message"]["content"]}
    except requests.exceptions.RequestException as e:
        print("\nNetwork or API Error:", str(e))
        if hasattr(e.response, 'text'):
            print("Error response:", e.response.text)
        raise HTTPException(status_code=500, detail="Mistral API error: " + str(e))
    except Exception as e:
        print("\nUnexpected Error:", str(e))
        raise HTTPException(status_code=500, detail="Server error: " + str(e))

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