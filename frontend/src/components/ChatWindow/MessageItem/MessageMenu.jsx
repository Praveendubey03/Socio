import { useDispatch } from "react-redux";
import { setEditingMessage } from "../../../redux/messageSlice";
import useChat from "../../../hooks/useChat";
import { useSelector } from "react-redux";
const MessageMenu = ({ isSender, message, navigate, onInfo, onClose }) => {
  const dispatch = useDispatch()
  const isEditable = () => {
    const createdAt = new Date(message.createdAt).getTime();
    const now = Date.now();

    return now - createdAt <= 15 * 60 * 1000; // 15 min
  };
  const { deleteForMe, deleteForEveryone } = useChat();
  const { userData } = useSelector((state) => state.user);
  const baseBtn =
    "text-[14px] px-3 py-2 rounded-lg text-left transition";

  return (
    <div
      className={`
        absolute top-1/2 -translate-y-1/2 z-50
        ${isSender ? "right-full mr-10" : "left-full ml-10"}
        w-[160px]
        bg-[#121212]
        rounded-xl p-2 flex flex-col gap-1
        z-50 shadow-lg border border-gray-800
      `}
    >
      {isSender ? (
        <>
          <button
            onClick={() => { onInfo(); onClose(); }}
            className={`${baseBtn} text-white hover:bg-white/10`}

          >
            Info
          </button>

          <button
            onClick={() => {
              deleteForEveryone(message._id);
              onClose();
            }}
            className={`${baseBtn} text-red-500 hover:bg-red-500/10`}
          >
            Unsend
          </button>

          {isEditable() && (
            <button
              onClick={() => {
                dispatch(setEditingMessage(message));
                onClose();
              }}
              className={`${baseBtn} text-white hover:bg-white/10`}
            >
              Edit Message
            </button>
          )}

          <button
            onClick={() => { onClose(); }}
            className={`${baseBtn} text-white hover:bg-white/10`}>
            Forward
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => {
              deleteForMe(message._id, userData._id);
              onClose();
            }}
            className={`${baseBtn} text-red-500 hover:bg-red-500/10`}
          >
            Delete
          </button>

          <button
            onClick={() => { onClose(); }}
            className={`${baseBtn} text-white hover:bg-white/10`}>
            Forward
          </button>

          <button
            onClick={() => {
              onClose();
              navigate(`/profile/${message?.sender?.userName}`)

            }}
            className={`${baseBtn} text-white hover:bg-white/10`}
          >
            Profile
          </button>
        </>
      )}
    </div>
  );
};

export default MessageMenu;