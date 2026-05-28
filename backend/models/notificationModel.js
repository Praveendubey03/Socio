import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    type: {
        type: String,
        enum: ["like", "comment", "follow", "share","reply"],
        required: true
    },

    message: {
        type: String,
        required: true

    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: null
    },
    loop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Loop",
        default: null
    },

    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    },

    isRead: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;