import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import dp from "../../assets/dp.png";
import EmojiPicker from "emoji-picker-react";
import { BsEmojiSmile } from "react-icons/bs";

const CommentInput = ({ message, setMessage, onSend }) => {
  const { userData } = useSelector((state) => state.user);

  const [showEmoji, setShowEmoji] = useState(false);
  const emojiRef = useRef();

  const isDisabled = !message.trim();

  // ✅ Handle emoji click
  const handleEmoji = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  // ✅ Enter to send
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isDisabled) {
      onSend();
    }
  };

  // ✅ CLOSE ON OUTSIDE CLICK
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">

      {/* INPUT BAR */}
      <div className="flex items-center gap-3 px-3 py-2 border-t bg-white">

        {/* 👤 USER DP */}
        <img
          src={userData?.profileImage || dp}
          className="w-8 h-8 rounded-full object-cover"
        />

        {/* 😊 EMOJI BUTTON */}
        <BsEmojiSmile
          className="text-xl cursor-pointer text-gray-500 hover:text-black"
          onClick={() => setShowEmoji((prev) => !prev)}
        />

        {/* ✏️ INPUT */}
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment..."
          className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
        />

        {/* 🚀 POST */}
        <button
          onClick={onSend}
          disabled={isDisabled}
          className={`text-sm font-semibold transition ${
            isDisabled
              ? "text-blue-200 cursor-not-allowed"
              : "text-blue-500 hover:text-blue-600"
          }`}
        >
          Post
        </button>
      </div>

      {/* 🔥 EMOJI PICKER (FLOATING — DOES NOT MOVE UI) */}
      {showEmoji && (
        <div
          ref={emojiRef}
          className="fixed bottom-20 right-4 z-50 shadow-xl"
        >
          <EmojiPicker onEmojiClick={handleEmoji} />
        </div>
      )}
    </div>
  );
};

export default CommentInput;