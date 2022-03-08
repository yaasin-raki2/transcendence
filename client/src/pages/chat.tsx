import { FC, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
//@ts-ignore
import ScrollToBottom from "react-scroll-to-bottom";
import "./App.css";

export const Chat = () => {
  const [username, setUsername] = useState<string>("");
  const [room, setRoom] = useState<string>("");
  const [showChat, setShowChat] = useState<boolean>(false);
  let socket: Socket = {} as Socket;

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", { name: room, state: "public" });
      setShowChat(true);
    }
  };

  useEffect(() => {
    socket = io("http://localhost:3000", { withCredentials: true });
    socket.on("exception", (message: string) => {
      console.log("Wa error a zabi");
      console.log(message);
    });
    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
    socket.on("error", (message: string) => {
      console.log("lqiitooo");
    });
    socket.on("receive_message", (data) => {
      console.log(data);
    });
  }, []);

  return (
    <div className="App">
      {!showChat ? (
        <div className="joinChatContainer">
          <h3>Join a chat</h3>
          <input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
          <input
            type="text"
            placeholder="Room ID..."
            onChange={(e) => setRoom(e.target.value)}
          />
          <button onClick={joinRoom}>Join A Room</button>
        </div>
      ) : (
        <LiveChat socket={socket} username={username} room={room} />
      )}
    </div>
  );
};

interface IChat {
  socket: Socket;
  username: string;
  room: string;
}

interface Message {
  room: string;
  author: string;
  message: string;
  time: string;
}

export const LiveChat: FC<IChat> = ({ socket, username, room }) => {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState<Message[]>([]);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData: Message = {
        room,
        author: username,
        message: currentMessage,
        time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((prev) => [...prev, messageData]);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      console.log(data);
      setMessageList((prev) => [...prev, data]);
    });
  }, [socket]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
      </div>
      <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.map((message, index) => (
            <div
              key={index}
              className="message"
              id={username === message.author ? "you" : "other"}
            >
              <div>
                <div className="message-content">
                  <p>{message.message}</p>
                </div>
                <div className="message-meta">
                  <p id="time">{message.time}</p>
                  <p id="author">{message.author}</p>
                </div>
              </div>
            </div>
          ))}
        </ScrollToBottom>
      </div>
      <div className="chat-footer">
        <input
          value={currentMessage}
          type="text"
          placeholder="Hey..."
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
};
