import { FC } from "react";

interface IProfileInfo {
  login: string;
  username: string;
}

export const ProfileInfo: FC<IProfileInfo> = ({ login, username }) => {
  return (
    <div className="relative flex flex-wrap items-baseline pb-6 before:bg-black before:absolute before:-top-6 before:bottom-0 before:-left-60 before:-right-6">
      <h1 className="relative w-full flex-none mb-2 text-2xl font-semibold text-white">
        {username}
      </h1>
      <h3 className="relative text-base text-white">{login}</h3>
    </div>
  );
};
