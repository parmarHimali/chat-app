import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import UserContextWrapper from "./context/UserContextWrapper.jsx";
import ChatContextWrapper from "./context/ChatContextWrapper.jsx";

createRoot(document.getElementById("root")).render(
  <ChatContextWrapper>
    <UserContextWrapper>
      <App />
    </UserContextWrapper>
  </ChatContextWrapper>
);
