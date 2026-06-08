#back - end API
from fastapi import FastAPI
import hashlib
import requests
import os
from fastapi import FastAPI, HTTPException
from google import genai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Pug API")

@app.get("/")
def read_root():
    return {"status": "online", "message": "hi"}

# endpoint for hash /hash$
@app.get("/api/crypto/hash")
def hash_text(text: str):
    sha256_hash = hashlib.sha256(text.encode()).hexdigest()
    return {
        "input": text,
        "hash": sha256_hash
    }


ai_client = genai.Client()

@app.get("/api/ai/ask")
def ask_ai(prompt: str):
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt needs words")
    try: 
        response = ai_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return {"query": prompt, "response": response.text}
    except Exception as e:
        return {"error": str(e)}