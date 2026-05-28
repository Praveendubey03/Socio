import { tracingChannel } from "diagnostics_channel"
import uploadOnCloudinary from "../config/cloudinary.js"
import User from "../models/userModels.js"
import Notification from "../models/notificationModel.js"

const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId
        const user = await User.findById(userId).populate("posts loops saved saved.author story following")

        if (!user) {
            return res.status(400).json({ message: "user not found" })
        }

        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({ message: `get current user error ${error}` })
    }
}

const suggestedUsers = async (req, res) => {
    try {
        const users = await User.find({
            _id: { $ne: req.userId }
        }).select("-password")
        res.status(200).json(users)
    } catch (error) {
        return res.status(500).json({ message: `get suggested user error ${error}` })
    }
}

const editProfile = async (req, res) => {
    try {
        const { name, userName, bio, profession, gender } = req.body
        const user = await User.findById(req.userId).select("-password")
        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }
        const sameUserWithUserName = await User.findOne({ userName }).select("-password")
        if (sameUserWithUserName && sameUserWithUserName._id.toString() != req.userId) {
            return res.status(400).json({ message: "UserName already exists" })
        }


        if (req.file) {


            const filePath = req.file.path.replace(/\\/g, "/")
            const uploadedImage = await uploadOnCloudinary(filePath)
            user.profileImage = uploadedImage
        }
        user.name = name
        user.userName = userName
        user.bio = bio
        user.profession = profession
        user.gender = gender

        await user.save()
        return res.status(200).json(user)

    } catch (error) {
        console.log("EDIT PROFILE ERROR:", error)
        return res.status(500).json({ message: `edit profile error ${error}` })
    }
}

const getProfile = async (req, res) => {
    try {
        const userName = req.params.userName
        const user = await User.findOne({ userName }).select("-password")
            .populate("posts loops followers following")

        if (!user) {
            return res.status(400).json({ message: "User not found" })
        }
        return res.status(200).json(user)

    } catch (error) {
        return res.status(500).json({ message: `user not get found error ${error}` })
    }
}

const follow = async (req, res) => {
    try {
        const curretUserId = req.userId
        const targetUserId = req.params.targetUserId

        if (!targetUserId) {
            return res.status(400).json({ message: "target user is not found" })
        }

        if (curretUserId == targetUserId) {
            return res.status(400).json({ message: "You can't follow yourself" })
        }

        const currentUser = await User.findById(curretUserId)
        const targetUser = await User.findById(targetUserId)

        if (!currentUser || !targetUser) {
            return res.status(404).json({ message: "User not found" })
        }

        currentUser.following = currentUser.following || []
        targetUser.followers = targetUser.followers || []

        const isFollowing = currentUser.following.some(
            id => id.toString() === targetUserId
        )

        if (isFollowing) {
          
            currentUser.following = currentUser.following.filter(
                id => id.toString() !== targetUserId
            )

            targetUser.followers = targetUser.followers.filter(
                id => id.toString() !== curretUserId
            )
        } else {
           
            currentUser.following.push(targetUserId)
            targetUser.followers.push(curretUserId)
        }

        await currentUser.save()
        await targetUser.save()

        return res.status(200).json({
            following: currentUser.following, 
            message: isFollowing
                ? "Unfollowed successfully"
                : "Followed successfully"
        })

    } catch (error) {
        console.log("FOLLOW ERROR:", error)
        return res.status(500).json({ message: `not able to follow ${error}` })
    }
}

const followingList = async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .select("following");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(
            user.following.map(id => id.toString())
        );

    } catch (error) {
        return res.status(500).json({ message: `following error ${error}` });
    }
};

const search = async (req, res) => {
    try {
        const keyword = req.query.keyword
        if (!keyword || !keyword.trim()) {
            return res.status(200).json([]);
        }
        const users = await User.find({
            $or: [
                { userName: { $regex: keyword, $options: "i" } },
                { name: { $regex: keyword, $options: "i" } }
            ]
        }).select("-password");
        return res.status(200).json(users);
    } catch (error) {
        console.error("❌ Search error:", error);
        return res.status(500).json({ message: `search error ${error}` });
    }
};

const getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({
            receiver: req.userId
        }).populate("sender receiver post loop").sort({ createdAt: -1 })
        return res.status(200).json(notifications)
    } catch (error) {
        return res.status(500).json({ message: `get notification ${error}` });
    }
}

const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.body
        if (Array.isArray(notificationId)) {
            await Notification.updateMany(
                { _id: { $in: notificationId }, receiver: req.userId },
                { $set: { isRead: true } }
            );
        } else {
            await Notification.findOneAndUpdate(
                { _id: notificationId, receiver: req.userId },
                { $set: { isRead: true } }
            );
        }
        return res.status(200).json({ message: "marked as read" })
    } catch (error) {
        return res.status(500).json({ message: `marked as read notification ${error}` });
    }
}
export { getCurrentUser, suggestedUsers, editProfile, getProfile, follow, followingList, search, getAllNotifications, markAsRead }