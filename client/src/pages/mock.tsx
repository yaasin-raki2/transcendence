import axios from "axios";
import { FC, useState } from "react";
import { Button } from "../components/button";

export const Mock: FC = () => {
  const [logging, setLogging] = useState<string>("");
  const [username, setUsername] = useState<string>("");

  const onSignUp = async () => {
    await axios.post(
      "http://localhost:3000/api/auth-mock/sign-up",
      { logging, username },
      { withCredentials: true }
    );
  };

  const onLogin = async () => {
    await axios.post(
      "http://localhost:3000/api/auth-mock/login",
      { logging },
      { withCredentials: true }
    );
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-yellow-500">
      <h1 className="text-4xl">Mock Page</h1>
      <div>
        <img src="http://localhost:3000/api/user/me/avatar" alt="huh" />
      </div>
      <input
        className="bg-gray-200 appearance-none border-2 border-gray-200 rounded-md m-2"
        type="text"
        placeholder="logging"
        value={logging}
        onChange={(e) => setLogging(e.target.value)}
      />
      <input
        className="bg-gray-200 appearance-none border-2 border-gray-200 rounded-md m-2"
        type="text"
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Button text="SignUp" onClick={onSignUp} />
      <Button text="Login" onClick={onLogin} />
    </div>
  );
};
