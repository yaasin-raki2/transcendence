export interface User {
  id: number;

  logging: string;

  username: string;

  avatar?: any;

  avatarId?: number;

  isTwoFactorAuthenticationEnabled: boolean;

  twoFactorAuthenticationSecret?: string;

  sentFriendRequests: any[];

  receivedFriendRequests: any[];

  status: string;
}
