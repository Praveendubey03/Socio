import React, { useEffect, useState } from 'react'
import { FaArrowLeft } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import { FiSearch } from "react-icons/fi";
import axios from 'axios';
import { serverUrl } from '../../App';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchData } from '../../redux/userSlice';

const Search = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [input, setInput] = useState("")

    const { searchData } = useSelector(state => state.user)

    // ✅ FIXED: clean API call (no preventDefault)
    const handleSearch = async () => {
        try {
            const result = await axios.get(
                `${serverUrl}/api/user/search?keyword=${input}`,
                { withCredentials: true }
            )
            dispatch(setSearchData(result.data))
        } catch (error) {
            console.log(error)
        }
    }

    // ✅ FIXED: debounce + empty check
    useEffect(() => {
        if (!input.trim()) {
            dispatch(setSearchData([])) // clear results
            return
        }

        const delay = setTimeout(() => {
            handleSearch()
        }, 400)

        return () => clearTimeout(delay)
    }, [input])

    return (
        <div className='w-full min-h-[100vh] bg-black flex items-center flex-col gap-[20px] pt-[10px]'>

            {/* ✅ FIXED: prevent overlap */}
            <div className='w-full h-[70px] flex items-center gap-3 px-3 border-b border-gray-800'>

                {/* Back Button */}
                <FaArrowLeft
                    onClick={() => navigate(`/`)}
                    className='w-[22px] h-[22px] text-white cursor-pointer flex-shrink-0'
                />

                {/* Search Bar */}
                <form
                    onSubmit={(e) => e.preventDefault()}
                    className='flex-1 h-[45px] rounded-full bg-[#0f1414] flex items-center px-4'
                >
                    <FiSearch className='text-gray-400 w-[18px] h-[18px]' />

                    <input
                        type="text"
                        placeholder='Search'
                        className='w-full h-full outline-none bg-transparent px-3 text-white text-[15px]'
                        onChange={(e) => setInput(e.target.value)}
                        value={input}
                    />
                </form>
            </div>

            {/* Results */}

            <div className='w-full flex flex-col items-center mt-2'>
                {searchData?.length > 0 ? (
                    searchData.map((user) => (
                        <div
                            key={user._id}
                            onClick={() => navigate(`/profile/${user.userName}`)}
                            className='w-full max-w-[600px] flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-[#121212] transition-all'
                        >
                            {/* Profile Image */}
                            <div className='w-[45px] h-[45px] rounded-full overflow-hidden'>
                                <img
                                    src={user.profileImage}
                                    alt=""
                                    className='w-full h-full object-cover'
                                />
                            </div>

                            {/* User Info */}
                            <div className='flex flex-col'>
                                <span className='text-white font-semibold text-[15px]'>
                                    {user.userName}
                                </span>
                                <span className='text-gray-400 text-[13px]'>
                                    {user.name}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    input && (
                        <p className='text-gray-400 mt-4'>No users found</p>
                    )
                )}
            </div>
        </div>
    )
}

export default Search