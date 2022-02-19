import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/button";
import {
  useLazyGetAllUsersQuery,
  useUpdateUserMutation,
} from "../features/users/users.slice";

export const HomePage = () => {
  const [getAllUsers, res] = useLazyGetAllUsersQuery();
  const [updateUser, { data }] = useUpdateUserMutation();
  const [value, setValue] = useState("Hi");

  const users = res.data;

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <input
        className="bg-gray-200 appearance-none border-2 border-gray-200 rounded-md"
        name="huh"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <h1 className="text-center text-4xl font-bold">Home Page</h1>
      <Button text="HuH" onClick={() => getAllUsers("", true)} />
      {users?.map((user) => (
        <h1 key={user.id}>{user.username}</h1>
      ))}
      <Button
        text={"Update : " + value}
        onClick={async () => updateUser({ id: 1, username: value })}
      />
      {data?.username}
      <Link to="/profile">
        <Button text="Profile" />
      </Link>
    </div>
  );
};
