console.log("Chat webview script running!");

/// Maximum length of the chat possible
const MaxLength = 15;

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
  msgDiv.innerHTML += `: ${message}`;

  chat.appendChild(msgDiv);

  trimChat(MaxLength);
}

// Queue for incoming messages
const messageQueue = [];

// Function to process the queue
function processQueue() {
  if (messageQueue.length === 0) {
    return;
  }

  const { username, message } = messageQueue.shift();
  addMessage(username, message);

  // Process the next message after a random delay
  const delay = Math.floor(Math.random() * (2000 - 500)) + 500; // 500ms to 2000ms
  setTimeout(processQueue, delay);
}

// Handle messages from the vscode extension
window.addEventListener("message", event => {
  const data = event.data;
  console.log("Message received:", data);
  switch (data.name) {
    case "add-messages":
      for (let { username, message } of data.content) {
        messageQueue.push({ username, message });
      }
      processQueue(); // Start processing the queue if not already running
      break;
    case "clear":
      trimChat(0);
      messageQueue.length = 0; // Clear the queue
      break;
  }
});
