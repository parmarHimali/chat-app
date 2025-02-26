import React, { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { io } from "socket.io-client";
import Signup from "./component/SignUp";
import "bootstrap/dist/css/bootstrap.css";
import SignIn from "./component/SignIn";
import Chat from "./component/Chat";
import { ToastContainer } from "react-toastify";
import ChatWith from "./component/ChatWith";
import ChatContainer from "./component/ChatContainer";

export const BASE_URL = "http://192.168.29.147:5000";
export const SOCKET_BASE_URL = "http://192.168.29.147:5000/v1";

export const socket = io(SOCKET_BASE_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 5000,
});

const App = () => {
  const [socketId, setSocketId] = useState("");

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected:", socket.id);
      setSocketId(socket.id);
    });
    socket.on("connect_error", (err) => {
      console.log(err);
    });
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Chat />} />
          {/* <Route path="/chatWith" element={<ChatWith />} /> */}
          <Route path="/chatWith" element={<ChatContainer />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<SignIn />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer limit={1} autoClose={2000} closeOnClick={true} />
    </>
  );
};

export default App;
