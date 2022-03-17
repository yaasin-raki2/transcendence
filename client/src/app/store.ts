import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";
import { usersApi } from "../features/users/users.slice";
import prosileImagesReducer from "../features/users/prosile-images.slice";
import { roomsApi } from "../features/rooms/rooms.slice";

export const store = configureStore({
  reducer: {
    profileImages: prosileImagesReducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [roomsApi.reducerPath]: roomsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false })
      .concat(usersApi.middleware)
      .concat(roomsApi.middleware),
});

setupListeners(store.dispatch);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
