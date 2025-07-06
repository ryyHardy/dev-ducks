import os

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from llm import TwitchGeneratorClient

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this to specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PORT = int(os.getenv("PORT", 8000))  # Default to 8000 if not set

client = TwitchGeneratorClient()


class GenerateChatRequest(BaseModel):
    code: str
    count: int


@app.post("/generate_chat")
def generate_chat(request: GenerateChatRequest):
    messages = client.generate_chat(request.code, request.count)
    return messages


# @app.post("/donation_message")
# def donation_message(input_dat: str):
#     pass

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=PORT)
