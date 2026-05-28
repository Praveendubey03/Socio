import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { useReactToStory, useReplyToStory } from "../../hooks/useStory";

const StoryActions = ({ story }) => {
  const { reactToStory } = useReactToStory();
  const { replyToStory } = useReplyToStory();

  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // 🔄 reset when story changes
  useEffect(() => {
    setLiked(false);
    setMessage("");
  }, [story?._id]);

  // ❤️ LIKE
  const handleLike = async () => {
    if (liked || loading || !story?._id) return;

    setLoading(true);

    const res = await reactToStory(story._id);

    if (res?.alreadyReacted) {
      setLiked(true);
      setLoading(false);
      return;
    }

    setLiked(true);
    setLoading(false);
  };

  // 💬 SEND REPLY
  const handleSend = async () => {
    if (!message.trim() || sending || !story?._id) return;

    setSending(true);

    await replyToStory(story._id, message);

    setMessage(""); // ✅ clear input
    setSending(false);
  };

  // ⌨️ ENTER KEY
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-3 w-full max-w-md">

      {/* 💬 INPUT */}
      <input
        type="text"
        placeholder="Send message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-1 px-4 py-2 rounded-full bg-black/40 text-white text-sm outline-none border border-gray-600 placeholder-gray-400"
      />

      {/* 📩 SEND BUTTON */}
      {message.trim() && (
        <IoSend
          onClick={handleSend}
          className="text-white text-xl cursor-pointer hover:scale-110 transition"
        />
      )}

      {/* ❤️ HEART */}
      <FaHeart
        onClick={handleLike}
        className={`text-xl cursor-pointer transition ${
          liked ? "text-red-500 scale-125" : "text-white"
        }`}
      />
    </div>
  );
};

export default StoryActions;