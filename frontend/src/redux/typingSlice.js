
import { createSlice } from "@reduxjs/toolkit"

const typingSlice = createSlice({
    name: "typing",
    initialState: {
        typingUsers: {}
    },
    reducers: {
        setTypingUser: (state, action) => {
            const { conversationId, userId } = action.payload;

            if (!state.typingUsers[conversationId]) {
                state.typingUsers[conversationId] = [];
            }

            if (!state.typingUsers[conversationId].includes(userId)) {
                state.typingUsers[conversationId].push(userId);
            }
        },

        removeTypingUser: (state, action) => {
            const { conversationId, userId } = action.payload;

            if (state.typingUsers[conversationId]) {
                state.typingUsers[conversationId] =
                    state.typingUsers[conversationId].filter(
                        (id) => id !== userId
                    );
            }
        },
    },
});

export const { setTypingUser, removeTypingUser } = typingSlice.actions;
export default typingSlice.reducer;