import axios from "axios";
import { useState } from "react";
import { Button } from "../components/button";
import QRCode from "qrcode";
import {
  useGetCurrentUserQuery,
  useLogoutMutation,
  useTurnOffTwoFactorAuthMutation,
  useTurnOnTwoFactorAuthMutation,
} from "../features/users/users.slice";

export const HomePage = () => {
  const [qrCode, setQrCode] = useState<string>();
  const [code2fa, setCode2fa] = useState<string>("");

  let { data: user, isError } = useGetCurrentUserQuery();

  const on2FAClick = async () => {
    const { data } = await axios.get("http://localhost:3000/api/2fa/generate", {
      withCredentials: true,
    });
    QRCode.toDataURL(data, (err, url) => setQrCode(url));
  };

  const onAuth2FAClick = async () => {
    await axios.post(
      "http://localhost:3000/api/2fa/authenticate",
      { code2fa },
      { withCredentials: true }
    );
  };

  const [turnOn2FA] = useTurnOnTwoFactorAuthMutation();
  const [turnOff2FA] = useTurnOffTwoFactorAuthMutation();
  const [logout] = useLogoutMutation();

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-yellow-500">
      <h1 className="text-center text-4xl font-bold">Home Page</h1>
      <Button text="">
        <a href="http://localhost:3000/api/auth/oauth/signup">Sign Up</a>
      </Button>
      <Button text="">
        <a href="http://localhost:3000/api/auth/oauth/login">Login</a>
      </Button>
      <Button text="Activate two factor authentication" onClick={on2FAClick} />
      {qrCode && (
        <div>
          <img src={qrCode} alt="qrCode" />
          <div className="flex justify-center items-center">
            <Button text="Enter code" onClick={() => turnOn2FA({ code2fa })} />
            <input
              className="bg-gray-200 appearance-none border-2 border-gray-200 rounded-md w-16"
              type="text"
              value={code2fa}
              onChange={(e) => setCode2fa(e.target.value)}
            />
          </div>
        </div>
      )}
      {user && !isError && user.isTwoFactorAuthenticationEnabled ? (
        <div className="flex flex-col justify-center items-center">
          <div>
            <Button text="Auth with 2FA" onClick={onAuth2FAClick} />
            <input
              className="bg-gray-200 appearance-none border-2 border-gray-200 rounded-md w-16"
              type="text"
              value={code2fa}
              onChange={(e) => setCode2fa(e.target.value)}
            />
          </div>
          <Button text="Turn Off 2FA" onClick={() => turnOff2FA()} />
        </div>
      ) : (
        <h1>Two factor authentication is turned on</h1>
      )}
      {user && !isError && <Button text="Logout" onClick={logout} />}
    </div>
  );
};
