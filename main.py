#back - end API
from fastapi import FastAPI
import hashlib
import requests
import os
from fastapi import FastAPI, HTTPException
from google import genai

app = FastAPI(title="Pug API")

@app.get("/")
def read_root():
    return {"status": "online", "message": "hi"}

# endpoint for /e$
@app.get("/api/crypto/encode")
def encode_text(text: str, key: int = 1):
    # This is a placeholder for your actual differential encryption math logic
    encoded_chars = []
    for i, char in enumerate(text):
        # Apply a simple mathematical transformation using the index and key
        scrambled_ord = ord(char) + (i * key)
        encoded_chars.append(chr(scrambled_ord))
        
    result_text = "".join(encoded_chars)
    return {
        "original": text,
        "encoded": result_text,
        "key_used": key
    }

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