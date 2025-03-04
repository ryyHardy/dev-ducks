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

client = TwitchGeneratorClient()


@app.post("/generate_chat")
def generate_chat(input_data: str, count: int):
    messages = client.generate_chat(input_data, count)
    return messages

@app.post("/donation_message")
def donation_message():
    pass