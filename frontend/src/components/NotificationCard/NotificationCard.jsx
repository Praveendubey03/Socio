import React from 'react'
import dp from "../../assets/dp.png"
import { useNavigate } from 'react-router-dom'

const NotificationCard = ({ noti }) => {
    const navigate = useNavigate()

    return (
        <div className='w-full px-3 py-2 flex items-center justify-between hover:bg-gray-700/40 transition cursor-pointer rounded-lg'>
            
            {/* LEFT SECTION */}
            <div className='flex items-center gap-3 flex-1'>
                
                {/* PROFILE IMAGE */}
                <div
                    className='w-10 h-10 rounded-full overflow-hidden cursor-pointer'
                    onClick={() => navigate(`/profile/${noti.sender.userName}`)}
                >
                    <img
                        src={noti.sender.profileImage || dp}
                        alt="dp"
                        className='w-full h-full object-cover'
                    />
                </div>

                {/* TEXT */}
                <div className='flex flex-col text-sm text-gray-200 leading-tight'>
                    <span>
                        <span className='font-semibold'>
                            {noti.sender.userName}
                        </span>{" "}
                        {noti.message}
                    </span>

                    {/* Optional time (if you have it) */}
                    {noti.createdAt && (
                        <span className='text-xs text-gray-400 mt-[2px]'>
                            {new Date(noti.createdAt).toLocaleString()}
                        </span>
                    )}
                </div>
            </div>

            {/* RIGHT MEDIA PREVIEW */}
            <div className='w-11 h-11 ml-3 rounded-md overflow-hidden flex-shrink-0 border border-gray-700'>
                
                {noti.loop ? (
                    <video
                        src={noti.loop.media}
                        muted
                        loop
                        className='w-full h-full object-cover'
                    />
                ) : noti.post?.mediaType === "image" ? (
                    <img
                        src={noti.post.media}
                        alt="post"
                        onClick={() => navigate(`/post/${noti.post._id}`)}
                        className='w-full h-full object-cover cursor-pointer'
                    />
                ) : noti.post ? (
                    <video
                        src={noti.post.media}
                        muted
                        loop
                        className='w-full h-full object-cover'
                    />
                ) : null}
            </div>
        </div>
    )
}

export default NotificationCard