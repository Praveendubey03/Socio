import Message from "../models/messageModel.js"
import Conversation from "../models/conversationModel.js"
import uploadOnCloudinary from "../config/cloudinary.js"
import { getSocketId, io } from "../socket.js";

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const receiverId = req.params.receiverId;
    const text = req.body.text || req.body.message || "";
    const replyTo = req.body.replyTo ? String(req.body.replyTo) : null;

    if (!receiverId) {
      return res.status(400).json({ message: "receiverId is required" });
    }
    let mediaUrl = "";
    let finalType = "text";

    if (req.file) {
      const filePath = req.file.path.replace(/\\/g, "/");

      const result = await uploadOnCloudinary(filePath, {
        resource_type: "auto",
        folder: "messages",
      });

      if (!result) throw new Error("Cloudinary upload failed");

      mediaUrl = result;

      finalType = req.file.mimetype.startsWith("video")
        ? "video"
        : "image";
    }


    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        members: [senderId, receiverId],
      });
    }

    if (replyTo) {
      const original = await Message.findById(replyTo);
      if (!original) {
        return res.status(404).json({ message: "Original message not found" });
      }
    }

    let newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      conversationId: conversation._id,
      text,
      messageType: mediaUrl ? finalType : "text",
      media: mediaUrl,

      ...(replyTo && { replyTo }),
    });


    newMessage = await newMessage.populate([
      {
        path: "sender",
        select: "userName profileImage",
      },
      {
        path: "replyTo",
        select: "text sender",
        populate: {
          path: "sender",
          select: "userName profileImage",
        },
      },
    ]);

    conversation.lastMessage = newMessage._id;
    conversation.lastMessageText =
      text || (mediaUrl ? "📷 Media" : "");
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const receiverSocketId = getSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    const senderSocketId = getSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", newMessage);
    }
    res.status(201).json(newMessage);

  } catch (error) {
    console.log("SEND ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};
export const getAllMessages = async (req, res) => {
  try {
    const senderId = req.userId;
    const receiverId = req.params.receiverId;

    const conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      console.log("NO CONVERSATION FOUND");
      return res.status(200).json([]);
    }
    const messages = await Message.find({
      conversationId: conversation._id,
    })
      .sort({ createdAt: 1 })
      .populate("sender", "userName profileImage")
      .populate({
        path: "replyTo",
        select: "text sender",
        populate: {
          path: "sender",
          select: "userName profileImage",
        },
      });

    return res.status(200).json(messages);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const getPrevUserChats = async (req, res) => {
  try {
    const currentUserId = req.userId;

    const conversations = await Conversation.find({
      members: currentUserId,
    })
      .populate("members", "userName profileImage")
      .sort({ updatedAt: -1 });

    const result = [];

    for (const conv of conversations) {
      const otherUser = conv.members.find(
        (user) => user._id.toString() !== currentUserId.toString()
      );
      if (!otherUser) {
        continue;
      }

      result.push({
        ...otherUser.toObject(),

        lastMessage: conv.lastMessageText
          ? {
              text: conv.lastMessageText,
              createdAt: conv.lastMessageAt,
            }
          : null,

        conversationId: conv._id,

        isPinned: conv.pinnedBy.includes(currentUserId),
        isMuted: conv.mutedBy.includes(currentUserId),
        isArchived: conv.archivedBy.includes(currentUserId),

        unreadCount:
          conv.unreadCounts.find(
            (u) => u.user.toString() === currentUserId.toString()
          )?.count || 0,
      });
    }

    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const editMessage = async (req, res) => {
  try {
    const { messageId, newText } = req.body;
    const userId = req.userId;

    if (!messageId || !newText) {
      return res.status(400).json({ message: "messageId and newText required" });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const diff = Date.now() - new Date(message.createdAt).getTime();
    if (diff > 15 * 60 * 1000) {
      return res.status(400).json({ message: "Edit time expired" });
    }

    message.text = newText;
    message.isEdited = true;
    message.editedAt = new Date();

    await message.save();
  
    const receiverSocketId = getSocketId(
      message.receiver?.toString()
    );

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageEdited", message);
    }

    return res.status(200).json(message);

  } catch (error) {
    console.log("EDIT ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};
export const deleteForMe = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (!message.deletedFor.includes(userId)) {
      message.deletedFor.push(userId);
      await message.save();
    }

    return res.status(200).json({ message: "Deleted for you" });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const deleteForEveryone = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const diff = Date.now() - new Date(message.createdAt).getTime();
    if (diff > 15 * 60 * 1000) {
      return res.status(400).json({ message: "Delete time expired" });
    }

    message.isDeleted = true;
    message.text = "";
    message.media = null;

    if (!message.deletedFor.includes(userId.toString())) {
      message.deletedFor.push(userId.toString());
    }
    await message.save();
    const receiverSocketId = getSocketId(
      message.receiver?.toString()
    );

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", {
        messageId: message._id,
      });
    }

    return res.status(200).json({ message: "Deleted for everyone" });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
export const toggleReaction = async (req, res) => {
  try {
    const { messageId, emoji } = req.body;
    const userId = req.userId;

    if (!messageId || !emoji) {
      return res.status(400).json({ message: "messageId and emoji required" });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    const existingReaction = message.reactions.find(
      (r) => r.user.toString() === userId.toString()
    );

    if (existingReaction) {
   
      if (existingReaction.emoji === emoji) {
        message.reactions = message.reactions.filter(
          (r) => r.user.toString() !== userId.toString()
        );
      } else {
        existingReaction.emoji = emoji;
      }
    } else {
      message.reactions.push({
        user: userId,
        emoji,
      });
    }

    await message.save();
    await message.populate("reactions.user", "username profileImage");
    const senderSocketId = getSocketId(userId);
    const receiverSocketId = getSocketId(
      message.receiver?.toString()
    );

    [senderSocketId, receiverSocketId].forEach((socketId) => {
      if (socketId) {
        io.to(socketId).emit("reactionUpdated", {
          messageId: message._id,
          reactions: message.reactions,
        });
      }
    });

    return res.status(200).json(message);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const markAsDelivered = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    if (!conversationId) {
      return res.status(400).json({ message: "conversationId required" });
    }
    const updatedMessages = await Message.updateMany(
      {
        conversationId,
        sender: { $ne: userId },
        status: { $in: ["sent", "delivered"] },
      },
      {
        $set: {
          status: "delivered",
          deliveredAt: new Date(),
        },
      }
    );

    const conversation = await Conversation.findById(conversationId);

    const otherUser = conversation.members.find(
      (id) => id.toString() !== userId.toString()
    );
    const senderSocketId = getSocketId(otherUser.toString());

    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesDelivered", {
        conversationId,
        deliveredAt: new Date(),
      });
    }

    return res.status(200).json(updatedMessages);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const markAsSeen = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    if (!conversationId) {
      return res.status(400).json({ message: "conversationId required" });
    }

    const updatedMessages = await Message.updateMany(
      {
        conversationId,
        sender: { $ne: userId },
        status: { $ne: "seen" },
      },
      {
        $set: {
          status: "seen",
          seenAt: new Date(),
          deliveredAt: new Date(),
        },
      }
    );

    const conversation = await Conversation.findById(conversationId);

    const otherUser = conversation.members.find(
      (id) => id.toString() !== userId.toString()
    );

    const senderSocketId = getSocketId(otherUser.toString());

    if (senderSocketId) {
      io.to(senderSocketId).emit("messagesSeen", {
        conversationId,
        seenAt: new Date(),
      });
    }

    return res.status(200).json(updatedMessages);

  } catch (error) {
    console.log("SEEN ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};
export const forwardMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const receiverId = req.params.receiverId;
    const { messageId } = req.body;

    if (!receiverId || !messageId) {
      return res.status(400).json({ message: "receiverId and messageId required" });
    }

    const originalMessage = await Message.findById(messageId);

    if (!originalMessage) {
      return res.status(404).json({ message: "Original message not found" });
    }

    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        members: [senderId, receiverId],
      });
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      conversationId: conversation._id,
      text: originalMessage.text,
      messageType: originalMessage.messageType,
      media: originalMessage.media,
      isForwarded: true,
    });

    conversation.lastMessage = newMessage._id;
    conversation.lastMessageText =
      newMessage.text || (newMessage.media ? "📷 Media" : "");
    conversation.lastMessageAt = new Date();

    await conversation.save();

    const receiverSocketId = getSocketId(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res.status(201).json(newMessage);

  } catch (error) {
    console.log("FORWARD ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};
export const pinMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    message.isPinned = true;
    await message.save();

    const receiverSocketId = getSocketId(
      message.receiver?.toString()
    );

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messagePinned", {
        messageId: message._id,
      });
    }

    return res.status(200).json(message);

  } catch (error) {
    console.log("PIN ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};
export const unpinMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.userId;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    message.isPinned = false;
    await message.save();

    const receiverSocketId = getSocketId(
      message.receiver?.toString()
    );

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageUnpinned", {
        messageId: message._id,
      });
    }

    return res.status(200).json(message);

  } catch (error) {
    console.log("UNPIN ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};
export const updateUnreadCount = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const senderId = req.userId; 

    if (!conversationId) {
      return res.status(400).json({ message: "conversationId required" });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const receiverId = conversation.members.find(
      (id) => id.toString() !== senderId.toString()
    );

    let userEntry = conversation.unreadCounts.find(
      (u) => u.user.toString() === receiverId.toString()
    );

    if (userEntry) {
      userEntry.count += 1;
    } else {
      conversation.unreadCounts.push({
        user: receiverId,
        count: 1,
      });
    }

    await conversation.save();

    const receiverSocketId = getSocketId(receiverId.toString());

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("unreadUpdated", {
        conversationId,
      });
    }

    return res.status(200).json(conversation);

  } catch (error) {
    console.log("UNREAD UPDATE ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};
export const clearUnreadCount = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    if (!conversationId) {
      return res.status(400).json({ message: "conversationId required" });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const userEntry = conversation.unreadCounts.find(
      (u) => u.user.toString() === userId.toString()
    );

    if (userEntry) {
      userEntry.count = 0;
    }

    await conversation.save();

    const otherUser = conversation.members.find(
      (id) => id.toString() !== userId.toString()
    );

    const otherSocketId = getSocketId(otherUser.toString());

    if (otherSocketId) {
      io.to(otherSocketId).emit("unreadCleared", {
        conversationId,
      });
    }

    return res.status(200).json(conversation);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const searchMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { query } = req.query;
    const userId = req.userId;

    if (!conversationId || !query) {
      return res.status(400).json({ message: "conversationId and query required" });
    }

    let messages = await Message.find({
      conversationId,
      text: { $regex: query, $options: "i" },
    })
      .sort({ createdAt: -1 })
      .populate("sender", "userName profileImage");
    messages = messages.filter(
      (msg) => !msg.deletedFor.includes(userId)
    );

    return res.status(200).json(messages);

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const muteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    const conversation = await Conversation.findById(conversationId);

    const isMuted = conversation.mutedBy.some(
      (id) => id.toString() === userId.toString()
    );

    if (isMuted) {
      conversation.mutedBy = conversation.mutedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      conversation.mutedBy.push(userId);
    }

    await conversation.save();

    return res.status(200).json({
      message: isMuted ? "Unmuted" : "Muted",
      isMuted: !isMuted,
    });

  } catch (error) {
    
    return res.status(500).json({ message: error.message });
  }
};
export const unmuteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    conversation.mutedBy = conversation.mutedBy.filter(
      (id) => id.toString() !== userId.toString()
    );

    await conversation.save();

    return res.status(200).json({ message: "Conversation unmuted" });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const pinConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isPinned = conversation.pinnedBy.some(
      (id) => id.toString() === userId.toString()
    );

    if (isPinned) {

      conversation.pinnedBy = conversation.pinnedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      conversation.pinnedBy.push(userId);
    }

    await conversation.save();

    return res.status(200).json({
      message: isPinned ? "Unpinned" : "Pinned",
      isPinned: !isPinned,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const archiveConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    const conversation = await Conversation.findById(conversationId);

    const isArchived = conversation.archivedBy.some(
      (id) => id.toString() === userId.toString()
    );

    if (isArchived) {
      conversation.archivedBy = conversation.archivedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      conversation.archivedBy.push(userId);
    }

    await conversation.save();

    return res.status(200).json({
      message: isArchived ? "Unarchived" : "Archived",
      isArchived: !isArchived,
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    if (!conversationId) {
      return res.status(400).json({ message: "conversationId required" });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.members.includes(userId)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await Message.deleteMany({ conversationId });

    await Conversation.findByIdAndDelete(conversationId);

    return res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const addTypingUser = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const userId = req.userId;

    if (!conversationId) {
      return res.status(400).json({ message: "conversationId required" });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.typingUsers.includes(userId)) {
      conversation.typingUsers.push(userId);
      await conversation.save();
    }

    const otherUser = conversation.members.find(
      (id) => id.toString() !== userId.toString()
    );

    const socketId = getSocketId(otherUser.toString());

    if (socketId) {
      io.to(socketId).emit("typing", {
        conversationId,
        userId,
      });
    }

    return res.status(200).json({ message: "Typing started" });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
export const removeTypingUser = async (req, res) => {
  try {
    const { conversationId } = req.body;
    const userId = req.userId;

    if (!conversationId) {
      return res.status(400).json({ message: "conversationId required" });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    conversation.typingUsers = conversation.typingUsers.filter(
      (id) => id.toString() !== userId.toString()
    );

    await conversation.save();

    const otherUser = conversation.members.find(
      (id) => id.toString() !== userId.toString()
    );

    const socketId = getSocketId(otherUser.toString());

    if (socketId) {
      io.to(socketId).emit("stopTyping", {
        conversationId,
        userId,
      });
    }

    return res.status(200).json({ message: "Typing stopped" });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};