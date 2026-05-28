import React, { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import axios from "axios"
import { serverUrl } from "../../App"
import dp from "../../assets/dp.png"
import VideoPlayer from "../../components/VideoPlayer/VideoPlayer"
import { FaRegHeart, FaHeart } from "react-icons/fa"
import { MdOutlineComment } from "react-icons/md"
import { FaRegBookmark, FaBookmark } from "react-icons/fa6"
import { IoSend } from "react-icons/io5"
import { setPostData } from "../../redux/postSlice"
import { setUserData } from "../../redux/userSlice"
import ShareCard from "../../components/ShareCard/ShareCard"
import { openShare } from "../../redux/shareSlice"
import PostMenu from "../../components/PostMenu/PostMenu"

const PostView = () => {
  const { postId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { postData } = useSelector(state => state.post)
  const { userData } = useSelector(state => state.user)

  const [message, setMessage] = useState("")
  const [showComments, setShowComments] = useState(false)

  const post = postData.find(p => p._id === postId)
  if (!post) return <div className="text-white">Post not found</div>

  const isLiked = post.likes.includes(userData._id)
  const isSaved = userData.saved?.some(p => p._id === post._id)

  // ✅ OWNER / FOLLOW STATE
  const isOwner = userData._id === post.author._id
  const isFollowing = userData.following?.includes(post.author._id)

  // ❤️ LIKE
  const handleLike = async () => {
    const res = await axios.get(`${serverUrl}/api/post/like/${post._id}`, {
      withCredentials: true
    })

    const updatedPosts = postData.map(p =>
      p._id === post._id ? res.data : p
    )

    dispatch(setPostData(updatedPosts))
  }

  // 💬 COMMENT
  const handleComment = async () => {
    if (!message.trim()) return

    const res = await axios.post(
      `${serverUrl}/api/post/comment/${post._id}`,
      { message },
      { withCredentials: true }
    )

    const updatedPosts = postData.map(p =>
      p._id === post._id ? res.data : p
    )

    dispatch(setPostData(updatedPosts))
    setMessage("")
  }

  // 🔖 SAVE
  const handleSave = async () => {
    const updatedSaved = isSaved
      ? userData.saved.filter(p => p._id !== post._id)
      : [...(userData.saved || []), post]

    dispatch(setUserData({ ...userData, saved: updatedSaved }))

    await axios.get(`${serverUrl}/api/post/saved/${post._id}`, {
      withCredentials: true
    })
  }

  // 🗑️ DELETE
  const handleDelete = async () => {
    try {
      await axios.delete(
        `${serverUrl}/api/post/delete/${post._id}`,
        { withCredentials: true }
      )

      const updatedPosts = postData.filter(p => p._id !== post._id)
      dispatch(setPostData(updatedPosts))

      navigate("/") // close modal

    } catch (error) {
      console.log(error)
    }
  }

  // ✏️ EDIT
  const handleEditSave = async (newCaption) => {
    try {
      const res = await axios.put(
        `${serverUrl}/api/post/update/${post._id}`,
        { caption: newCaption },
        { withCredentials: true }
      )

      const updatedPosts = postData.map(p =>
        p._id === post._id ? res.data : p
      )

      dispatch(setPostData(updatedPosts))

    } catch (error) {
      console.log(error)
    }
  }

  // 🔁 FOLLOW / UNFOLLOW
  const handleFollowToggle = async () => {
    try {
      await axios.get(
        `${serverUrl}/api/user/follow/${post.author._id}`,
        { withCredentials: true }
      )
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      {/* BACKDROP */}
      <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-40 pointer-events-none">

        {/* CLICK OUTSIDE */}
        <div
          className="absolute inset-0"
          onClick={() => navigate(-1)}
        />

        {/* MODAL */}
        <div className="relative bg-gray-900 w-[900px] h-[600px] flex z-10 rounded-lg overflow-hidden pointer-events-auto">

          {/* LEFT MEDIA */}
          <div className="w-1/2 flex items-center justify-center">
            {post.mediaType === "image" ? (
              <img src={post.media} className="max-w-full max-h-full object-contain" />
            ) : (
              <VideoPlayer media={post.media} />
            )}
          </div>

          {/* RIGHT */}
          <div className="w-1/2 flex flex-col">

            {/* HEADER */}
            <div className="flex justify-between items-center p-3 border-b border-gray-700">

              <div className="flex items-center gap-3">
                <img
                  src={post.author?.profileImage || dp}
                  className="w-10 h-10 rounded-full cursor-pointer"
                  onClick={() => navigate(`/profile/${post.author.userName}`)}
                />

                <div>
                  <div className="text-white font-semibold">
                    {post.author.userName}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {post.author.name}
                  </div>
                </div>
              </div>

              {/* 🔥 POST MENU */}
              <PostMenu
                isOwner={isOwner}
                isFollowing={isFollowing}
                targetUserId={post.author._id}
                iconColor="white"
                username={post.author.userName}
                currentCaption={post.caption}
                onDelete={handleDelete}
                onEditSave={handleEditSave}
              />

            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-3">

              {post.caption && (
                <div className="mb-3 text-sm">
                  <span className="font-semibold text-white mr-2">
                    {post.author.userName}
                  </span>
                  <span className="text-gray-300">{post.caption}</span>
                </div>
              )}

              {showComments && (
                <div className="space-y-2">
                  {post.comments.map((c, i) => (
                    <div key={i} className="flex gap-2">
                      <img
                        src={c.author?.profileImage || dp}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="text-sm">
                        <span className="font-semibold text-white mr-1">
                          {c.author?.userName}
                        </span>
                        <span className="text-gray-300">{c.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ACTIONS */}
            <div className="p-3 border-t border-gray-700">

              <div className="flex justify-between items-center mb-2">
                <div className="flex gap-5 text-2xl">

                  {isLiked ? (
                    <FaHeart className="text-red-500 cursor-pointer" onClick={handleLike} />
                  ) : (
                    <FaRegHeart className="cursor-pointer text-white" onClick={handleLike} />
                  )}

                  <MdOutlineComment
                    className="cursor-pointer text-white"
                    onClick={() => setShowComments(prev => !prev)}
                  />

                  <IoSend
                    className="cursor-pointer text-white"
                    onClick={() => dispatch(openShare({ post }))}
                  />

                </div>

                <div onClick={handleSave} className="text-2xl">
                  {isSaved ? (
                    <FaBookmark className="cursor-pointer text-white" />
                  ) : (
                    <FaRegBookmark className="cursor-pointer text-white" />
                  )}
                </div>
              </div>

              <div className="text-white text-sm font-semibold">
                {post.likes.length} likes
              </div>

              <div className="flex items-center gap-2 mt-3">
                <img src={userData?.profileImage || dp} className="w-8 h-8 rounded-full" />
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="flex-1 bg-transparent outline-none text-white"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />

                {message && (
                  <IoSend className="cursor-pointer text-white" onClick={handleComment} />
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      <ShareCard />
    </>
  )
}

export default PostView