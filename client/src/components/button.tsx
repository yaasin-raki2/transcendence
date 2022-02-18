import { FC } from "react";

interface IButton {
  text: string;
  onClick?: () => void;
}

export const Button: FC<IButton> = ({ text, onClick }) => {
  return (
    <button
      className="bg-red-500 hover:bg-red-700 text-white
                 font-bold py-2 px-4 rounded transition all
                 m-2"
      onClick={onClick}
    >
      {text}
    </button>
  );
};
