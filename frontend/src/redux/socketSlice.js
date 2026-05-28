import { createSlice } from "@reduxjs/toolkit";

const socketSlice = createSlice({
  name: "socket",
  initialState: {
    socket: null,
    onlineUsers: [],
    isConnected: false,
  },

  reducers: {
    setSocket: (state, action) => {
      state.socket = action.payload;
    },

    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },

    setConnected: (state, action) => {
      state.isConnected = action.payload;
    },
  },
});

export const {
  setSocket,
  setOnlineUsers,
  setConnected,
} = socketSlice.actions;

export default socketSlice.reducer;