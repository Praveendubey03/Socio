import React from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setSelectedUser } from "../../redux/messageSlice";

const ChatHeader = ({ showBack = true }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleBack = () => {
    dispatch(setSelectedUser(null)); // clear chat
    navigate("/"); // go to home page
  };

  return (
    <div className="w-full h-[70px] flex items-center gap-[15px] px-[20px] border-b border-gray-800">
      {showBack && (
        <FaArrowLeft
          onClick={handleBack}
          className="w-[22px] h-[22px] text-white cursor-pointer"
        />
      )}
      <h1 className="text-white text-[18px] font-semibold">Messages</h1>
    </div>
  );
};

export default ChatHeader;