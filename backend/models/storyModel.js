import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },

    mediaType: {
        type: String,
        enum: ["image", "video"],
        required: true
    },

    media: {
        type: String,
        required: true
    },

    caption: {
        type: String,
        default: ""
    },

   
    viewers: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            viewedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],

    viewersCount: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
});

// ✅ TTL (auto delete after 24h)
storySchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 86400 }
);

const Story = mongoose.model("Story", storySchema);

export default Story;