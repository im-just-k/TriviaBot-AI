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
  Drawer,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

// Main App component
function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([
    { sender: "ai", text: "Welcome! I'm TriviaBot 🤖. Ask me for a trivia question or try to stump me!" }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Dynamically calculate sidebar width so chatbox is centered
  const chatboxMaxWidth = 1000;
  const minSidebarWidth = 120;
  const [sidebarWidth, setSidebarWidth] = useState(() =>
    Math.max((window.innerWidth - chatboxMaxWidth) / 2, minSidebarWidth)
  );

  useEffect(() => {
    // Update sidebar width on resize to keep chatbox centered
    const handleResize = () => {
      setSidebarWidth(Math.max((window.innerWidth - chatboxMaxWidth) / 2, minSidebarWidth));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      const res = await fetch("http://127.0.0.1:8000/chat", {
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
    // Main container for the app layout
    <Box
      sx={{
        minHeight: "100vh",
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "row",
        bgcolor: "linear-gradient(135deg, #e3f0ff 0%, #90caf9 100%)",
        fontFamily: "'Fredoka', Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Sidebar using MUI Drawer */}
      <Drawer
        variant="permanent"
        PaperProps={{
          sx: {
            width: sidebarWidth,
            bgcolor: "#1565c0",
            color: "#fff",
            border: "none",
            boxShadow: "2px 0 8px #90caf9",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }
        }}
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: sidebarWidth,
            boxSizing: "border-box",
          },
        }}
        open
      >
        {/* Logo centered in sidebar */}
        <Box
          sx={{
            width: "100%",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <img 
              src="/triviabot-logo.png" 
              alt="TriviaBot Logo" 
              style={{ 
                width: 'calc(100% - 20px)',
                height: 'auto',
                maxWidth: '500px',
                padding: '10px'
              }} 
            />
            <Typography
              variant="h4"
              sx={{
                fontFamily: "'Fredoka', Arial, sans-serif",
                marginTop: '10px',
                color: '#1976d2',
                fontWeight: 500
              }}
            >
              TriviaBot AI
            </Typography>
          </Box>
        </Box>
      </Drawer>
      {/* Right: Chatbox */}
      <Box
        sx={{
          flex: 1,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          bgcolor: "rgba(255,255,255,0.97)",
          position: "relative",
          overflow: "hidden",
        }}
      >
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