from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()
OPENROUTER_KEY = os.getenv("OPENROUTER_KEY")

PROMPT_TEMPLATE = """
Create a list of {0} imaginary Twitch chat messages with imaginary Twitch usernames reacting to aspects of the following code constructively as if all the viewers are developers. Make the messages relevant to the code.
The response should be in the format 'username:message' (with one per line and nothing else). If the code cuts off, assume that it isn't an error. \n\nCode:\n{1}
"""

# Define prompt template
# PROMPT_TEMPLATE = PromptTemplate.from_template(
#     "Create a list of {count} imaginary Twitch chat messages with imaginary Twitch usernames reacting to aspects of the following code constructively as if all the viewers are developers. Make the messages relevant to the code."
#     "The response should be in the format 'username:message' (with one per line and nothing else). If the code cuts off, assume that it isn't an error. \n\nCode:\n{code}"
# )

class TwitchGeneratorClient:
    def __init__(self):
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=OPENROUTER_KEY
        ) 

    def generate_chat(self, code: str, count: int):
        prompt = PROMPT_TEMPLATE.format(str(count), code)
        response = self.client.chat.completions.create(
            model="deepseek/deepseek-r1-distill-llama-70b:free", # FREE?!
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        ).choices[0].message.content
        chat_messages = []
        for line in response.split("\n"):
            if ":" in line:
                username, message = line.split(":", 1)
                chat_messages.append([username.strip(), message.strip()])
        return chat_messages