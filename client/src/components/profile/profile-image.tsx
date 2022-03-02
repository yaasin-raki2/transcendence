import { FC, useEffect } from "react";
import { useAppDispatch, useAppSelctor } from "../../app/hook";
import { setProfileImage } from "../../features/users/prosile-images.slice";
import { User } from "../../interfaces/user";

interface IProfileImage {
  user: User;
  alt: string;
  imageStyle?: string;
}

export const parseImage = (image: Uint8Array): string => {
  const base64String = btoa(
    new Uint8Array(image).reduce((data, byte) => data + String.fromCharCode(byte), "")
  );
  const imageUrl = `data:image/jpeg;base64,${base64String}`;
  return imageUrl;
};

export const ProfileImage: FC<IProfileImage> = ({
  user: { avatar: src, id: userId },
  alt,
  imageStyle = "h-64 w-64",
}) => {
  const dispatch = useAppDispatch();

  const profileImage = useAppSelctor((state) =>
    state.profileImages.find((image) => image.id === userId)
  );

  useEffect(() => {
    if (!profileImage) {
      const image = parseImage(src?.data.data!);
      dispatch(setProfileImage({ src: image, id: userId }));
    }
  }, [profileImage]);

  return <img src={profileImage?.src} alt={alt} className={imageStyle} />;
};
