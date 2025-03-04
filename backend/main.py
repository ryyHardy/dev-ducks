import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from llm import TwitchGeneratorClient

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Restrict this to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PORT = int(os.getenv("PORT", 8000)) # Default to 8000 if not set

client = TwitchGeneratorClient()


@app.post("/generate_chat")
def generate_chat(input_data: str, count: int):
    messages = client.generate_chat(input_data, count)
    return messages

@app.post("/donation_message")
def donation_message():
    pass

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)