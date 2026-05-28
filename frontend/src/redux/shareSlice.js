import { createSlice } from "@reduxjs/toolkit"

const shareSlice = createSlice({
    name: "share",
    initialState: {
        isOpen: false,
        users: [],
        post: null
    },
    reducers: {
        openShare: (state, action) => {
            state.isOpen = true
            state.post = action.payload
        },
        closeShare: (state) => {
            state.isOpen = false
            state.post = null
            state.users =[]
        },
        setShareUsers: (state, action) => {
            state.users = action.payload
        }
    }
})

export const { openShare, closeShare, setShareUsers } = shareSlice.actions
export default shareSlice.reducer