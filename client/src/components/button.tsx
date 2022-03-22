import { FC } from "react";

interface IButton {
  text: string;
  onClick?: () => void;
}

export const Button: FC<IButton> = ({ children, text, onClick }) => {
  return (
    <button
      className="bg-yellow-400 hover:bg-yellow-500 text-white text-s
                 font-bold py-2 px-4 rounded transition all
                 m-2"
      onClick={onClick}
    >
      {text}
      {children}
    </button>
  );
};
