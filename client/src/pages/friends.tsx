import { useParams } from "react-router-dom";
import { ProfileImage } from "../components/profile/profile-image";
import { useGetFriendsQuery } from "../features/users/users.slice";

export const Friends = () => {
  const { id } = useParams();
  const { data: users } = useGetFriendsQuery(+id!);

  return (
    <div>
      {users && (
        <div className="flex flex-col items-center h-screen bg-yellow-500">
          {users.map((user) => (
            <div key={user.id} className="flex flex-col items-center justify-center m-10">
              <ProfileImage user={user} alt={user.logging!} />
              <h1 className="text-4xl">{user.username}</h1>
              <h1 className="text-2xl">{user.logging}</h1>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
