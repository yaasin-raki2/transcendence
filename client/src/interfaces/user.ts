import { DatabaseFile } from "./database-file";

export interface User {
  id: number;

  logging: string;

  username: string;

  avatar?: DatabaseFile;

  avatarId?: number;

  isTwoFactorAuthenticationEnabled: boolean;

  twoFactorAuthenticationSecret?: string;

  sentFriendRequests: any[];

  receivedFriendRequests: any[];

  status: string;
}
