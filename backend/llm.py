from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
import os

load_dotenv()
OPENAI_KEY = os.getenv("OPENAI-API-KEY")

# Define prompt template
PROMPT_TEMPLATE = PromptTemplate.from_template(
    "Create a list of {count} imaginary Twitch chat messages with imaginary Twitch usernames reacting to aspects of the following code. Make the messages relevant to the code. "
    "The response should be in the format 'username:message' (with one per line). If the code cuts off, assume that it isn't an error. \n\nCode:\n{code}"
)

class TwitchGeneratorClient:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4o",
            temperature=0.7,
            max_tokens=1000,
            timeout=30,
            
        )

    def generate_chat(self, code: str, count: int):
        prompt = PROMPT_TEMPLATE.format(code=code, count=count)
        response = self.llm.invoke(prompt).content.strip()
        chat_messages = []
        for line in response.split("\n"):
            if ":" in line:
                username, message = line.split(":", 1)
                chat_messages.append([username.strip(), message.strip()])
        return chat_messages