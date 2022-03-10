export enum ChatErrors {
	ROOM_NOT_FOUND = "Room not found",
	ROOM_REQUEST_NOT_FOUND = "Room Request not found",
	YOU_CANT_SEND_A_REQUEST_TO_ENTER_A_ROOM_TO_A_NON_ADMIN_USER = "You can't send a request to enter a room to a non admin user",
	YOU_CANT_SEND_A_REQUEST_TO_YOURSELF = "You can't send a request to yourself",
	ONLY_THE_ADMIN_OF_THIS_ROOM_CAN_SEND_A_REQUEST = "Only the admin of this room can send a request",
	YOU_CANT_SEND_A_REQUEST_TO_A_MEMBER_OF_THE_ROOM = "You can't send a request to a member of the room",
	YOU_ALREADY_HAVE_A_REQUEST_TO_ENTER_THIS_ROOM = "You already have a request to enter this room",
	YOU_CANT_RESPOND_TO_YOURSELF = "You can't respond to yourself",
	USER_IS_ALREADY_A_MEMBER_OF_THIS_ROOM = "User is already a member of this room",
	USER_IS_NOT_INVITED_TO_ROOM_OR_ROOM_REQUEST_IS_NOT_ACCEPTED = "User is not invited to room or room request is not accepted",
	USER_IS_NOT_A_MEMBER_OF_THIS_ROOM = "User is not a member of this room",
	ONLY_THE_ADMIN_OF_THIS_ROOM_CAN_REMOVE_A_MEMBER = "Only the admin of this room can remove a member",
	ROOM_ALREADY_EXISTS = "Room already exists",
	YOU_DONT_HAVE_PERMISSION_TO_DO_THIS = "You don't have permission to do this",
	YOU_CANT_RESPOND_TO_A_REQUEST_THAT_ISNT_FOR_YOU = "You can't respond to a request that isn't for you",
	YOU_CANT_RESPOND_TO_A_REQUEST_THAT_IS_ALREADY_RESPONDED = "You can't respond to a request that is already responded"
}
