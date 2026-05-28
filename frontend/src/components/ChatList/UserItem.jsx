import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { FiMoreVertical } from "react-icons/fi";
import { RiPushpin2Line } from "react-icons/ri";
import { GoBellSlash } from "react-icons/go";
import dp from "../../assets/dp.png";
import useConversation from "../../hooks/useConversation";

const formatTime = (date) => {
  if (!date) return "";

  const now = new Date();
  const msgDate = new Date(date);

  const diff = Math.floor((now - msgDate) / 1000);

  if (diff < 60) return "now";
  if (diff < 3600) return Math.floor(diff / 60) + "m";
  if (diff < 86400) return Math.floor(diff / 3600) + "h";

  return msgDate.toLocaleDateString();
};

const UserItem = ({ user, onClick, isArchivedView, onDeleteClick }) => {
  const { onlineUsers } = useSelector((state) => state.socket);
  const { typingUsers } = useSelector((state) => state.typing);
  
  const online = Array.isArray(onlineUsers) ? onlineUsers : [];

  const isOnline = online.includes(user._id?.toString());
  const isTypingUser =
    typingUsers?.[user.conversationId]?.length > 0;

  const lastMessage = isTypingUser ? "Typing..."
    : user.lastMessage?.text || "Tap to message";

  const time = formatTime(user.lastMessage?.createdAt);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  const { pinChat, muteChat, archiveChat } = useConversation();

  //CLOSE MENU ON OUTSIDE CLICK
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`relative flex items-center justify-between px-3 py-2 cursor-pointer transition group`}
    >
      <div
        onClick={onClick}
        className="flex items-center gap-3 min-w-0 flex-1"
      >
        <div className="relative">
          <img
            src={user.profileImage || dp}
            className="w-[52px] h-[52px] rounded-full object-cover"
          />

          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-white text-[15px] font-semibold truncate">
            {user.userName}
          </span>

          <span
            className={`text-[13px] truncate ${isTypingUser ? "text-green-400" : "text-gray-400"
              }`}
          >
            {lastMessage}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 relative">
        <div className="flex flex-col items-end gap-1">
          <span className="text-gray-500 text-xs">{time}</span>
          <div className="flex flex-row justify-between items-center gap-[5px]">

            {user.unreadCount > 0 && (
              <span className="min-w-[18px] h-[18px] px-[6px] flex items-center justify-center 
  bg-blue-500 text-white text-[11px] font-semibold rounded-full">
                {user.unreadCount > 99 ? "99+" : user.unreadCount}
              </span>
            )}
            {user.isMuted && (
              <span className="text-gray-400 text-sm font-semibold"><GoBellSlash /></span>
            )}
            {user.isPinned && (
              <span className="text-gray-400 text-sm font-semibold"><RiPushpin2Line /></span>
            )}


          </div>
        </div>

        <div
          className="relative"
          onClick={(e) => e.stopPropagation()}
        >
          <FiMoreVertical
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((prev) => !prev);
            }}
            className="text-gray-400 opacity-0 group-hover:opacity-100 transition cursor-pointer"
          />

          {showMenu && (
            <div
              ref={menuRef}
              className="absolute top-8 right-[-10px] min-w-[150px] 
               bg-[#1e1e1e] border border-gray-700 rounded-md 
               shadow-lg z-50 text-white"
            >

              {!isArchivedView ? (
                <>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      pinChat(user.conversationId);
                      setShowMenu(false);
                    }}
                    className="px-4 py-2 hover:bg-[#2a2a2a] cursor-pointer"
                  >
                    {user.isPinned ? "Unpin" : "Pin"}
                  </div>

                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      muteChat(user.conversationId);
                      setShowMenu(false);
                    }}
                    className="px-4 py-2 hover:bg-[#2a2a2a] cursor-pointer"
                  >
                    {user.isMuted ? "Unmute" : "Mute"}
                  </div>

                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      archiveChat(user.conversationId);
                      setShowMenu(false);
                    }}
                    className="px-4 py-2 hover:bg-[#2a2a2a] cursor-pointer"
                  >
                    Archive
                  </div>
                </>
              ) : (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    archiveChat(user.conversationId);
                    setShowMenu(false);
                  }}
                  className="px-4 py-2 hover:bg-[#2a2a2a] cursor-pointer"
                >
                  Unarchive
                </div>
              )}

              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onDeleteClick(user);
                }}
                className="px-4 py-2 text-red-400 hover:bg-[#2a2a2a] cursor-pointer"
              >
                Delete
              </div>
            </div>
          )}
        </div>
      </div>
     
    </div>
  );
};

export default UserItem;