import React, { useEffect, useRef, useState } from 'react'
import { MdVolumeUp, MdVolumeOff } from "react-icons/md";

const VideoPlayer = ({ media }) => {

    const videoTag = useRef(null)
    const [mute, setMute] = useState(false)
    const [isPlaying, setIsPlaying] = useState(true)

    const handleClick = () => {
        if (isPlaying) {
            videoTag.current.pause()
            setIsPlaying(false)
        } else {
            videoTag.current.play()
            setIsPlaying(true)
        }
    }

    const handleMute = () => {
        setMute(prev => !prev)
        videoTag.current.muted = !videoTag.current.muted
    }

    useEffect(() => {
        const video = videoTag.current
        if (!video) return
    
        const observer = new IntersectionObserver((entries) => {
          const entry = entries[0]
    
          if (entry.isIntersecting) {
            video.play().catch(() => {})
            setIsPlaying(true)
          } else {
            video.pause()
            setIsPlaying(false)
          }
        }, { threshold: 0.6 })
    
        observer.observe(video)
    
        return () => {
          observer.unobserve(video)
        }
      }, [])
    
    return (
        <div className='h-full relative cursor-pointer max-w-full rounded-2xl overflow-hidden'>

            <video
                ref={videoTag}
                src={media}
                autoPlay
                loop
                muted={mute}
                className='h-full w-full object-cover rounded-2xl'
                onClick={handleClick}
            />

            <div
                className='absolute bottom-[10px] right-[10px]'
                onClick={handleMute}
            >
                {!mute
                    ? <MdVolumeUp className='w-[20px] h-[20px] text-white' />
                    : <MdVolumeOff className='w-[20px] h-[20px] text-white' />
                }
            </div>

        </div>
    )
}

export default VideoPlayer