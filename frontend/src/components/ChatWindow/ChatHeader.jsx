import React from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import dp from "../../assets/dp.png";
import { setSelectedUser } from "../../redux/messageSlice";

// ✅ NEW IMPORT


const ChatHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedUser, typingUsers } = useSelector((state) => state.message);
  const { onlineUsers } = useSelector((state) => state.socket);

  if (!selectedUser) return null;

  // 🔹 ONLINE STATUS
  const isOnline = onlineUsers.includes(selectedUser._id?.toString());

  // 🔹 TYPING STATUS
  const isTyping = Object.values(typingUsers).includes(selectedUser._id);

  return (
    <div className="w-full h-[70px] flex items-center justify-between px-[15px] border-b border-gray-800 bg-black">

      {/* LEFT SIDE */}
      <div className="flex items-center gap-3">

        {/* BACK BUTTON */}
        <FaArrowLeft
          onClick={() => dispatch(setSelectedUser(null))}
          className="text-white text-[20px] cursor-pointer md:hidden"
        />

        {/* PROFILE */}
        <div
          className="relative cursor-pointer"
          onClick={() => navigate(`/profile/${selectedUser.userName}`)}
        >
          <img
            src={selectedUser.profileImage || dp}
            className="w-[42px] h-[42px] rounded-full object-cover"
          />

          {/* ONLINE DOT */}
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
          )}
        </div>

        {/* USER INFO */}
        <div className="flex flex-col leading-tight">
          <span className="text-white font-semibold text-[15px]">
            {selectedUser.userName}
          </span>

          <span className="text-[12px] text-gray-400">
            {isTyping
              ? "typing..."
              : isOnline
              ? "Active now"
              : "Offline"}
          </span>
        </div>
      </div>

      {/* RIGHT SIDE */}
     

    </div>
  );
};

export default ChatHeader;