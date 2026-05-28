import React from "react";
import { FaRegHeart } from "react-icons/fa";
import { RiTelegram2Line } from "react-icons/ri";
import logo from "../../assets/logo.png";
import StoryDp from "../StoryDp/StoryDp";
import Nav from "../Nav/Nav";
import { useSelector } from "react-redux";
import Post from "../Post/Post";
import { useNavigate } from "react-router-dom";
import { useGetFeedStories } from "../../hooks/useStory";

const Feed = () => {
  useGetFeedStories(); // ✅ fetch stories

  const { postData } = useSelector((state) => state.post);
  const { userData, notificationData } = useSelector((state) => state.user);
  const { feedStories } = useSelector((state) => state.story);

  const navigate = useNavigate();

  const notifications = Array.isArray(notificationData)
    ? notificationData
    : [];

  return (
    <div className="lg:w-[50%] w-full bg-black min-h-[100vh] lg:h-[100vh] relative lg:overflow-y-auto">
      
      {/* TOP BAR */}
      <div className="w-full h-[100px] flex items-center justify-between p-[20px] lg:hidden">
        <img src={logo} alt="logo" className="w-[80px]" />

        <div className="flex items-center gap-[20px]">
          <div className="relative">
            <FaRegHeart
              className="text-white w-[25px] h-[25px] cursor-pointer"
              onClick={() => navigate("/notifications")}
            />

            {notifications.some((noti) => !noti?.isRead) && (
              <div className="w-[10px] h-[10px] bg-red-500 border border-gray-400 rounded-full absolute top-0 right-[-5px]" />
            )}
          </div>

          <RiTelegram2Line
            className="text-white w-[30px] h-[30px] cursor-pointer"
            onClick={() => navigate("/messages")}
          />
        </div>
      </div>

      {/* STORIES */}
      <div className="flex w-full overflow-x-auto gap-[10px] p-[20px] items-center">
        
        {/* YOUR STORY */}
        <StoryDp
          userName="Your Story"
          profileImage={userData?.profileImage} // ✅ FIXED
          stories={[]} 
          isOwn={true}
        />

        {/* FEED STORIES */}
        {Array.isArray(feedStories) &&
          feedStories.map((item) => (
            <StoryDp
              key={item?.user?._id}
              userName={item?.user?.userName}
              profileImage={item?.user?.profileImage} // ✅ FIXED
              stories={item?.stories || []}
            />
          ))}
      </div>

      {/* POSTS */}
      <div className="w-full min-h-[100vh] flex flex-col items-center gap-[20px] p-[10px] pt-[40px] bg-black rounded-t-[60px] relative pb-[120px]">
        
        <Nav />

        {Array.isArray(postData) && postData.length > 0 ? (
          postData.map((post) => (
            <Post post={post} key={post._id} />
          ))
        ) : (
          <div className="text-gray-400 mt-10">No posts</div>
        )}
      </div>
    </div>
  );
};

export default Feed;