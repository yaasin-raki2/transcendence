import axios from "axios";
import { useState } from "react";
import { Button } from "../components/button";
import { User } from "../interfaces/user";

export const HomePage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const onClick = async () => {
    const { data } = await axios.get("http://localhost:3000/api/user/");
    setUsers(data);
    console.log(users);
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h1 className="text-center text-4xl font-bold">Home Page</h1>
      <Button text="HuH" onClick={onClick} />
      {users && users.map((user) => <h1 key={user.id}>{user.logging}</h1>)}
    </div>
  );
};
