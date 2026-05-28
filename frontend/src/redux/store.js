import { configureStore } from "@reduxjs/toolkit"
import userSlice from "./userSlice.js"
import postSlice from "./postSlice.js"
import storySlice from "./storySlice.js"
import loopSlice from "./loopSlice.js"
import likeSlice from "./likeSlice.js"
import commentSlice from "./commentSlice.js"
import messageSlice from "./messageSlice.js"
import socketSlice from "./socketSlice.js"
import shareSlice from "./shareSlice.js"
import typingSlice from "./typingSlice.js"
import conversationSlice from "./conversationSlice.js"

const store = configureStore({
    reducer: {
        user: userSlice,
        post: postSlice,
        story: storySlice,
        loop: loopSlice,
        like: likeSlice,
        comment:commentSlice,
        message: messageSlice,
        typing: typingSlice,
        conversation: conversationSlice,
        socket:socketSlice,
        share:shareSlice

    }
})

export default store