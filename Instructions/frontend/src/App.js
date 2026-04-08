import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Box,
  Paper,
  Typography,
  Divider,
  TextField,
  Button,
  Avatar,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

// Main App component
function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    { sender: "ai", text: "Welcome! I'm TriviaBot 🤖. Ask me for a trivia question or try to stump me!" }
  ]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const chatboxMaxWidth = 1000;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  // Function to send a message to the backend and update chat
  const sendMessage = async () => {
    if (!message.trim()) return; // Ignore empty messages
    setLoading(true); // Show loading
    setChat(prev => [...prev, { sender: "user", text: message }]); // Add user message to chat
    setMessage(""); // Clear input
    try {
      // Send message to backend API
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      // Add AI response to chat
      setChat(prev => [...prev, { sender: "ai", text: data.response }]);
    } catch (err) {
      // Show error if backend can't be reached
      setChat(prev => [...prev, { sender: "ai", text: "Error: Could not reach backend." }]);
    }
    setLoading(false); // Hide loading
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        position: "relative",
        bgcolor: "#f0f7ff",
        fontFamily: "'Fredoka', Arial, sans-serif",
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          position: "fixed",
          left: 0,
          top: 0,
          height: "100vh",
          width: sidebarOpen ? "300px" : "0px",
          bgcolor: "#1565c0",
          color: "#fff",
          boxShadow: sidebarOpen ? "2px 0 8px #90caf9" : "none",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          transition: "width 0.3s ease",
          overflow: "hidden",
          zIndex: 100,
        }}
      >
        {/* Toggle button inside sidebar */}
        <Button
          onClick={() => setSidebarOpen(false)}
          sx={{
            color: "#fff",
            mt: 2,
            mb: 2,
            minWidth: "auto",
            padding: "8px",
          }}
        >
          <CloseIcon fontSize="large" />
        </Button>

        {/* Logo in sidebar */}
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            px: 2,
            py: 2,
          }}
        >
          <img 
            src="/triviabot-logo.png" 
            alt="TriviaBot Logo" 
            style={{ 
              width: "100%",
              height: "auto",
              maxWidth: "120px",
              padding: "5px"
            }} 
          />
          <Typography
            variant="h6"
            sx={{
              fontFamily: "'Fredoka', Arial, sans-serif",
              marginTop: "10px",
              color: "#fff",
              fontWeight: 700,
              textAlign: "center",
              fontSize: "0.9rem",
            }}
          >
            TriviaBot
          </Typography>
        </Box>
      </Box>

      {/* Main content area */}
      <Box
        sx={{
          marginLeft: sidebarOpen ? "300px" : "0px",
          flex: 1,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          bgcolor: "rgba(255,255,255,0.97)",
          position: "relative",
          overflow: "hidden",
          transition: "margin-left 0.3s ease",
        }}
      >
        {/* Menu button when sidebar is closed */}
        {!sidebarOpen && (
          <Button
            onClick={() => setSidebarOpen(true)}
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              color: "#1565c0",
              zIndex: 5,
              minWidth: "auto",
              padding: "8px",
            }}
          >
            <MenuIcon fontSize="large" />
          </Button>
        )}
        {/* Centered Chat Container */}
        <Box
          sx={{
            width: "100%",
            maxWidth: chatboxMaxWidth,
            minWidth: 320,
            mx: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            height: "100%",
          }}
        >
          {/* Chat Title */}
          <Typography
            variant="h5"
            sx={{
              color: "#1565c0",
              fontFamily: "'Comic Neue', Arial, sans-serif",
              fontWeight: 700,
              fontSize: "2.2rem",
              textAlign: "center",
              letterSpacing: 1,
              textShadow: "1px 1px 0 #bbdefb",
              pt: 4,
              pb: 1.5,
              width: "100%",
            }}
          >
            Chat
          </Typography>
          <Divider
            sx={{
              borderColor: "#90caf9",
              borderBottomWidth: 2,
              width: "100%",
              mb: 1,
            }}
          />
          {/* Chat Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              width: "100%",
              maxWidth: chatboxMaxWidth,
              minWidth: 320,
              px: 2,
              pb: 13,
              pt: 1,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Render each message in the chat */}
            {chat.map((msg, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                  my: 1,
                  alignItems: "flex-start",
                }}
              >
                {/* Show avatar for AI messages */}
                {msg.sender === "ai" && (
                  <Avatar
                    sx={{
                      bgcolor: "#bbdefb",
                      color: "#1976d2",
                      width: 36,
                      height: 36,
                      mr: 1,
                    }}
                  >
                    <ChatBubbleOutlineIcon />
                  </Avatar>
                )}
                {/* User message in speech bubble, AI message as plain text */}
                {msg.sender === "user" ? (
                  <Paper
                    elevation={4}
                    sx={{
                      background: "linear-gradient(135deg, #64b5f6 60%, #1976d2 100%)",
                      color: "#fff",
                      borderRadius: 4,
                      px: 2.5,
                      py: 1.5,
                      maxWidth: "70%",
                      wordBreak: "break-word",
                      fontWeight: 600,
                      fontFamily: "'Comic Neue', Arial, sans-serif",
                      fontSize: "1.15rem",
                      boxShadow: "0 2px 8px #90caf9",
                    }}
                  >
                    {msg.text}
                  </Paper>
                ) : (
                  <Typography
                    sx={{
                      bgcolor: "transparent",
                      color: "#0d47a1",
                      fontWeight: 600,
                      fontFamily: "'Comic Neue', Arial, sans-serif",
                      fontSize: "1.15rem",
                      maxWidth: "70%",
                      wordBreak: "break-word",
                      px: 0,
                      py: 0.5,
                    }}
                  >
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </Typography>
                )}
              </Box>
            ))}
            {/* Show loading/typing indicator when bot is thinking */}
            {loading && (
              <Typography
                sx={{
                  color: "#1976d2",
                  textAlign: "center",
                  mt: 1,
                  fontFamily: "'Comic Neue', Arial, sans-serif",
                  fontStyle: "italic",
                }}
              >
                Bot is thinking
                <span className="typing-dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </Typography>
            )}
            {/* Dummy div to scroll to the bottom */}
            <div ref={messagesEndRef} />
          </Box>
        </Box>
        {/* Floating Input Area */}
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            bottom: 16,
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: chatboxMaxWidth,
            minWidth: 320,
            bgcolor: "#fff",
            borderRadius: 8,
            boxShadow: "0 4px 24px #90caf9",
            display: "flex",
            gap: 2,
            alignItems: "center",
            p: 1.5,
            border: "2px solid #90caf9",
            zIndex: 10,
          }}
        >
          {/* Input field for typing messages */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder={loading ? "TriviaBot is thinking..." : "Type your trivia request..."}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            disabled={loading}
            sx={{
              background: "#f0f7ff",
              borderRadius: 2,
              fontFamily: "'Comic Neue', Arial, sans-serif",
            }}
          />
          {/* Send button */}
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={loading || !message.trim()}
            sx={{
              borderRadius: 2,
              px: 4,
              fontWeight: "bold",
              fontSize: 18,
              boxShadow: "0 2px 8px #90caf9",
              fontFamily: "'Comic Neue', Arial, sans-serif",
              background: "linear-gradient(135deg, #1976d2 60%, #64b5f6 100%)",
              color: "#fff",
              "&:disabled": {
                background: "#bbdefb",
                color: "#fff",
              },
            }}
          >
            Send
          </Button>
        </Box>
        {/* Typing dots animation and mascot bounce */}
        <style>{`
          .typing-dots span {
            animation: blink 1.4s infinite both;
          }
          .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
          .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
          @keyframes blink {
            0%, 80%, 100% { opacity: 0; }
            40% { opacity: 1; }
          }
        `}</style>
      </Box>
    </Box>
  );
}

export default App;