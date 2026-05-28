import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import dp from "../../../assets/dp.png";

const ReactionDetails = ({ reactions, onClose, isSender }) => {
  const ref = useRef();
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    const handleClick = (e) => {
      if (!ref.current?.contains(e.target)) {
        onClose();
      }
    };

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={`
        absolute z-50 bottom-full mb-2
        ${isSender ? "right-0" : "left-0"}
        w-[240px] max-h-[260px]
        overflow-y-auto
        bg-[#121212]/95 backdrop-blur-md
        border border-gray-700
        rounded-xl shadow-xl
      `}
    >
      {/* HEADER */}
      <div className="px-3 py-2 border-b border-gray-700 text-xs text-gray-400">
        Reactions
      </div>

      {/* LIST */}
      {reactions?.map((r, i) => {
        // 🔥 HANDLE BOTH CASES (ObjectId OR populated object)
        const user =
          typeof r.user === "object" ? r.user : null;

        const userId =
          typeof r.user === "object"
            ? r.user._id
            : r.user;

        const isCurrentUser =
          String(userId) === String(userData?._id);

        return (
          <div
            key={i}
            onClick={() => {
              if (!userId) {
                console.log("❌ NO USER ID FOUND", r);
                return;
              }

              console.log("👉 NAVIGATE TO:", userId);

              navigate(`/profile/${userId}`);
              onClose();
            }}
            className="
              flex items-center justify-between 
              px-3 py-2 
              hover:bg-[#1f1f1f] 
              active:bg-[#2a2a2a]
              cursor-pointer transition
            "
          >
            {/* LEFT */}
            <div className="flex items-center gap-2">
              <img
                src={user?.profileImage || dp}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
              />

              <span className="text-sm text-white truncate max-w-[120px]">
                {isCurrentUser
                  ? "You"
                  : user?.userName || "User"}
              </span>
            </div>

            {/* RIGHT */}
            <span className="text-lg">{r.emoji}</span>
          </div>
        );
      })}

      {/* EMPTY */}
      {(!reactions || reactions.length === 0) && (
        <div className="text-center text-gray-400 text-sm py-4">
          No reactions yet
        </div>
      )}
    </div>
  );
};

export default ReactionDetails;