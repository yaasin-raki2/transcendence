import { useParams } from "react-router-dom";
import { ChangeAvatarButton } from "../components/profile/change-avatar";
import { ProfileImage } from "../components/profile/profile-image";
import { ProfileInfo } from "../components/profile/profile-info";
import { useGetUserWithAvatarQuery } from "../features/users/users.slice";

export const User = () => {
  const params = useParams();
  const { data: user } = useGetUserWithAvatarQuery(+params.id!);

  return (
    <div>
      {user && user.avatar && (
        <div className="flex p-6 font-mono">
          <ProfileImage src={user?.avatar!} alt={user?.logging!} />
          <div className="flex-auto pl-6 ">
            <ProfileInfo username={user?.username!} login={user?.logging!} />
            <div className="flex space-x-2 mb-4 mt-4 text-sm font-medium">
              <div className="flex space-x-4">
                <ChangeAvatarButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
