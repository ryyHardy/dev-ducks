import { ChatMessage } from "./types";

// Maximum number of items the queue can hold
const QUEUE_CAPACITY = 50;

// Range of possible delays between each message being sent
// (to make it look more natural)
const MIN_DELAY = 500; // 0.5s
const MAX_DELAY = 2000; // 2s

const messageQueue: ChatMessage[] = [];

function getRandomDelay() {
  return Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY)) + MIN_DELAY;
}

export function addMessage(msg: ChatMessage) {
  if (messageQueue.length < QUEUE_CAPACITY) {
    messageQueue.push(msg);
  }
}

export function sendQueue(sendToWebview: (msg: ChatMessage) => void) {
  if (messageQueue.length > 0) {
    const msg = messageQueue.shift();
    sendToWebview(msg!);
  }
  // Recursively pop + send chat messages with random delays between
  setTimeout(() => sendQueue(sendToWebview), getRandomDelay());
}
