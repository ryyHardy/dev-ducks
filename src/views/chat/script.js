/// Maximum length of the chat possible
const MaxLength = 15;

/// Number of messages to generate per context change
const MessagesPerContextChange = 10;

/// Reference to chat section
const chat = document.querySelector(".chat");

// Delete the oldest message in the chat
function deleteOldestMessage() {
  const messages = document.getElementsByClassName("chat-message");
  if (messages.length > 0) {
    messages[0].parentNode.removeChild(messages[0]);
  }
}

// If larger than the given length, trim the chat's list of messages down to that length
function trimChat(length) {
  const messages = document.getElementsByClassName("chat-message");
  while (messages.length > length) {
    messages[0].parentNode.removeChild(messages[0]);
  }
}

// Add a message to the chat and then trim the chat to fit the limit
function addMessage(username, message) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("chat-message");

  const usernameSpan = document.createElement("span");
  usernameSpan.classList.add("username");
  usernameSpan.textContent = username;

  msgDiv.appendChild(usernameSpan);
  msgDiv.innerHTML += ` ${message}`;

  chat.appendChild(msgDiv);

  trimChat(MaxLength);
}

// Handle messages from the vscode extension
window.addEventListener("message", event => {
  const data = event.data;
  switch (data.name) {
    case "add-messages":
      for (let { username, message } of data.content) {
        addMessage(username, message);
      }
      break;
    case "clear":
      trimChat(0);
      break;
  }
});
