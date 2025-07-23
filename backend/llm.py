import os

import requests
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_KEY = os.getenv("OPENROUTER_KEY")

CLIENT_URL = "https://openrouter.ai/v1/chat/completions"

CLIENT_HEADERS = {
    "Authorization": f"Bearer {OPENROUTER_KEY}",
    "Content-Type": "application/json",
}

CLIENT_MODEL = "deepseek/deepseek-r1-distill-llama-70b"

PROMPT_TEMPLATE = """
Create a list of {0} imaginary, and sometimes funny, Twitch chat messages with imaginary Twitch usernames reacting to aspects of the following code constructively as if all the viewers are developers. Make the messages relevant to the code.
The response should be in the format 'username:message' (with one per line and nothing else). If the code cuts off, assume that it isn't an error. \n\nCode:\n{1}
"""

# Define prompt template
# PROMPT_TEMPLATE = PromptTemplate.from_template(
#     "Create a list of {count} imaginary Twitch chat messages with imaginary Twitch usernames reacting to aspects of the following code constructively as if all the viewers are developers. Make the messages relevant to the code."
#     "The response should be in the format 'username:message' (with one per line and nothing else). If the code cuts off, assume that it isn't an error. \n\nCode:\n{code}"
# )


def generate_messages(code: str, count: str):
    prompt = PROMPT_TEMPLATE.format(str(count), code)

    payload = {"model": CLIENT_MODEL, "messages": [{"role": "user", "content": prompt}]}

    response = requests.post(CLIENT_URL, headers=CLIENT_HEADERS, json=payload).text

    chat_messages = []
    for line in response.split("\n"):
        if ":" in line:
            username, message = line.split(":", 1)
            chat_messages.append(
                {"username": username.strip(), "message": message.strip()}
            )
    return chat_messages


class TwitchGeneratorClient:
    def __init__(self):
        pass

    def generate_chat(self, code: str, count: int):
        prompt = PROMPT_TEMPLATE.format(str(count), code)
        response = (
            self.client.chat.completions.create(
                model="deepseek/deepseek-r1-distill-llama-70b:free",  # FREE?!
                messages=[{"role": "user", "content": prompt}],
            )
            .choices[0]
            .message.content
        )
        chat_messages = []
        for line in response.split("\n"):
            if ":" in line:
                username, message = line.split(":", 1)
                chat_messages.append(
                    {"username": username.strip(), "message": message.strip()}
                )
        return chat_messages
