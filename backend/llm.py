import json
import os
import re

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

HUGGINGFACE_KEY = os.getenv("HUGGINGFACE_KEY")

SYSTEM_PROMPT = """
You are a helpful assistant that generates imaginary, and sometiems funny, Twitch chat messages with imaginary Twitch usernames reacting to the code. The messages should be relevant to the code and constructive, as if all the viewers are developers.
Please output the messages in JSON format.

The JSON format is as follows:
[
    {"username": "username1", "message": "message1"},
    {"username": "username2", "message": "message2"},
    ...
]

If the code cuts off, assume that it isn't an error. The code may be provided directly or wrapped in JSON with extra context.
"""

client = OpenAI(base_url="https://router.huggingface.co/v1", api_key=HUGGINGFACE_KEY)

# Define prompt template
# PROMPT_TEMPLATE = PromptTemplate.from_template(
#     "Create a list of {count} imaginary Twitch chat messages with imaginary Twitch usernames reacting to aspects of the following code constructively as if all the viewers are developers. Make the messages relevant to the code."
#     "The response should be in the format 'username:message' (with one per line and nothing else). If the code cuts off, assume that it isn't an error. \n\nCode:\n{code}"
# )


def generate_messages(code: str, count: int):
    user_prompt = f"Generate {count} Twitch chat messages reacting to the following code:\n\n{code}"

    completion = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-R1:novita",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
    )

    # Extract the JSON portion using a regular expression
    # (particularly, removing the DeepSeek <think> tags)
    match = re.search(
        r"\[\s*{.*}\s*\]", completion.choices[0].message.content, re.DOTALL
    )
    if not match:
        raise ValueError("The LLM response does not contain valid JSON.")

    json_content = match.group(0)  # Extract the matched JSON string

    try:
        return json.loads(json_content)
    except json.JSONDecodeError as e:
        print("Error decoding JSON:", e)
        raise ValueError("Failed to parse JSON from the LLM response.")
