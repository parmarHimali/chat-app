import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Col,
  Container,
  Dropdown,
  Row,
  Spinner,
} from "react-bootstrap";
import { Form } from "react-bootstrap";
import { socket } from "../App";
import { UserContext } from "../context/UserContextWrapper";
import { useNavigate } from "react-router-dom";
import { chatContext } from "../context/ChatContextWrapper";
import { SlOptionsVertical } from "react-icons/sl";
import { IoCheckmarkDoneSharp } from "react-icons/io5";

const ChatWith = () => {
  const [otherUser, setOtherUser] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEdit, setShowEdit] = useState({
    id: null,
    status: false,
  });
  const {
    setChatRoomData,
    details,
    setDetails,
    setChatUserList,
    chatUserList,
  } = useContext(chatContext);
  const { user } = useContext(UserContext);

  const navigateTo = useNavigate();
  useEffect(() => {
    socket.emit("chatUserList", { user_id: user._id, page: 1, limit: 10 });
    socket.on("chatUserList", (data) => {
      console.log("chat user list:", data);
      setChatUserList(data.data);
    });
  }, []);
  useEffect(() => {
    socket.on("createRoom", (data) => {
      console.log("(createRoom)", data);
      setDetails(data.data);
    });
    socket.on("getAllMessage", (data) => {
      setLoading(false);
      console.log("(getAllMessage)", data);
      setChatRoomData(data.data);
      // navigateTo("/");
    });
    socket.on("deleteChat", (data) => {
      console.log("(deleteChat)", data);
    });
    socket.on("readMessage", (data) => {
      console.log("(readMessage)", data);
    });
  }, [socket]);

  useEffect(() => {
    console.log(details);

    if (Object.keys(details).length > 0) {
      setLoading(true);
      socket.emit("getAllMessage", {
        chat_room_id: details._id,
        user_id: user._id,
        page: 1,
        limit: 50,
      });
    }
    socket.emit("readMessage", { chat_room_id: details._id });
  }, [details]);

  const handleChat = (e) => {
    e.preventDefault();
    socket.emit("createRoom", { user_id: user._id, other_user_id: otherUser });
  };
  const handleOpenChat = (id) => {
    socket.emit("createRoom", { user_id: user._id, other_user_id: id });
  };
  const handleDeleteChat = (chat_room_id, chat_ids, user_id) => {
    socket.emit("deleteChat", {
      chat_room_id,
      chat_ids,
      user_id,
    });
  };
  if (loading) {
    return (
      <div className="loading">
        <Spinner animation="grow" variant="secondary" />
      </div>
    );
  }
  return (
    <>
      <Container className="mt-3">
        <h4>Chats</h4>
        <Row className="chat-list my-3">
          {chatUserList?.map((users) => {
            return (
              <Col
                className="chat-data"
                key={users._id}
                style={{
                  backgroundColor:
                    details && details._id == users._id && "#55555524",
                }}
              >
                <img
                  src={
                    users.profile_picture == null
                      ? "/user.jpg"
                      : user.profile_picture
                  }
                  alt="profile picture"
                  width={"50px"}
                />
                <Row className="w-100 chat-content">
                  <div className="user-time d-flex justify-content-between">
                    {/* username */}
                    <strong onClick={() => handleOpenChat(users.user_id)}>
                      {users.full_name}
                    </strong>

                    {/* time */}
                    <div className="time">
                      <span>
                        {new Date(users.last_msg_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      <Dropdown>
                        <Dropdown.Toggle as="div" className="remove-dropdown">
                          <SlOptionsVertical
                            onClick={() =>
                              setShowEdit({
                                id: showEdit.id == null ? users._id : null,
                                status: !showEdit.status,
                              })
                            }
                          />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item>Edit</Dropdown.Item>
                          <Dropdown.Item>Clear Chat</Dropdown.Item>
                          <Dropdown.Item
                            onClick={() =>
                              handleDeleteChat(
                                users._id,
                                [users.user_id],
                                user._id
                              )
                            }
                          >
                            Delete
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  </div>
                  <div className="msg d-flex gap-1">
                    <span>
                      {/* last msg */}
                      {users.last_msg_sender_id == user._id && (
                        <IoCheckmarkDoneSharp style={{ color: "blue" }} />
                      )}
                    </span>
                    <span>{users.last_msg}</span>
                  </div>
                </Row>
              </Col>
            );
          })}
        </Row>
        <Row>
          <Col
            sm={{ span: 6, offset: 3 }}
            className="form-container p-4 rounded"
          >
            <Form onSubmit={handleChat}>
              <Form.Group className="mb-2">
                <Form.Label>Chat With</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  value={otherUser}
                  onChange={(e) => setOtherUser(e.target.value)}
                />
              </Form.Group>
              <Button type="submit">Chat</Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ChatWith;
