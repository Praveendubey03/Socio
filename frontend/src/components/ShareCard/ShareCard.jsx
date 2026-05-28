import { useDispatch, useSelector } from "react-redux"
import { closeShare } from "../../redux/shareSlice"
import dp from "../../assets/dp.png"
import axios from "axios"
import { serverUrl } from "../../App"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

import {
    FaWhatsapp,
    FaFacebook,
    FaFacebookMessenger,
    FaLink,
    FaEnvelope,
    FaThreads,
    FaXTwitter
} from "react-icons/fa6"

const ShareCard = () => {
    const dispatch = useDispatch()
    const { isOpen, post } = useSelector(state => state.share)

    const [users, setUsers] = useState([])
    const [input, setInput] = useState("")
    const [sending, setSending] = useState(null)
    const [sentUsers, setSentUsers] = useState([])
    const [toast, setToast] = useState("")
    const [copied, setCopied] = useState(false)

    // ✅ Dynamic link (POST vs LOOP)
    const postLink = post?.isLoop
        ? `${window.location.origin}/loop/${post._id}`
        : `${window.location.origin}/post/${post?._id}`

    // ✅ Fetch users (dynamic API)
    const fetchUsers = async () => {
        try {
            const url = post?.isLoop
                ? `${serverUrl}/api/loop/share-list`
                : `${serverUrl}/api/post/share-list`

            const res = await axios.get(url, {
                withCredentials: true
            })

            setUsers(res.data)
        } catch (err) {
            console.log(err)
        }
    }

    // ✅ Search
    const handleSearch = async (value) => {
        try {
            const res = await axios.get(
                `${serverUrl}/api/user/search?keyword=${value}`,
                { withCredentials: true }
            )
            setUsers(res.data)
        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {
        if (isOpen && post) fetchUsers()
    }, [isOpen, post])

    useEffect(() => {
        const delay = setTimeout(() => {
            if (!input.trim()) fetchUsers()
            else handleSearch(input)
        }, 400)

        return () => clearTimeout(delay)
    }, [input])

    // ✅ SEND FUNCTION (POST + LOOP)
    const handleSend = async (receiverId) => {
        try {
            if (!post?._id) return

            setSending(receiverId)

            let url = ""
            let payload = {}

            if (post.isLoop) {
                url = `${serverUrl}/api/loop/share`
                payload = { loopId: post._id, receiverId }
            } else {
                url = `${serverUrl}/api/post/share`
                payload = { postId: post._id, receiverId }
            }

            const res = await axios.post(
                url,
                payload,
                { withCredentials: true }
            )

            if (res.data.success) {
                setSentUsers(prev => [...prev, receiverId])

                setTimeout(() => {
                    setSentUsers(prev =>
                        prev.filter(id => id !== receiverId)
                    )
                }, 1000)
            }

        } catch (err) {
            console.log("❌ ERROR:", err.response?.data || err.message)
        } finally {
            setSending(null)
        }
    }

    // ✅ COPY LINK
    const copyLink = () => {
        navigator.clipboard.writeText(postLink)

        setCopied(true)
        setToast("Link copied to clipboard")

        setTimeout(() => setCopied(false), 800)
        setTimeout(() => setToast(""), 2000)
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]"
                onClick={() => dispatch(closeShare())}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >

                {/* MODAL */}
                <motion.div
                    onClick={(e) => e.stopPropagation()}
                    initial={{ scale: 0.85, opacity: 0, y: 40 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.85, opacity: 0, y: 40 }}
                    transition={{ duration: 0.25 }}
                    className="bg-[#1c1c1e] text-white w-full max-w-lg rounded-2xl p-5"
                >

                    {/* HEADER */}
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={() => dispatch(closeShare())}>✕</button>
                        <h2 className="font-semibold">Share</h2>
                        <div></div>
                    </div>

                    {/* SEARCH */}
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Search"
                        className="w-full bg-[#2c2c2e] p-2 rounded-lg mb-4 outline-none"
                    />

                    {/* USERS */}
                    <div className="flex gap-4 overflow-x-auto pb-3">

                        {users.map(user => {
                            const isSent = sentUsers.includes(user._id)
                            const isSending = sending === user._id

                            return (
                                <div key={user._id} className="flex flex-col items-center min-w-[70px]">

                                    <img
                                        src={user.profileImage || dp}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />

                                    <span className="text-xs mt-1 truncate w-16 text-center">
                                        {user.userName}
                                    </span>

                                    <motion.button
                                        onClick={() => handleSend(user._id)}
                                        disabled={isSending}
                                        whileTap={{ scale: 0.9 }}
                                        className={`relative overflow-hidden text-[10px] px-2 py-1 rounded mt-1 transition
                                            ${isSent ? "bg-green-500" : "bg-blue-500 hover:bg-blue-600"}
                                        `}
                                    >
                                        {isSending
                                            ? "Sending..."
                                            : isSent
                                            ? "Sent ✓"
                                            : "Send"}

                                        {isSent && (
                                            <motion.span
                                                initial={{ scale: 0, opacity: 0.5 }}
                                                animate={{ scale: 3, opacity: 0 }}
                                                transition={{ duration: 0.6 }}
                                                className="absolute inset-0 bg-white rounded-full"
                                            />
                                        )}
                                    </motion.button>

                                </div>
                            )
                        })}

                    </div>

                    {/* DIVIDER */}
                    <div className="border-t border-gray-700 my-4"></div>

                    {/* SOCIAL ICONS */}
                    <div className="flex justify-between text-center text-xs">

                        <motion.button
                            onClick={copyLink}
                            whileTap={{ scale: 0.9 }}
                            className="relative flex flex-col items-center"
                        >
                            <FaLink size={22} />
                            <p>Copy link</p>

                            {copied && (
                                <motion.span
                                    initial={{ scale: 0, opacity: 0.5 }}
                                    animate={{ scale: 2.5, opacity: 0 }}
                                    transition={{ duration: 0.6 }}
                                    className="absolute w-10 h-10 bg-white rounded-full"
                                />
                            )}
                        </motion.button>

                        <a href={`https://facebook.com/sharer/sharer.php?u=${postLink}`} target="_blank">
                            <FaFacebook size={22} />
                            <p>Facebook</p>
                        </a>

                        <a href={`https://m.me/?link=${postLink}`} target="_blank">
                            <FaFacebookMessenger size={22} />
                            <p>Messenger</p>
                        </a>

                        <a href={`https://wa.me/?text=${postLink}`} target="_blank">
                            <FaWhatsapp size={22} />
                            <p>WhatsApp</p>
                        </a>

                        <a href={`mailto:?body=${postLink}`}>
                            <FaEnvelope size={22} />
                            <p>Email</p>
                        </a>

                        <button>
                            <FaThreads size={22} />
                            <p>Threads</p>
                        </button>

                        <a href={`https://twitter.com/intent/tweet?url=${postLink}`} target="_blank">
                            <FaXTwitter size={22} />
                            <p>X</p>
                        </a>

                    </div>

                </motion.div>

                {/* TOAST */}
                <AnimatePresence>
                    {toast && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                                       bg-white text-black px-6 py-3 rounded-xl text-sm shadow-xl"
                        >
                            {toast}
                        </motion.div>
                    )}
                </AnimatePresence>

            </motion.div>
        </AnimatePresence>
    )
}

export default ShareCard