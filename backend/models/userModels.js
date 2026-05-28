import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String, required: true
    },
    userName: {
        type: String, required: true, unique: true
    },
    email: {
        type: String, required: true, unique: true
    },
    password: {
        type: String, required: true
    },
    profileImage: {
        type: String,default: ""
    },
    bio: {
        type: String
    },
    profession: {
        type: String
    },
    gender: {
        type: String,
        enum: ["Male", "Female"],
        set: (value) => {
            if (!value) return value
            return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
        }
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            default: [],
            ref: "User"
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            default: [],
            ref: "User"
        }
    ],
    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    saved: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        }
    ],
    loops: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Loop"
        }
    ],
    story: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Story"
    },
    resetOtp: {
        type: String
    },
    otpExpires: {
        type: Date
    },
    isOtpVerified: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const User = mongoose.model("User", userSchema)
export default User