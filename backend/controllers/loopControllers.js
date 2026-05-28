import Loop from "../models/loopModel.js";
import User from "../models/userModels.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import { getSocketId, io } from "../socket.js";
import Notification from "../models/notificationModel.js";

const uploadLoop = async (req, res) => {
    try {
        console.log("➡️ Entered uploadLoop function");
        console.log("📥 Request body:", req.body);
        console.log("📎 Request file:", req.file);
        console.log("👤 Request userId:", req.userId);

        const { caption } = req.body;
        console.log("✅ Extracted caption:", caption);


        let media;
        if (req.file) {
            console.log("⏳ Uploading file to Cloudinary...");
            media = await uploadOnCloudinary(req.file.path);
            console.log("☁️ Cloudinary upload result:", media);
        } else {
            console.log("❌ No media file provided");
            return res.status(400).json({ message: "media is required" });
        }

        console.log("📝 Creating new Loop in DB...");
        const loop = await Loop.create({
            caption,
            media,
            author: req.userId
        });
        console.log("✅ Loop created:", loop);
        const user = await User.findById(req.userId)
        user.loops.push(loop._id)
        await user.save()
        console.log("🔍 Populating author details...");
        const populatedLoop = await Loop.findById(loop._id)
            .populate("author", "name userName profileImage");
        console.log("✅ Populated Loop:", populatedLoop);

        console.log("📤 Sending response with status 201");
        return res.status(201).json(populatedLoop);

    } catch (error) {
        console.error("💥 uploadLoop error:", error);
        return res.status(500).json({ message: `uploadLoop error ${error}` });
    }
};
const getAllLoops = async (req, res) => {
    try {

        const loops = await Loop.find({})
            .populate("author", "name userName profileImage");
        console.log("✅ Loops fetched:", loops);


        return res.status(200).json(loops);

    } catch (error) {

        return res.status(500).json({ message: `getAllLoop error ${error}` });
    }
};
const like = async (req, res) => {
    try {

        const loopId = req.params.loopId;



        const loop = await Loop.findById(loopId);


        if (!loop) {

            return res.status(400).json({ message: "Loop not found" });
        }


        const alreadyLiked = loop.likes.some(
            id => id.toString() === req.userId.toString()
        );


        if (alreadyLiked) {

            loop.likes = loop.likes.filter(
                id => id.toString() !== req.userId.toString()
            );
        } else {

            loop.likes.push(req.userId);

            if (loop.author._id != req.userId) {
                const notification = await Notification.create({
                    sender: req.userId,
                    receiver: loop.author._id,
                    type: "like",
                    loop: loop._id,
                    message: "liked your loop"
                })
                const populatedNotification = await Notification.findById(notification._id)
                    .populate("sender receiver loop")
                const receiverSocketId = getSocketId(loop.author._id)
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("newNotification", populatedNotification)
                }
            }
        }


        await loop.save();

        await loop.populate("author", "name userName profileImage");


        io.emit("likedLoop", {
            loopId: loop._id,
            likes: loop.likes
        })

        return res.status(200).json(loop);

    } catch (error) {

        return res.status(500).json({ message: `likeLoop error ${error}` });
    }
};
const comment = async (req, res) => {
    try {
        const { message } = req.body
        const loopId = req.params.loopId
        const loop = await Loop.findById(loopId)
        if (!loop) {
            console.log("❌ Loop not found");
            return res.status(400).json({ message: "Loop not found" });
        }
        loop.comments.push({
            author: req.userId,
            message
        })
        if (loop.author._id != req.userId) {
            const notification = await Notification.create({
                sender: req.userId,
                receiver: loop.author._id,
                type: "comment",
                loop: loop._id,
                message: "commented on your loop"
            })
            const populatedNotification = await Notification.findById(notification._id)
                .populate("sender receiver loop")
            const receiverSocketId = getSocketId(loop.author._id)
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newNotification", populatedNotification)
            }
        }
        await loop.save()
        await loop.populate("author", "name userName profileImage");
        await loop.populate("comments.author");

        io.emit("commentedLoop", {
            loopId: loop._id,
            comments: loop.comments
        })
        console.log("✅ Populated Loop:", loop);
        return res.status(200).json(loop);
    } catch (error) {
        return res.status(500).json({ message: `commentLoop error ${error}` });
    }
}
const saved = async (req, res) => {
    try {
        const loopId = req.params.loopId
        const userId = req.userId

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        user.saved = user.saved.filter(id => id !== null)
        const alreadySaved = user.saved.some(
            id => id.toString() === loopId.toString()
        )

        if (alreadySaved) {
            user.saved = user.saved.filter(
                id => id.toString() !== loopId.toString()
            )
        } else {
            user.saved.push(loopId)
        }

        await user.save()
        await user.populate("saved")
        return res.status(200).json(user)

    } catch (error) {
        return res.status(500).json({ message: "saved error" })
    }
};
const getShareList = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .populate("followers", "userName profileImage")
            .populate("following", "userName profileImage")

        const others = await User.find({
            _id: { $ne: req.userId }
        })
            .limit(10)
            .select("userName profileImage")

        const allUsersMap = new Map()
            ;[...user.followers, ...user.following, ...others].forEach(u => {
                allUsersMap.set(u._id.toString(), u)
            })

        const uniqueUsers = Array.from(allUsersMap.values())

        return res.json(uniqueUsers)

    } catch (err) {
        res.status(500).json({ message: "error fetching share users" })
    }
};
const shareLoop = async (req, res) => {
    try {
        const { loopId, receiverId } = req.body

        if (!loopId || !receiverId) {
            return res.status(400).json({ message: "Missing data" })
        }

        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const loop = await Loop.findById(loopId)
        if (!loop) {
            return res.status(404).json({ message: "Loop not found" })
        }

        if (receiverId.toString() !== req.userId.toString()) {

            const notification = await Notification.create({
                sender: req.userId,
                receiver: receiverId,
                type: "share",
                loop: loopId,
                message: "shared a loop with you"
            })

            const populated = await Notification.findById(notification._id)
                .populate("sender receiver loop")

            const receiverSocketId = getSocketId(receiverId)
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newNotification", populated)
            }
        }

        return res.json({ success: true })

    } catch (err) {
        console.log("💥 SHARE ERROR:", err)
        return res.status(500).json({ message: err.message })
    }
};
const deleteLoop = async (req, res) => {
    try {
        const loopId = req.params.loopId
        const userId = req.userId

        const loop = await Loop.findById(loopId)

        if (!loop) {
            return res.status(404).json({ message: "Loop not found" })
        }

        // ✅ Only owner can delete
        if (loop.author.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized" })
        }

        // 🔥 Remove post from user's posts array
        const user = await User.findById(userId)
        user.loops = user.loops.filter(
            id => id.toString() !== loopId.toString()
        )
        await user.save()

        // 🔥 Delete post
        await Loop.findByIdAndDelete(loopId)

        // 🔥 Optional: emit socket event
        io.emit("deletedPost", { loopId })

        return res.status(200).json({
            message: "Post deleted successfully",
            loopId
        })

    } catch (error) {
        console.log("💥 delete Loop error:", error)
        return res.status(500).json({ message: "delete Loop error" })
    }
};
const updateLoop = async (req, res) => {
    try {
        const loopId = req.params.loopId
        const userId = req.userId
        const { caption } = req.body

        const loop = await Loop.findById(loopId)

        if (!loop) {
            return res.status(404).json({ message: "Loop not found" })
        }

        // ✅ Only owner can edit
        if (loop.author.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized" })
        }

        // 🔥 Update caption
        loop.caption = caption || loop.caption

        await loop.save()

        await loop.populate("author", "name userName profileImage")

        // 🔥 Emit socket update (optional but powerful)
        io.emit("updated Loop", {
            loopId: loop._id,
            caption: loop.caption
        })

        return res.status(200).json(loop)

    } catch (error) {
        console.log("💥 update Loop error:", error)
        return res.status(500).json({ message: "update Loop error" })
    }
};
const getComments = async (req, res) => {
    try {
        const loopId = req.params.loopId;
        const loop = await Loop.findById(loopId)
            .populate("comments.author", "name userName profileImage");

        if (!loop) {
            return res.status(404).json({ message: "Loop not found" });
        }
        return res.status(200).json(loop.comments);

    } catch (error) {
        return res.status(500).json({ message: `getComments error ${error}` });
    }
};
const reply = async (req, res) => {
    try {
        const { message } = req.body;
        const commentId = req.params.commentId;

        const loop = await Loop.findOne({
            "comments._id": commentId
        });

        if (!loop) {
            return res.status(404).json({ message: "Loop not found" });
        }

        const comment = loop.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (!comment.replies) {
            comment.replies = [];
        }

        comment.replies.push({
            author: req.userId,
            message,
            likes: [],
            createdAt: new Date()
        });

        //  Notification
        if (comment.author.toString() !== req.userId.toString()) {
            const notification = await Notification.create({
                sender: req.userId,
                receiver: comment.author,
                type: "reply",
                loop: loop._id,
                message: "replied to your comment"
            });

            const populatedNotification = await Notification.findById(notification._id)
                .populate("sender receiver post");

            const receiverSocketId = getSocketId(comment.author);

            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newNotification", populatedNotification);
            }
        }

        await loop.save();
        await loop.populate([
            { path: "comments.author" },
            { path: "comments.replies.author" }
        ]);
        io.emit("repliedComment", {
            loopId: loop._id,
            comments: loop.comments
        });

        return res.status(200).json({
            loopId: loop._id,
            comments: loop.comments
        });

    } catch (error) {
        return res.status(500).json({ message: `reply error ${error}` });
    }
};
const deleteComment = async (req, res) => {
    try {
        const { loopId, commentId } = req.params;
        const userId = req.userId;
        const loop = await Loop.findById(loopId);
        if (!loop) {
            return res.status(404).json({ message: "Loop not found" });
        }
        let comment = loop.comments.id(commentId);
        if (comment) {
            if (comment.author.toString() !== userId.toString()) {
                return res.status(403).json({ message: "Unauthorized" });
            }

            loop.comments = loop.comments.filter(
                (c) => c._id.toString() !== commentId.toString()
            );

            await loop.save();

            io.emit("deletedComment", {
                loopId: loop._id,
                commentId
            });

            return res.status(200).json({
                message: "Comment deleted",
                commentId
            });
        }

        for (let c of loop.comments) {
            const reply = c.replies?.find(
                (r) => r._id.toString() === commentId.toString()
            );

            if (reply) {
                if (reply.author.toString() !== userId.toString()) {
                    return res.status(403).json({ message: "Unauthorized" });
                }

                c.replies = c.replies.filter(
                    (r) => r._id.toString() !== commentId.toString()
                );

                await loop.save();
                io.emit("deletedReply", {
                    loopId: loop._id,
                    commentId: c._id,
                    replyId: commentId
                });

                return res.status(200).json({
                    message: "Reply deleted",
                    replyId: commentId
                });
            }
        }
        return res.status(404).json({ message: "Not found" });

    } catch (error) {
        console.error("💥 deleteComment error:", error);
        return res.status(500).json({ message: "deleteComment error" })}
};
const likeComment = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const userId = req.userId;

        let loop = await Loop.findOne({
            "comments._id": commentId
        });

        let target = null;

        if (loop) {
            target = loop.comments.id(commentId);
        } else {
           
            const allLoops = await Loop.find({ "comments.replies._id": commentId })

            for (let p of allLoops) {
                for (let c of p.comments) {
                    const reply = c.replies?.find(
                        r => r._id.toString() === commentId
                    );

                    if (reply) {
                        loop = p;
                        target = reply;
                        break;
                    }
                }
                if (target) break;
            }
        }

        if (!target || !loop) {
            return res.status(404).json({ message: "Not found" });
        }
        if (!target.likes) target.likes = [];

        const alreadyLiked = target.likes.some(
            id => id.toString() === userId.toString()
        );

        if (alreadyLiked) {
            target.likes = target.likes.filter(
                id => id.toString() !== userId.toString()
            );
        } else {
            target.likes.push(userId);
        }
        await loop.save();

        return res.status(200).json(target.likes);

    } catch (error) {
        console.log("like error:", error);
        return res.status(500).json({ message: "comment/reply like error" });
    }
};

export {
    uploadLoop, getAllLoops, like, comment, saved, getShareList, shareLoop,
    deleteLoop, updateLoop, getComments, reply, deleteComment, likeComment
}