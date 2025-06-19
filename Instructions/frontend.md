# Frontend Implementation Guide: TriviaBot

## 1. Document Header
Version: 1.0  
Date: June 7, 2025

---

## 2. Component Architecture

The app uses a component-based React architecture for maintainability and reusability:

- **App (Root):** Renders the main chat container.
- **ChatContainer:** Manages chat state, handles API calls, and orchestrates the chat UI.
- **MessageList:** Displays the list of messages.
- **Message:** Renders a single chat bubble (user or AI, with avatar for AI).
- **ChatInput:** Input field and send button.
- **LoadingIndicator:** Shows when the bot is "thinking".
- **ErrorDisplay:** Shows user-friendly error messages.

**Component Tree:**
```
App
└── ChatContainer
    ├── MessageList
    │   └── Message (x N)
    ├── ChatInput
    ├── LoadingIndicator (conditional)
    └── ErrorDisplay (conditional)
```

---

## 3. State Management

Use React hooks (`useState`, `useEffect`) for local state:

- `messages`: Array of `{ id, text, sender: 'user' | 'ai' }`
- `input`: Current input string
- `loading`: Boolean for loading state
- `error`: String for error messages

**State Flow:**
1. User types in `ChatInput` (`input` state).
2. User sends message:  
   - Add user message to `messages`
   - Clear `input`
   - Set `loading` to `true`
   - Call backend API (`/chat`)
3. On API success:  
   - Add AI message to `messages`
   - Set `loading` to `false`
   - Clear `error`
4. On API error:  
   - Set `loading` to `false`
   - Set `error` message

---

## 4. UI Design

**General TriviaBot Theme:**
- **Colors:** Blues, grays, whites, or your brand colors
- **Fonts:** Clean, sans-serif
- **Avatars:** Simple bot avatar (e.g., � or 🎲)
- **Message Bubbles:**  
  - User: right-aligned, blue or gray bubble  
  - AI: left-aligned, light gray bubble with avatar
- **Input Area:** Fixed at bottom, clear input, send button (paper plane or chat icon)
- **Responsiveness:** Mobile/tablet friendly
- **Animations:** Subtle (e.g., loading dots)
- **Content:** Friendly, concise, trivia-focused

---

## 5. API Integration

- **Endpoint:** `http://127.0.0.1:8000/chat`
- **Method:** `POST`
- **Request:**  
  ```json
  { "message": "Your trivia question or answer here" }
  ```
- **Response:**  
  ```json
  { "response": "AI's reply here" }
  ```
- **Error Handling:**  
  - Show "Oops! I couldn't reach TriviaBot. Try again later." for network/server errors.

**Example fetch call:**
```js
const res = await fetch("http://127.0.0.1:8000/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message }),
});
const data = await res.json();
```

---

## 6. Example Components

**App.js**
```jsx
import React from "react";
import ChatContainer from "./ChatContainer";
function App() { return <ChatContainer />; }
export default App;
```

**ChatContainer.jsx**
```jsx
import React, { useState, useRef, useEffect } from "react";
function ChatContainer() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Welcome! I'm TriviaBot 🤖. Ask me for a trivia question or try to stump me!", sender: "ai" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    setMessages(msgs => [...msgs, { id: Date.now(), text: input, sender: "user" }]);
    setInput("");
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages(msgs => [...msgs, { id: Date.now() + 1, text: data.response, sender: "ai" }]);
    } catch {
      setError("Oops! I couldn't reach TriviaBot. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", fontFamily: "sans-serif", background: "#f4f7fa", borderRadius: 16, boxShadow: "0 2px 8px #ccd" }}>
      <h2 style={{ color: "#1976d2", textAlign: "center" }}>TriviaBot</h2>
      <div style={{ minHeight: 200, maxHeight: 400, overflowY: "auto", border: "1px solid #90caf9", padding: 10, marginBottom: 10, background: "#fff", borderRadius: 8 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            textAlign: msg.sender === "user" ? "right" : "left",
            margin: "8px 0"
          }}>
            {msg.sender === "ai" && <span role="img" aria-label="TriviaBot" style={{ marginRight: 8 }}>🤖</span>}
            <span style={{
              display: "inline-block",
              background: msg.sender === "user" ? "#90caf9" : "#e3f2fd",
              color: "#333",
              borderRadius: 16,
              padding: "8px 14px",
              maxWidth: "70%",
              wordBreak: "break-word"
            }}>
              {msg.text}
            </span>
          </div>
        ))}
        {loading && <div style={{ color: "#1976d2", textAlign: "center" }}><i>Bot is thinking...</i></div>}
        {error && <div style={{ color: "red", textAlign: "center" }}>{error}</div>}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #90caf9" }}
          placeholder={loading ? "TriviaBot is thinking..." : "Type your trivia request..."}
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          style={{ padding: "0 18px", borderRadius: 8, background: "#1976d2", color: "#fff", border: "none", fontWeight: "bold" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
export default ChatContainer;
```

---

## 7. Testing

- **Unit:** Test `Message`, `ChatInput`, and API helpers with Jest/React Testing Library.
- **Integration:** Test `ChatContainer` with mocked API.
- **E2E:** Use Cypress or Playwright for full chat flow.
- **Accessibility:** Use Lighthouse, Axe, and manual keyboard testing.
- **Manual:** Test with users for usability and engagement.

---

## 8. Summary

- Use React functional components and hooks for state.
- Clean, trivia-focused UI with clear separation of chat and input.
- Connect to FastAPI backend at `/chat` using `fetch`.
- Show loading and error states.
- Friendly, concise, and fun for trivia fans!

---

*Let me know if you want a more modular breakdown or additional code samples!*