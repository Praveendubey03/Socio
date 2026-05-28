import uploadOnCloudinary from "../config/cloudinary.js";
import Story from "../models/storyModel.js";
import User from "../models/userModels.js";
import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";
import { getSocketId, io } from "../socket.js";

const uploadStory = async (req, res) => {
    try {
        const { mediaType } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "media is required" });
        }

        const uploaded = await uploadOnCloudinary(req.file.path);

        const story = await Story.create({
            author: req.userId,
            mediaType,
            media: uploaded
        });

        // ✅ populate author for frontend consistency
        const populated = await story.populate(
            "author",
            "name userName profileImage"
        );

        return res.status(200).json(populated);

    } catch (error) {
        console.error("Upload story error:", error);
        return res.status(500).json({ message: "Upload story error" });
    }
};

const viewStory = async (req, res) => {
    try {
        const { storyId } = req.params;

        const story = await Story.findById(storyId);

        if (!story) {
            return res.status(404).json({ message: "Story not found" });
        }

        if (!story.viewers) story.viewers = [];

        if (story.author.toString() === req.userId.toString()) {
            // just return populated story, no push
            const populatedStory = await Story.findById(storyId)
                .populate("author", "name userName profileImage")
                .populate({
                    path: "viewers.user",
                    select: "name userName profileImage"
                });

            return res.status(200).json(populatedStory);
        }

        const alreadyViewed = story.viewers.some((v) => {
            const id = v?.user || v;
            return id?.toString() === req.userId.toString();
        });

        if (!alreadyViewed) {
            const viewedAt = new Date();

            story.viewers.push({
                user: req.userId,
                viewedAt
            });

            story.viewersCount = (story.viewersCount || 0) + 1;

            await story.save();

            // 🔥 SOCKET EVENT
            const socketId = getSocketId(story.author.toString());

            if (socketId) {
                io.to(socketId).emit("storyViewed", {
                    storyId: story._id,
                    viewer: {
                        user: req.userId,
                        viewedAt
                    }
                });
            }
        }

       
        const populatedStory = await Story.findById(storyId)
            .populate("author", "name userName profileImage")
            .populate({
                path: "viewers.user",
                select: "name userName profileImage"
            });

        return res.status(200).json(populatedStory);

    } catch (error) {
        console.error("Story view error:", error);
        return res.status(500).json({ message: "Story view error" });
    }
};

const getStoryByUserName = async (req, res) => {
    try {
        const { userName } = req.params;

        const user = await User.findOne({ userName });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const stories = await Story.find({ author: user._id })
            .sort({ createdAt: -1 })
            .populate("author", "name userName profileImage")
            .populate({
                path: "viewers.user",
                select: "name userName profileImage"
            });

        return res.status(200).json(stories);

    } catch (error) {
        return res.status(500).json({ message: "Error fetching stories" });
    }
};


const getAllStories = async (req, res) => {
    try {
        const currentUser = await User.findById(req.userId);

        const ids = [...currentUser.following, req.userId];

        const stories = await Story.find({
            author: { $in: ids }
        })
            .sort({ createdAt: -1 })
            .populate("author", "name userName profileImage")
            .populate({
                path: "viewers.user",
                select: "name userName profileImage"
            });

        return res.status(200).json(stories);

    } catch (error) {
        return res.status(500).json({ message: "Error fetching stories" });
    }
};


const deleteStory = async (req, res) => {
    try {
        const { storyId } = req.params;

        const story = await Story.findById(storyId);

        if (!story) {
            return res.status(404).json({ message: "Story not found" });
        }

        if (story.author.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await Story.findByIdAndDelete(storyId);

        return res.status(200).json({ message: "Story deleted" });

    } catch (error) {
        return res.status(500).json({ message: "Delete error" });
    }
};


const getStoryViewers = async (req, res) => {
    try {
        const { storyId } = req.params;

        const story = await Story.findById(storyId)
            .populate({
                path: "viewers.user",
                select: "name userName profileImage"
            });

        if (!story) {
            return res.status(404).json({ message: "Story not found" });
        }

        return res.status(200).json({
            viewers: story.viewers,
            count: story.viewersCount || story.viewers.length
        });

    } catch (error) {
        return res.status(500).json({ message: "Error fetching viewers" });
    }
};

const replyToStory = async (req, res) => {
    try {
        const { storyId } = req.params;
        const { message } = req.body;

        const senderId = req.userId;

        const story = await Story.findById(storyId).populate("author");

        if (!story) {
            return res.status(404).json({ message: "Story not found" });
        }

        const receiverId = story.author._id;

        // 🔍 find or create conversation
        let conversation = await Conversation.findOne({
            members: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                members: [senderId, receiverId]
            });
        }

        // 💬 create message
        const newMessage = await Message.create({
            sender: senderId,
            receiver: receiverId,
            conversationId: conversation._id,
            text: message,
            messageType: "text",
            story: storyId
        });

        return res.status(201).json(newMessage);

    } catch (error) {
        return res.status(500).json({ message: "Reply error" });
    }
};
const reactToStory = async (req, res) => {
    try {
        const { storyId } = req.params;
        const senderId = req.userId;

        const story = await Story.findById(storyId).populate("author");

        if (!story) {
            return res.status(404).json({ message: "Story not found" });
        }

        const receiverId = story.author._id;

        // ❌ prevent self reaction (optional but good)
        if (senderId.toString() === receiverId.toString()) {
            return res.status(400).json({ message: "You cannot react to your own story" });
        }

        // 🔍 find or create conversation
        let conversation = await Conversation.findOne({
            members: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                members: [senderId, receiverId]
            });
        }

        // 🔥 CHECK: already reacted?
        const existingReaction = await Message.findOne({
            sender: senderId,
            conversationId: conversation._id,
            story: storyId,
            text: "❤️"
        });

        if (existingReaction) {
            return res.status(200).json({
                message: "Already reacted",
                alreadyReacted: true
            });
        }

        // ❤️ create message
        const newMessage = await Message.create({
            sender: senderId,
            receiver: receiverId,
            conversationId: conversation._id,
            text: "❤️",
            messageType: "text",
            story: storyId
        });

        // 🔥 SOCKET (real-time DM)
        const socketId = getSocketId(receiverId.toString());
        if (socketId) {
            io.to(socketId).emit("newMessage", newMessage);
        }

        return res.status(201).json(newMessage);

    } catch (error) {
        return res.status(500).json({ message: "Reaction error" });
    }
};

export {
    uploadStory,
    viewStory,
    getStoryByUserName,
    getAllStories,
    deleteStory,
    getStoryViewers,
    replyToStory,
    reactToStory
};