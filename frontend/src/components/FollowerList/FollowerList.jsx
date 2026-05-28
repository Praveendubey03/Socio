import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import dp from "../../assets/dp.png"
import { IoClose } from "react-icons/io5";

const FollowerList = ({ type = "followers", onClose }) => {
  const navigate = useNavigate()

  const { profileData } = useSelector(state => state.user)

  const data =
    type === "followers"
      ? profileData?.followers || []
      : profileData?.following || []

  return (
    <div className="w-full">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-3 border-b border-gray-700 pb-2">
        <h2 className="font-semibold text-lg capitalize">{type}</h2>
        <button onClick={onClose} className="text-[15px] text-gray-400">
          <IoClose  />
        </button>
      </div>

      {/* LIST */}
      <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto">

        {data.length === 0 ? (
          <div className="text-center text-gray-400">
            No {type} found
          </div>
        ) : (
          data.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => {
                navigate(`/profile/${user.userName}`)
                onClose && onClose()
              }}
            >
              <img
                src={user.profileImage || dp}
                className="w-9 h-9 rounded-full object-cover"
              />

              <div className="flex flex-col">
                <span className="text-sm font-semibold">
                  {user.userName}
                </span>
                <span className="text-xs text-gray-400">
                  {user.name}
                </span>
              </div>
            </div>
          ))
        )}

      </div>
    </div>
  )
}

export default FollowerList