import React, { useEffect, useRef, useState } from 'react'
import { MdVolumeUp, MdVolumeOff } from "react-icons/md";
import dp from '../../assets/dp.png'
import FollowButton from '../FollowButton/FollowButton';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import { MdOutlineComment } from "react-icons/md";
import axios from 'axios';
import { serverUrl } from '../../App';
import { setLoopData } from '../../redux/loopSlice';
import { setUserData } from '../../redux/userSlice';
import { openShare } from '../../redux/shareSlice' // ✅ ONLY ADDITION

function LoopCard({ loop }) {

  const videoRef = useRef(null)
  const progressRef = useRef(null)
  const commentRef = useRef()

  const { userData } = useSelector(state => state.user)
  const { socket } = useSelector(state => state.socket)
  const { loopData } = useSelector(state => state.loop)

  const [isPlaying, setIsPlaying] = useState(true)
  const [isMute, setIsMute] = useState(false)
  const [showHeart, setShowHeart] = useState(false)
  const [showComment, setShowComment] = useState(false)
  const [message, setMessage] = useState("")

  const navigate = useNavigate()
  const dispatch = useDispatch()

  // ❤️ LIKE
  const handleLike = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/loop/like/${loop._id}`,
        { withCredentials: true }
      )

      const updatedLoop = result.data

      const updatedLoops = loopData.map(p =>
        p._id === loop._id ? updatedLoop : p
      )

      dispatch(setLoopData(updatedLoops))

    } catch (error) {
      console.log(error)
    }
  }

  // 💬 COMMENT
  const handleComment = async () => {
    if (!message.trim()) return

    try {
      const result = await axios.post(
        `${serverUrl}/api/loop/comment/${loop._id}`,
        { message },
        { withCredentials: true }
      )

      const updatedLoop = result.data

      const updatedLoops = loopData.map(p =>
        p._id === loop._id ? updatedLoop : p
      )

      dispatch(setLoopData(updatedLoops))

      setMessage("") // ✅ FIX

    } catch (error) {
      console.log(error)
    }
  }

  // 🔥 SHARE (ONLY NEW FEATURE)
  const handleShare = () => {
    dispatch(openShare({ ...loop, isLoop: true }))
  }

  // ✅ COMMENT OUTSIDE CLICK FIX (IMPORTANT)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (commentRef.current && !commentRef.current.contains(e.target)) {
        setShowComment(false)
      }
    }

    if (showComment) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showComment])

  // VIDEO PROGRESS
  useEffect(() => {
    const video = videoRef.current
    let frameId

    const update = () => {
      if (video && video.duration && progressRef.current) {
        const percent = (video.currentTime / video.duration) * 100
        if (!video.paused) {
          progressRef.current.style.width = `${percent}%`
        }
      }
      frameId = requestAnimationFrame(update)
    }

    update()
    return () => cancelAnimationFrame(frameId)
  }, [])

  // PLAY / PAUSE
  const handleClick = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
      setIsPlaying(false)
    } else {
      video.play().catch(() => { })
      setIsPlaying(true)
    }
  }

  // DOUBLE CLICK LIKE
  const handleLikeOnDoubleClick = () => {
    setShowHeart(true)
    setTimeout(() => setShowHeart(false), 600)

    if (!loop.likes.includes(userData._id)) {
      handleLike()
    }
  }

  // AUTO PLAY
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0]

      if (entry.isIntersecting) {
        video.play().catch(() => { })
        setIsPlaying(true)
      } else {
        video.pause()
        setIsPlaying(false)
      }
    }, { threshold: 0.6 })

    observer.observe(video)

    return () => observer.disconnect()
  }, [])

  return (
    <div className='w-full lg:w-[480px] h-[100vh] flex items-center justify-center border-l-2 border-r-2 border-gray-800 relative overflow-hidden'>

      {/* ❤️ HEART */}
      {showHeart && (
        <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50'>
          <FaHeart className='w-[100px] h-[100px] text-white' />
        </div>
      )}

      {/* COMMENT SECTION (UNCHANGED, FIXED) */}
      <div
        ref={commentRef}
        className={`absolute z-[200] bottom-0 w-full h-[500px] p-[10px] rounded-t-4xl bg-[#0e1718] transition-all duration-300
        ${showComment ? "translate-y-0" : "translate-y-full"}`}
      >
        <h1 className='text-white text-[20px] text-center font-semibold'>Comments</h1>

        <div className='h-[350px] overflow-y-auto'>
          {loop.comments.length === 0 && (
            <div className='text-center text-white mt-10'>No Comments Yet</div>
          )}

          {loop.comments.map((com, index) => (
            <div key={index} className='flex gap-3 mt-3'>
              <img src={com.author?.profileImage || dp} className='w-8 h-8 rounded-full' />
              <div>
                <div className='text-white font-semibold'>{com.author?.userName}</div>
                <div className='text-gray-300 text-sm'>{com.message}</div>
              </div>
            </div>
          ))}
        </div>

        <div className='flex items-center gap-2 mt-3'>
          <input
            type="text"
            placeholder="write comment"
            className='flex-1 bg-transparent border-b text-white outline-none'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {message && (
            <IoSend className='text-white cursor-pointer' onClick={handleComment} />
          )}
        </div>
      </div>

      {/* VIDEO */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted={isMute}
        playsInline
        src={loop?.media}
        className='w-full max-h-[100vh] object-cover'
        onClick={handleClick}
        onDoubleClick={handleLikeOnDoubleClick}
      />
      {/* PROGRESS BAR */}
      <div className='absolute bottom-0 left-0 w-full h-[3px] bg-gray-800'>
        <div
          ref={progressRef}
          className='h-full bg-gradient-to-r from-white to-gray-300 transition-all duration-100'
          style={{ width: "0%" }}
        />
      </div>
      {/* SOUND */}
      <div
        className='absolute top-5 right-5 cursor-pointer z-[100]'
        onClick={() => {
          const video = videoRef.current
          if (!video) return

          video.muted = !video.muted // ✅ directly control video
          setIsMute(video.muted)     // sync state
        }}
      >
        {isMute
          ? <MdVolumeOff className='text-white text-[22px]' />
          : <MdVolumeUp className='text-white text-[22px]' />
        }
      </div>

      {/* ACTIONS */}
      <div className='absolute right-0 flex flex-col gap-6 text-white bottom-[200px] px-3 items-center'>

        {/* LIKE */}
        <div className='flex flex-col items-center gap-1' onClick={handleLike}>
          {loop.likes.includes(userData._id)
            ? <FaHeart className='text-red-500 cursor-pointer text-[30px]' />
            : <FaRegHeart className='cursor-pointer text-[30px]' />}
          <div className='text-sm'>{loop.likes.length}</div>
        </div>

        {/* COMMENT */}
        <div className='flex flex-col items-center gap-1 cursor-pointer' onClick={() => setShowComment(true)}>
          <MdOutlineComment className='text-[30px]' />
          <div className='text-sm'>{loop.comments.length}</div>
        </div>

        {/* SHARE */}
        <div className='flex flex-col items-center gap-1 cursor-pointer' onClick={handleShare}>
          <IoSend className='text-[30px] rotate-[-30deg]' />
        </div>

      </div>

      {/* PROFILE (FIXED ALIGNMENT) */}
      <div className='absolute bottom-0 left-0 w-full p-3 
                bg-gradient-to-t from-black via-gray-950 to-transparent text-white'>

        <div className='flex items-center gap-2' >
          <img
            src={loop.author?.profileImage || dp}
            className='w-8 h-8 rounded-full'
            onClick={()=>navigate(`/profile/${loop.author.userName}`)}
          />

          <span className='font-semibold'>
            {loop.author.userName}
          </span>

          {loop.author._id?.toString() !== userData._id?.toString() && (
            <FollowButton targetUserId={loop.author._id} />
          )}
        </div>

        <div className='mt-1 text-sm'>
          {loop.caption}
        </div>

      </div>

    </div>
  )
}

export default LoopCard