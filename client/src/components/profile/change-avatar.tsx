import { FC, useRef } from "react";
import { useAppDispatch } from "../../app/hook";
import { setProfileImage } from "../../features/users/prosile-images.slice";
import { useLazyGetUserByIdQuery } from "../../features/users/users.slice";
import { Button } from "../button";
import { parseImage } from "./profile-image";

interface IChangeAvatarButtonProps {
  userId: number;
}

export const ChangeAvatarButton: FC<IChangeAvatarButtonProps> = ({ userId }) => {
  const dispatch = useAppDispatch();

  const [getUserById] = useLazyGetUserByIdQuery({
    selectFromResult: (res) => res.data,
  });

  const inputRef = useRef<HTMLInputElement>(null);

  const updateAvatar = async (avatar: File) => {
    const formData = new FormData();
    formData.append("file", avatar as Blob, avatar?.name);
    await fetch("http://localhost:3000/api/user/avatar", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const { data: user } = await getUserById(userId);
    const image = parseImage(user?.avatar?.data.data!);
    dispatch(setProfileImage({ src: image, id: user?.id! }));
  };

  const onFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files![0];
    if (file && file.type.substr(0, 5) === "image") {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateAvatar(file);
      };
      reader.readAsDataURL(file);
    } else {
      console.log("not an image");
    }
  };

  return (
    <div>
      <input type="file" hidden ref={inputRef} onChange={onFileUpload} />
      <Button text="Update Image" onClick={() => inputRef.current?.click()}></Button>
    </div>
  );
};
