import React from "react";
import ChatWith from "./ChatWith";
import Chat from "./Chat";
import { socket } from "../App";

const ChatContainer = () => {
  return (
    <div className="split-container">
      <ChatWith />
      <Chat />
    </div>
  );
};

export default ChatContainer;
