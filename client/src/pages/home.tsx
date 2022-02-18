import { useState } from "react";
import { Button } from "../components/button";
import {
  useGetAllUsersQuery,
  useUpdateUserMutation,
} from "../features/users/users.slice";

export const HomePage = () => {
  const [skip, setSkip] = useState(true);
  const { data: users, error, isLoading, refetch } = useGetAllUsersQuery("", { skip });
  const [updateUser, { data }] = useUpdateUserMutation();
  const [value, setValue] = useState("Hi");

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
      <Button text="HuH" onClick={() => setSkip((prev) => !prev)} />
      {users?.map((user) => (
        <h1 key={user.id}>{user.username}</h1>
      ))}
      <Button
        text={"Update : " + value}
        onClick={async () => updateUser({ id: 1, username: value })}
      />
      {data?.username}
    </div>
  );
};
