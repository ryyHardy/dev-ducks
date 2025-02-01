from fastapi import FastAPI

app = FastAPI()

@app.post("/generate_chat")
def generate_chat(input_data: str, count: int):
    pass

@app.get("/donation_message")
def donation_message():
    pass