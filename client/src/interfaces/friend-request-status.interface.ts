import { User } from "./user";

export type FriendRequest_Status = "pending" | "accepted" | "rejected";

export interface FriendRequestStatus {
  status?: FriendRequest_Status;
}

export interface FriendRequest {
  id: number;
  status: FriendRequest_Status;
  creator: User;
}
