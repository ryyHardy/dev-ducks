# DevDucks Backend

This is the AI backend for DevDucks written with FastAPI.
It is currently deployed on [render.com](https://render.com/), and you access it as shown in ``extension.js`` without needing to touch any Python on your end.

NOTE: If the URL hasn't been visited in a while, it shuts itself down until it gets another request, so it might take extra time if it is the first request in a while. The doucmentation says up to a minute, but it depends. Luckily, this app isn't super reliant on speed.

## API Endpoints

- ``/generate_chat`` : Generates {count} chat messages reacting to the code {input_data}
  Parameters:
  - **string** input_data: The code the chat is reacting to.
  - **int** count: The number of chat messages to generate.

  Returns:
  - [
      [username1, message1],
      [username2, message2],
      ..
  ]

- ``/donation_message`` **(NOT AVAILABLE CURRENTLY)** : Generates a single donation message reacting to the code {input_data}. This is still in development and might be removed at some point.
  Parameters:
  - **string** input_data: The code the chat is reacting to.

  Returns:
  - [username, message]

## For developers

The backend server is deployed, so you can always access that to run the extension locally. That being said, if you still want to run the backend server locally for development purposes such as testing changes to the LLM code, do the following:

1. Substitute an **OpenRouter** key after the equals sign in ``.env.sample`` and rename that file to ``.env``. Go on [OpenRouter](https://openrouter.ai/) and generate one for yourself. It's free (at least for the model we're currently using).
2. **cd** into the backend and create a Python virtual environment. Then, activate it.
3. Run ``pip install -r requirements.txt`` to install dependencies.
4. Use ``fastapi run main.py`` to run the server and the URL for it will be shown. Use that URL to make requests to the API. I recommend using a tool like Postman for this.
