import { useState } from "react";
import { Button } from "../components/button";
import { useLazyGetUserByIdQuery } from "../features/users/users.slice";

export const Profile = () => {
  const [value, setValue] = useState<number>(1);

  const [getUserById, res] = useLazyGetUserByIdQuery();

  const user = res.data;

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <input
        className="bg-gray-200 appearance-none border-2 border-gray-200 rounded-md w-3"
        name="huh"
        type="text"
        value={value}
        onChange={(e) => setValue(+e.target.value)}
      />
      <Button text={"user : " + value} onClick={() => getUserById(value, true)} />
      <h1 className="text-xl">Username: {user?.logging}</h1>
      <h1 className="text-xl">Login: {user?.username}</h1>
    </div>
  );
};
