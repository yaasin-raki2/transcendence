import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/home";
import { Profile } from "./pages/profile";
import { User } from "./pages/user";
import { Friends } from "./pages/friends";
import { RecievedFriendRequests } from "./pages/recieved-friend-requests";
import { Chat } from "./pages/chat";
import { Rooms } from "./pages/rooms";
import { Mock } from "./pages/mock";
import { RecievedAndSentRoomRequests } from "./pages/recieved&sent-room-requests";
import { RoomMembers } from "./pages/room-members";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/room" element={<Rooms />} />
          <Route path="/room/:roomName/members" element={<RoomMembers />} />
          <Route
            path="room/recieved-sent-room-requests"
            element={<RecievedAndSentRoomRequests />}
          />
          <Route path="/mock" element={<Mock />} />
          <Route path="/user/:id" element={<User />} />
          <Route path="/friends/:id" element={<Friends />} />
          <Route path="/friends/recieved-requests/:id" element={<RecievedFriendRequests />} />
          <Route path="*" element={<p>There's nothing here!</p>} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// TODO: Add Room Admin Page
