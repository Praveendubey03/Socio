import uploadOnCloudinary from "../config/cloudinary.js";
import User from "../models/userModels.js";
import Post from "../models/postModel.js"
import { getSocketId, io } from "../socket.js";
import Notification from "../models/notificationModel.js";

const uploadPost = async (req, res) => {
    try {
        const { caption, mediaType } = req.body;
        let media;
        if (req.file) {
            media = await uploadOnCloudinary(req.file.path);
        } else {
            return res.status(400).json({ message: "media is required" });
        }

        const post = await Post.create({
            caption,
            media,
            mediaType,
            author: req.userId
        });
     
        const user = await User.findById(req.userId)
        user.posts.push(post._id)
        await user.save()
        const populatedPost = await Post.findById(post._id)
            .populate("author", "name userName profileImage");
        return res.status(201).json(populatedPost);

    } catch (error) {
        return res.status(500).json({ message: `uploadPost error ${error}` });
    }
};
const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find({})
            .populate("author", "name userName profileImage")
            .populate("comments.author").sort({ createdAt: -1 })
        return res.status(200).json(posts);

    } catch (error) {
        return res.status(500).json({ message: `getAllPost error ${error}` });
    }
};
const like = async (req, res) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(400).json({ message: "Post not found" });
        }
        const alreadyLiked = post.likes.some(
            id => id.toString() === req.userId.toString()
        );

        if (alreadyLiked) {
            post.likes = post.likes.filter(
                id => id.toString() !== req.userId.toString()
            );
        } else {
            post.likes.push(req.userId);
            if (post.author._id != req.userId) {
                const notification = await Notification.create({
                    sender: req.userId,
                    receiver: post.author._id,
                    type: "like",
                    post: post._id,
                    message: "liked your post"
                })
                const populatedNotification = await Notification.findById(notification._id)
                    .populate("sender receiver post")
                const receiverSocketId = getSocketId(post.author._id)
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("newNotification", populatedNotification)
                }
            }
        };
        await post.save();
        await post.populate("author", "name userName profileImage");
        io.emit("likedPost", {
            postId: post._id,
            likes: post.likes
        })
        return res.status(200).json(post);

    } catch (error) {
          return res.status(500).json({ message: `likePost error ${error}` });
    }
};
const comment = async (req, res) => {
    try {
        const { message } = req.body
        const postId = req.params.postId
        const post = await Post.findById(postId)
        if (!post) {
            
            return res.status(400).json({ message: "Post not found" });
        }
        post.comments.push({
            author: req.userId,
            message
        })
        if (post.author._id != req.userId) {
            const notification = await Notification.create({
                sender: req.userId,
                receiver: post.author._id,
                type: "comment",
                post: post._id,
                message: "commented on your post"
            })
            const populatedNotification = await Notification.findById(notification._id)
                .populate("sender receiver post")
            const receiverSocketId = getSocketId(post.author._id)
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newNotification", populatedNotification)
            }
        }
        await post.save()
        await post.populate("author", "name userName profileImage");
        await post.populate("comments.author");
       
        io.emit("commentedPost", {
            postId: post._id,
            comments: post.comments
        })
        return res.status(200).json(post);
    } catch (error) {
        return res.status(500).json({ message: `commentPost error ${error}` });
    }
};
const saved = async (req, res) => {
    try {
        const postId = req.params.postId
        const userId = req.userId

        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        // 🔥 CLEAN BAD DATA
        user.saved = user.saved.filter(id => id !== null)

        const alreadySaved = user.saved.some(
            id => id.toString() === postId.toString()
        )

        if (alreadySaved) {
            user.saved = user.saved.filter(
                id => id.toString() !== postId.toString()
            )
        } else {
            user.saved.push(postId)
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

        // ✅ MERGE + REMOVE DUPLICATES
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
const sharePost = async (req, res) => {
    try {
        const { postId, receiverId } = req.body

        console.log("BODY:", req.body)
        console.log("USER:", req.userId)

        if (!postId || !receiverId) {
            return res.status(400).json({ message: "Missing data" })
        }

        if (!req.userId) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({ message: "Post not found" })
        }

        // ✅ FIXED COMPARISON
        if (receiverId.toString() !== req.userId.toString()) {

            const notification = await Notification.create({
                sender: req.userId,
                receiver: receiverId,
                type: "share",
                post: postId,
                message: "shared a post with you"
            })

            const populated = await Notification.findById(notification._id)
                .populate("sender receiver post")

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
const deletePost = async (req, res) => {
    try {
        const postId = req.params.postId
        const userId = req.userId

        const post = await Post.findById(postId)

        if (!post) {
            return res.status(404).json({ message: "Post not found" })
        }

        // ✅ Only owner can delete
        if (post.author.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized" })
        }

        // 🔥 Remove post from user's posts array
        const user = await User.findById(userId)
        user.posts = user.posts.filter(
            id => id.toString() !== postId.toString()
        )
        await user.save()

        // 🔥 Delete post
        await Post.findByIdAndDelete(postId)

        // 🔥 Optional: emit socket event
        io.emit("deletedPost", { postId })

        return res.status(200).json({
            message: "Post deleted successfully",
            postId
        })

    } catch (error) {
        console.log("💥 deletePost error:", error)
        return res.status(500).json({ message: "deletePost error" })
    }
};
const updatePost = async (req, res) => {
    try {
        const postId = req.params.postId
        const userId = req.userId
        const { caption } = req.body

        const post = await Post.findById(postId)

        if (!post) {
            return res.status(404).json({ message: "Post not found" })
        }

        // ✅ Only owner can edit
        if (post.author.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Unauthorized" })
        }

        // 🔥 Update caption
        post.caption = caption || post.caption

        await post.save()

        await post.populate("author", "name userName profileImage")

        // 🔥 Emit socket update (optional but powerful)
        io.emit("updatedPost", {
            postId: post._id,
            caption: post.caption
        })

        return res.status(200).json(post)

    } catch (error) {
        console.log("💥 updatePost error:", error)
        return res.status(500).json({ message: "updatePost error" })
    }
};
const getComments = async (req, res) => {
    try {
        

        const postId = req.params.postId;
       

        const post = await Post.findById(postId)
            .populate("comments.author", "name userName profileImage");

        if (!post) {
           
            return res.status(404).json({ message: "Post not found" });
        }

        

        return res.status(200).json(post.comments);

    } catch (error) {
        
        return res.status(500).json({ message: `getComments error ${error}` });
    }
};
const reply = async (req, res) => {
  try {
   

    const { message } = req.body;
    const commentId = req.params.commentId;

    

    const post = await Post.findOne({
      "comments._id": commentId
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // 🔥 FIXED PART
    if (!comment.replies) {
      comment.replies = [];
    }

    comment.replies.push({
      author: req.userId,
      message,
      likes: [],
      createdAt: new Date()
    });

    // 🔔 Notification
    if (comment.author.toString() !== req.userId.toString()) {
      const notification = await Notification.create({
        sender: req.userId,
        receiver: comment.author,
        type: "reply", // ✅ now valid
        post: post._id,
        message: "replied to your comment"
      });

      const populatedNotification = await Notification.findById(notification._id)
        .populate("sender receiver post");

      const receiverSocketId = getSocketId(comment.author);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newNotification", populatedNotification);
      }
    }

    await post.save();

    await post.populate([
      { path: "comments.author" },
      { path: "comments.replies.author" }
    ]);

   

    io.emit("repliedComment", {
      postId: post._id,
      comments: post.comments
    });

    return res.status(200).json({
      postId: post._id,
      comments: post.comments
    });

  } catch (error) {
   
    return res.status(500).json({ message: `reply error ${error}` });
  }
};
const deleteComment = async (req, res) => {
  try {
    console.log("➡️ Entered deleteComment function");

    const { postId, commentId } = req.params;
    const userId = req.userId;

    console.log("📥 postId:", postId);
    console.log("📥 commentId:", commentId);

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // 🥇 TRY DELETE COMMENT
    let comment = post.comments.id(commentId);

    if (comment) {
      if (comment.author.toString() !== userId.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      post.comments = post.comments.filter(
        (c) => c._id.toString() !== commentId.toString()
      );

      await post.save();

      console.log("✅ Comment deleted");

      io.emit("deletedComment", {
        postId: post._id,
        commentId
      });

      return res.status(200).json({
        message: "Comment deleted",
        commentId
      });
    }

    // 🥈 TRY DELETE REPLY
    for (let c of post.comments) {
      const reply = c.replies?.find(
        (r) => r._id.toString() === commentId.toString()
      );

      if (reply) {
        // 🔒 check ownership
        if (reply.author.toString() !== userId.toString()) {
          return res.status(403).json({ message: "Unauthorized" });
        }

        c.replies = c.replies.filter(
          (r) => r._id.toString() !== commentId.toString()
        );

        await post.save();

        console.log("✅ Reply deleted");

        io.emit("deletedReply", {
          postId: post._id,
          commentId: c._id,
          replyId: commentId
        });

        return res.status(200).json({
          message: "Reply deleted",
          replyId: commentId
        });
      }
    }

    // ❌ NOT FOUND
    console.log("❌ Comment/Reply not found");
    return res.status(404).json({ message: "Not found" });

  } catch (error) {
    console.error("💥 deleteComment error:", error);
    return res.status(500).json({ message: "deleteComment error" });
  }
};
const likeComment = async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const userId = req.userId;

    let post = await Post.findOne({
      "comments._id": commentId
    });

    let target = null;

    if (post) {
      // ✅ It's a COMMENT
      target = post.comments.id(commentId);
    } else {
      // 🔥 Try finding in replies
      const allPosts = await Post.find();

      for (let p of allPosts) {
        for (let c of p.comments) {
          const reply = c.replies?.find(
            r => r._id.toString() === commentId
          );

          if (reply) {
            post = p;
            target = reply;
            break;
          }
        }
        if (target) break;
      }
    }

    if (!target || !post) {
      return res.status(404).json({ message: "Not found" });
    }

    // ✅ Ensure likes exists
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

    await post.save();

    return res.status(200).json(target.likes);

  } catch (error) {
    console.log("❌ like error:", error);
    return res.status(500).json({ message: "comment/reply like error" });
  }
};
export { uploadPost, getAllPosts, like, comment, saved, getShareList, sharePost, deletePost, updatePost, getComments, reply, deleteComment, likeComment }