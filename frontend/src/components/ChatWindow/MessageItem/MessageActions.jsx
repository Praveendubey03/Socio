import { BsEmojiSmile } from "react-icons/bs";
import { BiReply } from "react-icons/bi";
import { HiDotsHorizontal } from "react-icons/hi";

import { useDispatch } from "react-redux";
import { setReplyMessage } from "../../../redux/messageSlice";

const MessageActions = ({
  message,      // 🔥 REQUIRED
  isSender,
  show,
  onReact,
  onMenu,
}) => {
  const dispatch = useDispatch();

  if (!show) return null;

  const handleReply = () => {
    dispatch(setReplyMessage(message)); // 🔥 core logic
  };

  if (!show || message.isDeleted) return null;
  return (
    <div
      className={`
        absolute top-1/2 -translate-y-1/2 flex items-center gap-2
        text-white text-[18px] z-10
        ${isSender ? "right-full mr-2" : "left-full ml-2"}
      `}
    >
      {/* EMOJI */}
      <button
        onClick={onReact}
        className="p-1 rounded-full hover:bg-white/10 transition"
      >
        <BsEmojiSmile />
      </button>

      {/* REPLY */}
      <button
        onClick={handleReply}
        className="p-1 rounded-full hover:bg-white/10 transition"
      >
        <BiReply />
      </button>

      {/* MENU */}
      <button
        onClick={onMenu}
        className="p-1 rounded-full hover:bg-white/10 transition"
      >
        <HiDotsHorizontal />
      </button>
    </div>
  );
};

export default MessageActions;