import { createSlice } from "@reduxjs/toolkit";

interface ProfileImageState {
  src: string;
  id: number;
}

const initialState: ProfileImageState[] = [];

const profileImagesSlice = createSlice({
  name: "profileImages",
  initialState,
  reducers: {
    setProfileImage: (state, action: { payload: ProfileImageState; type: string }) => {
      const { src, id } = action.payload;
      const profileImage = state.find((image) => image.id === id);
      if (profileImage) {
        profileImage.src = src;
      } else {
        state.push({ src, id });
      }
    },
  },
});

export const { setProfileImage } = profileImagesSlice.actions;
export default profileImagesSlice.reducer;
