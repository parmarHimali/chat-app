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
import { IoMdAdd, IoMdRemove } from "react-icons/io";
import { toast } from "react-toastify";

const ChatWith = () => {
  const [otherUser, setOtherUser] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useContext(UserContext);
  const [group, setGroup] = useState({
    group_name: "",
    member_ids: [],
    // group_image: null,
    user_id: user._id,
  });
  const [showEdit, setShowEdit] = useState({
    id: null,
    status: false,
  });
  const {
    setChatRoomData,
    details,
    setDetails,
    setChatUserList,
    // chatRoomData,
    chatUserList,
  } = useContext(chatContext);

  useEffect(() => {
    console.log("chat user list", chatUserList);
  }, [chatUserList]);

  useEffect(() => {
    socket.emit("chatUserList", { user_id: user._id, page: 1, limit: 10 });
    socket.on("chatUserList", (data) => {
      // console.log("chat user list:", data);
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
      // console.log("(getAllMessage)", data);
      setChatRoomData(data.data);
    });
    socket.on("deleteChat", (data) => {
      console.log("(deleteChat)", data);
    });
    socket.on("readMessage", (data) => {
      console.log("(readMessage)", data);
    });
    socket.on("changeScreenStatus", (data) => {
      console.log("(changeScreenStatus)", data);
    });
    socket.on("createGroup", (data) => {
      console.log("(createGroup)", data);
      toast.success(data.message);
    });
    socket.on("getGroupDetails", (data) => {
      console.log("(getGroupDetails)", data);
      setDetails(data.data[0]);
    });
  }, [socket]);

  useEffect(() => {
    if (Object.keys(details).length > 0) {
      setLoading(true);
      socket.emit("getAllMessage", {
        chat_room_id: details._id,
        user_id: user._id,
        page: 1,
        limit: 50,
      });
    }
    socket.emit("readMessage", {
      chat_room_id: details._id,
      user_id: user._id,
    });
    socket.emit("changeScreenStatus", {
      chat_room_id: details._id,
      user_id: user._id,
    });
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
  const handleAddUserToGroup = (id) => {
    setGroup({ ...group, member_ids: [...group.member_ids, id] });
  };
  const handleRemoveUserFromGroup = (id) => {
    setGroup({
      ...group,
      member_ids: group.member_ids.filter((ids) => id !== ids),
    });
  };
  const handleCreateGroup = (e) => {
    e.preventDefault();
    console.log("group", group);
    socket.emit("createGroup", group);
  };
  const handleOpenGroup = (cid) => {
    socket.emit("getGroupDetails", { chat_room_id: cid, user_id: user._id });
  };
  return (
    <>
      <Container className="mt-3 left-chat">
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
                    <strong className="d-flex gap-2">
                      {users.room_type == "personal" && (
                        <span onClick={() => handleOpenChat(users.user_id)}>
                          {users.full_name}
                        </span>
                      )}
                      {users.room_type == "group" && (
                        <span onClick={() => handleOpenGroup(users._id)}>
                          {users.group_name}
                        </span>
                      )}
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
                  <div className="msg d-flex">
                    <div className="d-flex gap-1">
                      <span>
                        {/* last msg */}
                        {users.last_msg_sender_id == user._id && (
                          <IoCheckmarkDoneSharp style={{ color: "blue" }} />
                        )}
                      </span>
                      <span>{users.last_msg}</span>
                    </div>
                    {users.unread_count !== 0 && (
                      <span className="unread-count">{users.unread_count}</span>
                    )}
                  </div>
                </Row>
              </Col>
            );
          })}
        </Row>

        {/* create group */}
        <Row>
          <Col
            sm={{ span: 6, offset: 3 }}
            className="form-container p-4 rounded"
          >
            <Form onSubmit={handleCreateGroup}>
              <Form.Group className="mb-2">
                <Form.Label>Create a Group</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  placeholder="Enter group name"
                  value={group.group_name}
                  onChange={(e) =>
                    setGroup({ ...group, group_name: e.target.value })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>group photo</Form.Label>
                <Form.Control
                  size="sm"
                  type="file"
                  onChange={(e) =>
                    setGroup({ ...group, group_image: e.target.files[0] })
                  }
                />
              </Form.Group>
              {group.member_ids.length !== 0 && (
                <div className="selected">
                  <span className="fw-normal">Selected Users: </span>
                  {chatUserList.map((users, idx) => {
                    return (
                      <span key={users._id}>
                        {idx != 0 && ", "}
                        {group.member_ids.includes(users.user_id) &&
                          users.full_name}{" "}
                      </span>
                    );
                  })}
                </div>
              )}
              <div className="user-list-grp">
                {chatUserList.map((users) => {
                  return (
                    users.room_type == "personal" && (
                      <div
                        key={users.user_id}
                        className="d-flex gap-2 justify-content-between"
                      >
                        <span>{users.full_name}</span>
                        {group.member_ids.includes(users.user_id) ? (
                          <div
                            className="btn-add btn-remove"
                            onClick={() =>
                              handleRemoveUserFromGroup(users.user_id)
                            }
                          >
                            <IoMdRemove />
                          </div>
                        ) : (
                          <div
                            className="btn-add"
                            onClick={() => handleAddUserToGroup(users.user_id)}
                          >
                            <IoMdAdd />
                          </div>
                        )}
                      </div>
                    )
                  );
                })}
              </div>
              <Button type="submit" size="sm">
                Create
              </Button>
            </Form>
          </Col>
        </Row>
        {/* chat with  */}
        {/* <Row>
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
              <Button type="submit" size="sm">
                Chat
              </Button>
            </Form>
          </Col>
        </Row> */}
      </Container>
    </>
  );
};

export default ChatWith;
