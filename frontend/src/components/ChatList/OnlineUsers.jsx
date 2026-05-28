import React from "react";
import { useSelector } from "react-redux";
import dp from "../../assets/dp.png";

const OnlineUsers = ({ onUserClick }) => {
  const { userData } = useSelector((state) => state.user);
  const { onlineUsers } = useSelector((state) => state.socket);

  const online = Array.isArray(onlineUsers) ? onlineUsers : [];

  // ✅ FILTER ONLY ONLINE USERS
  const onlineFollowing = userData?.following?.filter((user) =>
    online.includes(user._id?.toString())
  );

  if (!onlineFollowing?.length) return null;

  return (
    <div className="flex gap-4 overflow-x-auto px-4 py-3 border-b border-gray-800 scrollbar-hide">

      {onlineFollowing.map((user) => (
        <div
          key={user._id}
          onClick={() => onUserClick(user)}
          className="flex flex-col items-center cursor-pointer min-w-[60px]"
        >
          {/* AVATAR */}
          <div className="relative">
            <img
              src={user.profileImage || dp}
              className="w-[60px] h-[60px] rounded-full object-cover border-2 border-green-500"
            />

            {/* ONLINE DOT */}
            <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
          </div>

          {/* NAME */}
          <span className="text-white text-xs mt-1 truncate w-[60px] text-center">
            {user.userName}
          </span>
        </div>
      ))}

    </div>
  );
};

export default OnlineUsers;