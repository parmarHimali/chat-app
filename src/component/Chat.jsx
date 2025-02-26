import React, { useContext, useEffect, useRef, useState } from "react";
import { data, useNavigate } from "react-router-dom";
import { Container, Form, Button, Dropdown } from "react-bootstrap";
import { IoCheckmarkDoneSharp, IoSend } from "react-icons/io5";
import { UserContext } from "../context/UserContextWrapper";
import { socket } from "../App";
import { chatContext } from "../context/ChatContextWrapper";
import { SlOptionsVertical } from "react-icons/sl";
import { BsPinAngleFill, BsPinFill } from "react-icons/bs";
import { IoMdChatbubbles } from "react-icons/io";
import { HiOutlineArrowLeft } from "react-icons/hi2";
import { toast } from "react-toastify";

const Chat = () => {
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editMessage, setEditMessage] = useState({});
  const { user } = useContext(UserContext);
  const navigateTo = useNavigate();
  const messageEnd = useRef(null);
  const { chatRoomData, setChatRoomData, details, chatUserList } =
    useContext(chatContext);

  useEffect(() => {
    console.log("details", details);
    // console.log("chat room data", chatRoomData);
    // console.log("chatUserList", chatUserList);
  }, [details, chatRoomData, chatUserList]);

  useEffect(() => {
    const isAuthorized = () => {
      return document.cookie
        .split("; ")
        .some((cookie) => cookie.startsWith("user_token="));
    };
    if (!isAuthorized()) {
      navigateTo("/signin");
    }
    socket.on("pinMessage", (data) => {
      console.log("(pin message)", data);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id == data.data._id ? { ...msg, is_pin: true } : msg
        )
      );
      toast.success(data.message);
    });
    const handleEditChat = (data) => {
      console.log("(editChat)", data);

      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.data._id
            ? { ...msg, message: data.data.message, is_edited: true }
            : msg
        )
      );
    };

    socket.on("editChat", handleEditChat);

    socket.on("unPinMessage", (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id == data.data._id ? { ...msg, is_pin: false } : msg
        )
      );
      toast.success(data.message);
    });

    return () => {
      socket.off("editChat", handleEditChat);
    };
  }, []);

  useEffect(() => {
    if (chatRoomData?.messages) {
      setMessages(
        [...chatRoomData.messages].sort(
          (a, b) => new Date(a.message_time) - new Date(b.message_time)
        )
      );
    }
  }, [chatRoomData]);

  useEffect(() => {
    messageEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleNewMessage = (data) => {
      setMessages((prev) =>
        [...prev, data.data].sort(
          (a, b) => new Date(a.message_time) - new Date(b.message_time)
        )
      );
    };
    if (data.room_type == "personal") {
      const handleGetAllMessages = (data) => {
        setChatRoomData(data.data);
        setMessages(
          [...data?.data?.messages].sort(
            (a, b) => new Date(a.message_time) - new Date(b.message_time)
          )
        );
      };

      socket.on("sendMessage", handleNewMessage);
      socket.on("getAllMessage", handleGetAllMessages);

      return () => {
        socket.off("sendMessage", handleNewMessage);
        socket.off("getAllMessage", handleGetAllMessages);
      };
    } else if (data.room_type == "group") {
      console.log("room type is group");
    }
  }, [setChatRoomData]);
  useEffect(() => {
    let timeout;
    socket.on("clearChat", (data) => {
      setMessages([]);
      setChatRoomData({ ...chatRoomData, messages: [] });
      toast.success(data.message);
    });
    socket.on("userIsTyping", (data) => {
      setTyping(data.data.chat_room_data.full_name);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setTyping("");
      }, 3000);
    });

    if (data.room_type == "personal") {
      socket.on("getAllMessage", (data) => {
        setChatRoomData(data.data);
        setMessages(
          [...data.data.messages].sort(
            (a, b) => new Date(a.message_time) - new Date(b.message_time)
          )
        );
      });
    }
    return () => {
      clearTimeout(timeout);
      socket.off("userIsTyping");
    };
  }, [socket]);

  // useEffect(() => {
  //   if (chatRoomData?.chat_room_data?._id) {
  //     socket.emit("getAllMessage", {
  //       chat_room_id: chatRoomData.chat_room_data._id,
  //       user_id: user._id,
  //       page: 1,
  //       limit: 50,
  //     });
  //   }
  // }, [chatRoomData?.chat_room_data?._id]);

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editMessage.message.trim()) {
      setIsEdit(false);
      setEditMessage({});
      return;
    }

    const updatedMessage = {
      ...editMessage,
      message: editMessage.message, // New edited message
      is_edited: true, // Mark as edited
    };

    // Emit event to the server
    socket.emit("editChat", {
      chat_room_id: chatRoomData.chat_room_data._id,
      user_id: user._id,
      chat_id: editMessage._id,
      message: editMessage.message,
      message_type: "text",
    });

    // Update state immediately instead of waiting for a server response
    setMessages((prev) =>
      prev.map((msg) => (msg._id === editMessage._id ? updatedMessage : msg))
    );

    setIsEdit(false);
    setEditMessage({});
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!msg.trim()) return;

    socket.emit("sendMessage", {
      chat_room_id: chatRoomData.chat_room_data._id,
      sender_id: user._id,
      receiver_id: chatRoomData.chat_room_data.user_id,
      message_type: "text",
      message: msg,
    });

    setMsg("");
  };

  const handleClearChat = () => {
    socket.emit("clearChat", {
      chat_room_id: chatRoomData.chat_room_data._id,
      user_id: user._id,
    });
  };

  const handleMsgPin = (msgId) => {
    socket.emit("pinMessage", {
      user_id: user._id,
      message_id: msgId,
      chat_room_id: chatRoomData.chat_room_data._id,
    });
    socket.emit("getAllMessage", {
      chat_room_id: chatRoomData.chat_room_data._id,
      user_id: user._id,
      page: 1,
      limit: 50,
    });
  };
  const handleMsgUnPin = (msgId) => {
    socket.emit("unPinMessage", {
      user_id: user._id,
      message_id: msgId,
      chat_room_id: chatRoomData.chat_room_data._id,
    });
    socket.emit("getAllMessage", {
      chat_room_id: chatRoomData.chat_room_data._id,
      user_id: user._id,
      page: 1,
      limit: 50,
    });
  };
  const handleEdit = (data) => {
    setIsEdit(true);
    setEditMessage(data);
  };
  if (Object.keys(details).length == 0) {
    return (
      <div className="start-conv">
        <IoMdChatbubbles /> <h2>Start a conversation</h2>
      </div>
    );
  }

  return (
    <Container className="p-0 right-chat">
      <div className="chat-main-container">
        <div className="chat-header-container">
          <div className="chat-header">
            <div className="back-option" onClick={() => window.history.go(-1)}>
              <HiOutlineArrowLeft />
            </div>
            <div className="user-profile">
              <img src="/user.jpg" alt="user's profile" width="50px" />
            </div>
            <div className="username">
              {/* {chatRoomData} */}
              {details.room_type == "group" ? (
                <div>{details.group_name}</div>
              ) : (
                <div>
                  {chatRoomData?.chat_room_data?.full_name || "Unknown"}
                </div>
              )}
              <div>{typing && typing != user.full_name && `typing...`}</div>
            </div>
          </div>
          <div className="options">
            <Dropdown>
              <Dropdown.Toggle as={"div"} className="remove-dropdown">
                <SlOptionsVertical />
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {messages.length != 0 && (
                  <Dropdown.Item onClick={handleClearChat}>
                    Clear Chat
                  </Dropdown.Item>
                )}
                <Dropdown.Item>Delete Chat</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        <div className="pinned-msgs">
          {chatRoomData?.pinned_message && (
            <div className="pin-msg">
              <BsPinFill /> <span>{chatRoomData?.pinned_message?.message}</span>
            </div>
          )}
        </div>
        <div
          className="chat-container"
          style={{ backgroundImage: `url(${details.chat_wallpaper})` }}
        >
          {messages.map((data) => (
            <div
              key={data._id}
              className={`msg-container ${
                data.sender_id !== user._id ? "" : "receive"
              }`}
            >
              <div className="editedMsg">{data.is_edited && "edited"}</div>
              <div className="main-msg">
                {/* username */}
                <strong className="username">
                  <div className="name">
                    <span>
                      {data.sender_id === user._id
                        ? "You"
                        : chatRoomData?.chat_room_data?.full_name}
                    </span>
                    {data.is_pin && <BsPinAngleFill />}
                  </div>
                  {/* {data.sender_id == user._id && ( */}
                  <Dropdown>
                    <Dropdown.Toggle as={"div"} className="remove-dropdown">
                      <SlOptionsVertical />
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {data.is_pin ? (
                        <Dropdown.Item onClick={() => handleMsgUnPin(data._id)}>
                          Unpin
                        </Dropdown.Item>
                      ) : (
                        <Dropdown.Item onClick={() => handleMsgPin(data._id)}>
                          Pin
                        </Dropdown.Item>
                      )}
                      {data.sender_id == user._id && (
                        <Dropdown.Item onClick={() => handleEdit(data)}>
                          Edit
                        </Dropdown.Item>
                      )}
                      <Dropdown.Item>Delete</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  {/* )} */}
                </strong>
                {/* msg */}
                <span className="msg">{data.message}</span>
                {/* time */}
                <div className="time">
                  <span>
                    {new Date(data.message_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {data.sender_id == user._id && <IoCheckmarkDoneSharp />}
                </div>
              </div>
            </div>
          ))}
          <div ref={messageEnd}></div>
        </div>

        <div className={`send-container ${isEdit && "edit-msgs"}`}>
          {isEdit && (
            <>
              <Form onSubmit={handleUpdate}>
                <Form.Text className="mb-1">Edit You message</Form.Text>
                <Form.Group className="d-flex gap-2">
                  <Form.Control
                    type="text"
                    placeholder="Edit your message..."
                    value={editMessage.message}
                    onChange={(e) => {
                      setEditMessage({
                        ...editMessage,
                        message: e.target.value,
                      });
                      socket.emit("userIsTyping", {
                        chat_room_id: chatRoomData.chat_room_data._id,
                        user_id: user._id,
                      });
                    }}
                    size="sm"
                  />

                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                    className="d-flex justify-content-center align-items-center"
                  >
                    <IoSend />
                  </Button>
                </Form.Group>
              </Form>
            </>
          )}
          {!isEdit && (
            <Form onSubmit={handleSend}>
              <Form.Group className="d-flex gap-2">
                <Form.Control
                  type="text"
                  placeholder="Type your message..."
                  value={msg}
                  onChange={(e) => {
                    setMsg(e.target.value);
                    socket.emit("userIsTyping", {
                      chat_room_id: chatRoomData.chat_room_data._id,
                      user_id: user._id,
                    });
                  }}
                  size="sm"
                />

                <Button
                  variant="success"
                  size="sm"
                  type="submit"
                  className="d-flex justify-content-center align-items-center"
                >
                  <IoSend />
                </Button>
              </Form.Group>
            </Form>
          )}
        </div>
      </div>
    </Container>
  );
};

export default Chat;
