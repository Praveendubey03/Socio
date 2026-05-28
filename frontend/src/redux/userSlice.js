import { createSlice } from "@reduxjs/toolkit";


const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    suggestedUsers: null,
    profileData: null,
    following: null,
    searchData:null,
    notificationData:[]
  },
  reducers: {
    setUserData: (state, action) => {

      state.userData = action.payload;
    },
    setSuggestedUsers: (state, action) => {
      state.suggestedUsers = action.payload;
    },
    setProfileData: (state, action) => {
      state.profileData = action.payload;
    },
    setFollowing: (state, action) => {
      state.following = action.payload
    },
    setNotificationData: (state, action) => {
      state.notificationData = action.payload
    },
    toggleFollow: (state, action) => {
      const targetUserId = action.payload?.toString();

      if (!state.following) {
        state.following = [];
      }

      const isFollowing = state.following.some(
        id => id.toString() === targetUserId
      );

      if (isFollowing) {
        state.following = state.following.filter(
          id => id.toString() !== targetUserId
        );
      } else {
        state.following.push(targetUserId);
      }
    },
    setSearchData: (state, action) => {
      state.searchData = action.payload
    }
  },
});

export const { setUserData, setSuggestedUsers, setProfileData, setFollowing, toggleFollow, setSearchData, setNotificationData } = userSlice.actions;

// Async thunk to fetch suggested users from backend
export const fetchSuggestedUsers = () => async (dispatch) => {
  try {
    const res = await fetch("http://localhost:8000/api/user/suggested", {
      credentials: "include", // if you use cookies/session
    });
    const data = await res.json();
    dispatch(setSuggestedUsers(data));
  } catch (err) {
    console.error(err);
  }
};

export default userSlice.reducer;