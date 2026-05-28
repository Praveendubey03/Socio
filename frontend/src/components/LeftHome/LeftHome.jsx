import React, { useState } from 'react'
import logo from '../../assets/logo.png'
import dp from '../../assets/dp.png'
import { FaRegHeart } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../../App';
import { setUserData } from '../../redux/userSlice';
import OtherUser from '../OtherUser/OtherUser';
import { useNavigate } from 'react-router-dom';
import Notifications from '../../pages/Notifications/Notifications';

const LeftHome = () => {

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { userData, suggestedUsers, notificationData } = useSelector(state => state.user)

  const [showNotification, setShowNotification] = useState(false)

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
      dispatch(setUserData(null))
      navigate("/login") // ✅ FIX: redirect after logout
    } catch (error) {
      console.log(error)
    }
  }

  // ✅ SAFE unread check
  const hasUnread =
    Array.isArray(notificationData) &&
    notificationData.some(noti => !noti.isRead)

  return (
    <div className={`w-[25%] hidden lg:block h-[100vh] bg-black border-r border-gray-900 ${showNotification ? "overflow-hidden" : "overflow-auto"}`}>

      {/* Top Bar */}
      <div className='w-full h-[100px] flex items-center justify-between p-[20px]'>
        <img src={logo} alt="" className='w-[80px]' />

        <div className='relative'>
          <FaRegHeart
            className='text-white w-[25px] h-[25px] cursor-pointer'
            onClick={() => setShowNotification(prev => !prev)}
          />

          {hasUnread && (
            <div className='w-[10px] h-[10px] bg-red-500 border border-gray-400 rounded-full absolute top-0 right-[-5px]' />
          )}
        </div>
      </div>

      {/* Main Content */}
      {!showNotification && (
        <>
          <div className='flex items-center w-full px-[10px] justify-between gap-[10px] border-b border-gray-900 py-[10px]'>

            <div className='flex items-center gap-[10px]'>
              <div className='w-[70px] h-[70px] rounded-full overflow-hidden cursor-pointer'>
                <img
                  src={userData?.profileImage || dp}
                  className='w-full h-full object-cover' // ✅ FIX
                />
              </div>

              <div>
                <div className='text-[18px] text-white font-semibold'>
                  {userData?.userName}
                </div>
                <div className='text-[15px] text-gray-400 font-semibold'>
                  {userData?.name}
                </div>
              </div>
            </div>

            <div
              className='text-blue-500 font-semibold cursor-pointer'
              onClick={handleLogOut}
            >
              Log Out
            </div>
          </div>

          <div className='w-full flex flex-col gap-[20px] p-[20px]'>
            <h1 className='text-white text-[19px]'>Suggested Users</h1>

            {/* ✅ SAFE MAP */}
            {Array.isArray(suggestedUsers) &&
              suggestedUsers.slice(0, 3).map((user) => (
                <OtherUser key={user._id} user={user} />
              ))
            }
          </div>
        </>
      )}

      {/* Notifications Panel */}
      {showNotification && <Notifications />}
    </div>
  )
}

export default LeftHome