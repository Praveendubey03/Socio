import React, { useState } from 'react';
import { GoHomeFill } from "react-icons/go";
import { FiSearch } from "react-icons/fi";
import { FaRegPlusSquare } from "react-icons/fa";
import { RxVideo } from "react-icons/rx";
import dp from "../../assets/dp.png";
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Nav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = useSelector((state) => state.user.userData);

  // ✅ active route (persistent)
  const currentPath = location.pathname;

  const isActive = (path) => currentPath === path;

  return (
    <div className='w-[90%] lg:w-[40%] h-[70px] bg-black border-1 border-amber-400 flex justify-around items-center fixed bottom-[20px] left-1/2 -translate-x-1/2 rounded-full shadow-2xl shadow-[#000000] z-[100]'>

      {/* HOME */}
     <div
  onClick={() => {
    if (location.pathname === "/") {
      window.location.reload(); // ✅ force refresh
    } else {
      navigate("/"); // normal navigation
    }
  }}
  className={`p-2 rounded-full transition
    ${location.pathname === "/" 
      ? "bg-gradient-to-r from-blue-500 to-blue-950" 
      : "hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-950"
    }`}
>
  <GoHomeFill className='text-white w-[25px] h-[25px]' />
</div>

      {/* SEARCH */}
      <div
        onClick={() => navigate("/search")}
        className={`p-2 rounded-full transition
          ${isActive("/search") 
            ? "bg-gradient-to-r from-blue-500 to-blue-950" 
            : "hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-950"
          }`}
      >
        <FiSearch className='text-white w-[25px] h-[25px]' />
      </div>

      {/* ADD */}
      <div
        onClick={() => navigate("/upload")}
        className={`p-2 rounded-full transition
          ${isActive("/upload") 
            ? "bg-gradient-to-r from-blue-500 to-blue-950" 
            : "hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-950"
          }`}
      >
        <FaRegPlusSquare className='text-white w-[30px] h-[30px]' />
      </div>

      {/* LOOPS */}
      <div
        onClick={() => navigate("/loops")}
        className={`p-2 rounded-full transition
          ${isActive("/loops") 
            ? "bg-gradient-to-r from-blue-500 to-blue-950" 
            : "hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-950"
          }`}
      >
        <RxVideo className='text-white w-[26px] h-[26px]' />
      </div>

      {/* PROFILE */}
      <div
  onClick={() => {
    if (userData?.userName) {
      navigate(`/profile/${userData.userName}`);
    }
  }}
  className='cursor-pointer'
>
  {/* OUTER WRAPPER (for ring) */}
  <div
    className={`rounded-full p-[3px] transition
      ${location.pathname.includes("/profile")
        ? "bg-gradient-to-r from-blue-500 to-gray-300"
        : "hover:bg-gradient-to-r hover:from-blue-500 hover:to-blue-950"
      }`}
  >
    {/* GAP + IMAGE */}
    <div className='bg-black rounded-full p-[2px]'>
      <div className='w-[40px] h-[40px] rounded-full overflow-hidden'>
        <img
          src={userData?.profileImage || dp}
          className='w-full h-full object-cover'
        />
      </div>
    </div>
  </div>
</div>

    </div>
  );
};

export default Nav;