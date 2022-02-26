import { FC } from "react";
import { Button } from "../button";

interface IProfileInfo {
  login: string;
  username: string;
}

export const ProfileInfo: FC<IProfileInfo> = ({ login, username }) => {
  return <h1 className="text-2xl">username</h1>;
};
