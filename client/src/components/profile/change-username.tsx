import { FC, useState } from "react";
import { useUpdateUserMutation } from "../../features/users/users.slice";
import { Button } from "../button";

interface IChangeUsernameButtonProps {
  userId: number;
}

export const ChangeUsernameButton: FC<IChangeUsernameButtonProps> = ({ userId }) => {
  const [hidden, setHidden] = useState<boolean>(true);
  const [username, setUsername] = useState<string>("");

  const [updateUser] = useUpdateUserMutation();

  const onClick = async () => {
    if (!hidden) {
      updateUser({ id: userId, username });
    }
    setHidden(!hidden);
  };

  return (
    <div className="flex flex-col">
      <Button onClick={onClick} text={hidden ? "Change username" : "Save username"} />
      <input
        className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline transition-all mt-5 mb-5"
        id="password"
        placeholder="Edit Username here"
        hidden={hidden}
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
    </div>
  );
};
