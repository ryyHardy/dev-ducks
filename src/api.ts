import { CodeContext, ChatMessage } from "./types";

const BASE_URL = "https://dev-ducks.onrender.com/generate_chat";

export async function generateReactionChats(
  context: CodeContext,
  count: number
) {
  // const params = new URLSearchParams({
  //   context: JSON.stringify(context),
  //   count: count.toString(),
  // });

  // const url = BASE_URL + `?${params.toString()}`;

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: context,
      count: count,
    }),
  });
  if (!response.ok) {
    throw new Error(`HTTP ERROR! status: ${response.status}`);
  }
  const messages: ChatMessage[] = await response.json();
  return messages;
}
