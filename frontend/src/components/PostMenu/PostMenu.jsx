import React, { useEffect, useRef, useState } from "react"
import { PiDotsThreeOutline } from "react-icons/pi"
import { BsEmojiSmile } from "react-icons/bs"
import { createPortal } from "react-dom"
import { useNavigate, useLocation } from "react-router-dom"
import EmojiPicker from "emoji-picker-react"
import FollowButton from "../FollowButton/FollowButton"

const PostMenu = ({
  isOwner,
  isFollowing,
  onDelete,
  onEditSave,
  username,
  iconColor = "black",
  targetUserId,
  currentCaption
}) => {

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState("menu") // menu | delete | edit
  const [caption, setCaption] = useState("")
  const [showEmoji, setShowEmoji] = useState(false)

  const textareaRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  const closeAll = () => {
    setOpen(false)
    setMode("menu")
    setShowEmoji(false)
  }

  // ✅ preload caption
  useEffect(() => {
    if (mode === "edit") {
      setCaption(currentCaption || "")
    }
  }, [mode, currentCaption])

  // ✅ auto expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px"
    }
  }, [caption])

  // 🗑️ DELETE
  const handleDeleteConfirm = async () => {
    await onDelete()

    if (location.pathname.includes("post")) {
      navigate("/")
    }

    closeAll()
  }

  // ✏️ EDIT SAVE
  const handleEditSave = async () => {
    await onEditSave(caption)
    closeAll()
  }
  if (!isOwner && !targetUserId) return null
  return (
    <>
      {/* 3 DOT BUTTON */}
      <PiDotsThreeOutline
        className={`w-6 h-6 cursor-pointer ${iconColor === "white" ? "text-white" : "text-black"
          }`}
        onClick={() => setOpen(true)}
      />
      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={closeAll}
          >
            <div
              className="w-[90%] max-w-sm bg-[#1c1c1e] text-white rounded-2xl overflow-hidden animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >

              {/* ================= OWNER ================= */}
              {isOwner && mode === "menu" && (
                <>
                  <button
                    className="w-full py-4 text-red-500 border-b border-gray-700"
                    onClick={() => setMode("delete")}
                  >
                    Delete
                  </button>

                  <button
                    className="w-full py-4 border-b border-gray-700"
                    onClick={() => setMode("edit")}
                  >
                    Edit
                  </button>

                  <button
                    className="w-full py-4 border-b border-gray-700"
                    onClick={() => {
                      navigate(`/profile/${username}`)
                      closeAll()
                    }}
                  >
                    Go to profile
                  </button>

                  <button
                    className="w-full py-4 bg-[#2c2c2e]"
                    onClick={closeAll}
                  >
                    Cancel
                  </button>
                </>
              )}

              {/* ================= OTHER USER ================= */}
              {!isOwner && (
                <>
                  <div className="py-4 border-b border-gray-700 flex justify-center">

                    <FollowButton
                      targetUserId={targetUserId}
                      variant="menu"
                      tailwind="px-6 py-2 text-sm rounded-md"
                    />

                  </div>

                  <button
                    className="w-full py-4 border-b border-gray-700"
                    onClick={() => {
                      navigate(`/profile/${username}`)
                      closeAll()
                    }}
                  >
                    Go to profile
                  </button>

                  <button
                    className="w-full py-4 bg-[#2c2c2e]"
                    onClick={closeAll}
                  >
                    Cancel
                  </button>
                </>
              )}

              {/* ================= DELETE ================= */}
              {isOwner && mode === "delete" && (
                <>
                  <div className="py-5 text-center border-t border-gray-700">
                    <p className="text-lg font-semibold">
                      Delete this post?
                    </p>
                  </div>

                  <button
                    className="w-full py-4 text-red-500 border-b border-gray-700"
                    onClick={handleDeleteConfirm}
                  >
                    Yes, Delete
                  </button>

                  <button
                    className="w-full py-4"
                    onClick={() => setMode("menu")}
                  >
                    Cancel
                  </button>
                </>
              )}

              {/* ================= EDIT ================= */}
              {isOwner && mode === "edit" && (
                <>
                  <div className="p-4 border-t border-gray-700">

                    <p className="font-semibold mb-2">
                      Edit Caption
                    </p>

                    <textarea
                      ref={textareaRef}
                      rows={1}
                      autoFocus
                      className="w-full px-3 py-2 rounded bg-[#2c2c2e] outline-none text-sm resize-none"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                    />

                    <div className="flex justify-between items-center mt-2">

                      <button onClick={() => setShowEmoji(prev => !prev)}>
                        <BsEmojiSmile className="w-5 h-5" />
                      </button>

                      <span className="text-xs text-gray-400">
                        {caption.length} chars
                      </span>
                    </div>

                    {showEmoji && (
                      <div className="mt-2">
                        <EmojiPicker
                          onEmojiClick={(emojiData) => {
                            setCaption(prev => prev + emojiData.emoji)
                          }}
                          theme="dark"
                          height={350}
                        />
                      </div>
                    )}

                  </div>

                  <button
                    className="w-full py-4 text-blue-500 border-b border-gray-700"
                    onClick={handleEditSave}
                  >
                    Save
                  </button>

                  <button
                    className="w-full py-4"
                    onClick={() => setMode("menu")}
                  >
                    Cancel
                  </button>
                </>
              )}

            </div>
          </div>,
          document.body
        )}
    </>
  )
}

export default PostMenu