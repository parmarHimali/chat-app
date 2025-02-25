import React, { createContext, useState } from "react";

export const chatContext = createContext();
const ChatContextWrapper = ({ children }) => {
  const [chatRoomData, setChatRoomData] = useState({});
  const [details, setDetails] = useState({});
  const [chatUserList, setChatUserList] = useState([]);
  return (
    <chatContext.Provider
      value={{
        chatRoomData,
        setChatRoomData,
        details,
        setDetails,
        chatUserList,
        setChatUserList,
      }}
    >
      {children}
    </chatContext.Provider>
  );
};

export default ChatContextWrapper;
