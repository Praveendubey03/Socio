import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { FaArrowLeft } from "react-icons/fa6";
import { serverUrl } from '../../App'
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setProfileData, setUserData } from '../../redux/userSlice'
import dp from "../../assets/dp.png"
import Nav from '../../components/Nav/Nav';
import FollowButton from '../../components/FollowButton/FollowButton';
import { setSelectedUser } from '../../redux/messageSlice';
import FollowerList from '../../components/FollowerList/FollowerList';
import { useGetUserStories, usePrefetchStories } from '../../hooks/useStory';
import StoryDp from '../../components/StoryDp/StoryDp';

const Profile = () => {
  const { userName } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [postType, setPostType] = useState("posts")
  const [openList, setOpenList] = useState(false)
  const [listType, setListType] = useState("")

  const { profileData, userData } = useSelector(state => state.user)
  const { postData } = useSelector(state => state.post)
  const { userStories } = useSelector(state => state.story)
  const prefetchStories = usePrefetchStories();

  // ================= API CALLS =================
  const handleProfile = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/user/getProfile/${userName}`,
        { withCredentials: true }
      )
      dispatch(setProfileData(result.data))
    } catch (error) {
      console.log(error)
    }
  }


  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, {
        withCredentials: true
      })
      dispatch(setUserData(null))
      navigate("/login")
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    handleProfile()

  }, [userName])
  useGetUserStories(userName)
  // ================= POSTS =================
  const userPosts = postData?.filter(
    p => p.author?._id === profileData?._id
  )


  // ================= UI =================
  return (
    <div className='w-full min-h-screen bg-black text-white flex justify-center'>
      <div className='w-full max-w-[900px]'>

        {/* HEADER */}
        <div className='flex items-center justify-between px-4 py-4 border-b border-gray-800'>
          <FaArrowLeft onClick={() => navigate("/")} className='cursor-pointer' />
          <div className='font-semibold text-lg'>{profileData?.userName}</div>

          {profileData?._id === userData?._id && (
            <div className='text-blue-500 cursor-pointer' onClick={handleLogOut}>
              Logout
            </div>
          )}
        </div>

        {/* TOP SECTION */}
        <div className='flex flex-col md:flex-row md:items-center md:gap-16 px-6 py-8'>

          {/* PROFILE IMAGE WITH STORY RING */}
          <div className='flex justify-center md:justify-start'>
            <StoryDp
              profileImage={profileData?.profileImage}
              userName={profileData?.userName}
              stories={userStories}
              isOwn={profileData?._id === userData?._id}

              onClickCustom={async () => {
                // 🔥 prefetch before open
                await prefetchStories(profileData?.userName);

                if (userStories?.length > 0 || profileData?._id === userData?._id) {
                  navigate(`/story/${profileData?.userName}`);
                }
              }}
            />
          </div>
          {/* RIGHT SIDE */}
          <div className='flex-1 flex flex-col gap-4 mt-4 md:mt-0'>

            <div className='flex items-center gap-4 flex-wrap'>
              <h1 className='text-xl font-semibold'>
                {profileData?.userName}
              </h1>

              {profileData?._id === userData?._id ? (
                <button
                  onClick={() => navigate("/editprofile")}
                  className='bg-gray-800 px-4 py-1 rounded-lg text-sm'
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <FollowButton
                    tailwind='bg-blue-500 px-4 py-1 rounded-lg text-sm'
                    targetUserId={profileData?._id}
                    onFollowChange={handleProfile}
                  />

                  <button
                    className='bg-gray-800 px-4 py-1 rounded-lg text-sm'
                    onClick={() => {
                      dispatch(setSelectedUser(profileData))
                      navigate("/messages")
                    }}
                  >
                    Message
                  </button>
                </>
              )}
            </div>

            {/* STATS */}
            <div className="flex gap-6 text-sm">
              <span
                className="cursor-pointer"
                onClick={() => {
                  setListType("followers")
                  setOpenList(true)
                }}
              >
                <b>{profileData?.followers?.length || 0}</b> followers
              </span>

              <span
                className="cursor-pointer"
                onClick={() => {
                  setListType("following")
                  setOpenList(true)
                }}
              >
                <b>{profileData?.following?.length || 0}</b> following
              </span>
            </div>

            {/* BIO */}
            <div className='text-sm'>
              <div className='font-semibold'>{profileData?.name}</div>
              <div className='text-gray-400'>{profileData?.profession}</div>
              <div>{profileData?.bio}</div>
            </div>
          </div>
        </div>

        {/* TABS */}
        {profileData?._id === userData?._id && (
          <div className='flex justify-center border-t border-gray-800'>
            <div
              className={`px-6 py-3 cursor-pointer ${postType === "posts" && "border-t-2 border-white"
                }`}
              onClick={() => setPostType("posts")}
            >
              Posts
            </div>

            <div
              className={`px-6 py-3 cursor-pointer ${postType === "saved" && "border-t-2 border-white"
                }`}
              onClick={() => setPostType("saved")}
            >
              Saved
            </div>
          </div>
        )}

        {/* GRID */}
        <div className='grid grid-cols-3 gap-[2px]'>
          {(profileData?._id === userData?._id
            ? postType === "posts"
              ? userPosts
              : userData?.saved
            : userPosts
          )?.map(post => (
            <img
              key={post._id}
              src={post.media}
              onClick={() => navigate(`/post/${post._id}`)}
              className='w-full h-[120px] md:h-[250px] object-cover'
              alt="post"
            />
          ))}
        </div>
      </div>

      {/* FOLLOWER LIST MODAL */}
      {openList && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
          <div className="bg-black w-[400px] p-4 rounded-lg border border-gray-700">
            <FollowerList
              type={listType}
              userId={profileData?._id}
              onClose={() => setOpenList(false)}
            />
          </div>
        </div>
      )}

      <Nav />
    </div>
  )
}

export default Profile