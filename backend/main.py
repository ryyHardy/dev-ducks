from fastapi import FastAPI
from llm import TwitchGeneratorClient, premade_inactive_messages
import random

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
client = TwitchGeneratorClient()


@app.post("/generate_chat")
def generate_chat(input_data: str, count: int):
    messages = client.generate_chat(input_data, count)
    return messages

@app.post("/get_inactive_messages")
def get_inactive_messages(count: int):
    messages = []
    for _ in range(count):
        messages.append(random.choice(premade_inactive_messages))
    return messages

@app.post("/donation_message")
def donation_message():
    pass