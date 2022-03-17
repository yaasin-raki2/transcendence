import { FC, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "../components/button";
import { useLazyGetUserByIdQuery } from "../features/users/users.slice";

export const Profile: FC = () => {
  const [value, setValue] = useState<number>(1);

  const [getUserById, user] = useLazyGetUserByIdQuery({
    selectFromResult: (res) => res.data,
  });

  const [preview, setPreview] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<File>();

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type.substr(0, 5) === "image") {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setAvatar(file);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
      console.log("not an image");
    }
  }, []);

  const onUpdateAvatarClick = async () => {
    const formData = new FormData();
    formData.append("file", avatar as Blob, avatar?.name);
    await fetch("http://localhost:3000/api/user/avatar", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    await getUserById(value);
  };

  console.log(user);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

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
      <h1 className="text-xl">Avatar id: {user?.avatarId}</h1>

      {preview ? (
        <div>
          <img
            src={preview}
            className="w-64 h-64 object-cover cursor-pointer"
            alt="preview"
            onClick={() => setPreview(null)}
          />
          <Button text="Update Avatar with this image" onClick={onUpdateAvatarClick} />
        </div>
      ) : (
        <div {...getRootProps()}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <Button text={"Select a file"} />
          )}
        </div>
      )}
    </div>
  );
};
