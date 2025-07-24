import { CodeContext, ChatMessage } from "./types";

const BASE_URL = "https://dev-ducks.onrender.com/generate_chat";

export async function generateReactionChats(code: CodeContext, count: number) {
  // const params = new URLSearchParams({
  //   context: JSON.stringify(context),
  //   count: count.toString(),
  // });

  // const url = BASE_URL + `?${params.toString()}`;

  console.log("Requesting messages...");

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: JSON.stringify(code),
      count: count,
    }),
  });
  if (!response.ok) {
    throw new Error(`HTTP ERROR! status: ${response.status}`);
  }

  const messages: ChatMessage[] = await response.json();

  console.log("Generated messages:", messages);

  return messages;
}
