import { FC, useEffect } from "react";
import { useAppDispatch, useAppSelctor } from "../../app/hook";
import { setProfileImage } from "../../features/users/prosile-images.slice";
import { DatabaseFile } from "../../interfaces/database-file";

interface IProfileImage {
  src: DatabaseFile;
  alt: string;
}

export const ProfileImage: FC<IProfileImage> = ({ src, alt }) => {
  const dispatch = useAppDispatch();

  const profileImage = useAppSelctor((state) =>
    state.profileImages.find((image) => image.id === src.id)
  );

  useEffect(() => {
    if (!profileImage) {
      const base64String = btoa(
        new Uint8Array(src.data.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      const image = `data:image/jpeg;base64,${base64String}`;
      dispatch(setProfileImage({ src: image, id: src.id }));
    }
  }, [profileImage]);

  return (
    <div className="flex-none w-48 h-52 mb-10 relative z-10 before:absolute before:top-1 before:left-1 before:w-full before:h-full bg-red-500 hover:bg-red-700">
      <img
        src={profileImage?.src}
        alt={alt}
        className="absolute z-10 realative top-1 left-1 inset-0 w-full h-full object-cover"
      />
    </div>
  );
};
