import { Button } from "../components/button";
import { ProfileImage } from "../components/profile/profile-image";
import {
  useAcceptorRejectFriendRequestMutation,
  useGetRecievedFriendRequestsQuery,
} from "../features/users/users.slice";

export const RecievedFriendRequests = () => {
  const { data: friendRequests } = useGetRecievedFriendRequestsQuery();
  const [acceptorRejectFriendRequest] = useAcceptorRejectFriendRequestMutation();

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-yellow-500">
      {friendRequests &&
        friendRequests.map((friendRequest) => (
          <div
            key={friendRequest.id}
            className="flex flex-col items-center justify-center m-10"
          >
            <ProfileImage
              user={friendRequest.creator}
              alt={friendRequest.creator.logging!}
              imageStyle="rounded-full h-16 w-16"
            />
            <h1 className="text-4xl">{friendRequest.creator.username}</h1>
            <h1 className="text-2xl">{friendRequest.creator.logging}</h1>
            <h1 className="text-xl">status: {friendRequest.status}</h1>
            <div>
              <Button
                text="Accept"
                onClick={() =>
                  acceptorRejectFriendRequest({
                    id: friendRequest.id,
                    status: "accepted",
                  })
                }
              />
              <Button
                text="Reject"
                onClick={() =>
                  acceptorRejectFriendRequest({
                    id: friendRequest.id,
                    status: "rejected",
                  })
                }
              />
            </div>
          </div>
        ))}
    </div>
  );
};
