import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { Button } from "../components/button";
import { ChangeAvatarButton } from "../components/profile/change-avatar";
import { ChangeUsernameButton } from "../components/profile/change-username";
import { ProfileImage } from "../components/profile/profile-image";
import {
  useAcceptorRejectFriendRequestMutation,
  useGetUserWithAvatarQuery,
} from "../features/users/users.slice";

export const User = () => {
  const params = useParams();
  const { data: user } = useGetUserWithAvatarQuery(+params.id!);

  const [acceptorRejectFriendRequest] = useAcceptorRejectFriendRequestMutation();

  const onRecievedRequestsClick = async () => {
    const res = await axios.get(
      "http://localhost:3000/api/friend-request/me/received-requests",
      {
        withCredentials: true,
      }
    );
    console.log(res.data);
  };

  return (
    <div>
      {user && user.avatar && (
        <div className="flex flex-col justify-center items-center h-screen bg-yellow-500">
          <ProfileImage user={user} alt={user?.logging!} />
          <div>
            <div className="flex flex-col  justify-center items-center">
              <h1 className="text-4xl">{user.username}</h1>
              <h1 className="text-2xl">{user.logging}</h1>
            </div>
            <div className="flex flex-col sm:flex-row justify-center items-center">
              <ChangeUsernameButton userId={user.id} />
              <ChangeAvatarButton userId={user.id} />
              <Link to={`/friends/${params.id}`}>
                <Button text="Friends" />
              </Link>
              <Link to={`/friends/recieved-requests/${params.id}`}>
                <Button text="recievedRequests" />
              </Link>
              <Button
                text="acceptFriendRequest"
                onClick={() => acceptorRejectFriendRequest({ id: 1, status: "accepted" })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
