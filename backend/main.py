from fastapi import FastAPI
from llm import TwitchGeneratorClient

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
client = TwitchGeneratorClient()


@app.post("/generate_chat")
def generate_chat(input_data: str, count: int):
    messages = client.generate_chat(input_data, count)
    return messages

@app.get("/donation_message")
def donation_message():
    pass