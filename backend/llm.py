from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
import os

load_dotenv()
OPENAI_KEY = os.getenv("OPENAI-API-KEY")

with open("data/inactive_messages.txt") as f:
    premade_inactive_messages = [line.split(":", 1) for line in f.readlines()]

# Define prompt template
PROMPT_TEMPLATE = PromptTemplate.from_template(
    "Pretend you are watching a Twitch stream of a developer and you are a developer as well. Give insightful yet funny responses"
    "Create a list of {count} imaginary Twitch chat messages with imaginary duck-related/duck pun Twitch usernames reacting to aspects of the following code. Make the messages relevant to the code. "
    "The response should be in the format 'username:message' (with one per line). If the code cuts off, assume that it isn't an error. If you encounter any issues not code related do not mention it, you are a viewer on the Twitch stream."
    "\n\nCode:\n{code}"
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