import React from "react";
import ChatWith from "./ChatWith";
import Chat from "./Chat";

const ChatContainer = () => {
  return (
    <div className="split-container">
      <ChatWith />
      <Chat />
    </div>
  );
};

export default ChatContainer;
