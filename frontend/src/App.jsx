import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";

// 🔹 PAGES
import SignUp from "./pages/SignUp/SignUp";
import SignIn from "./pages/SignIn/SignIn";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import EditProfile from "./pages/EditProfile/EditProfile";
import Upload from "./pages/Upload/Upload";
import Loops from "./pages/Loops/Loops";
import Story from "./pages/Story/Story";
import MessageArea from "./pages/MessageArea/MessageArea";
import Search from "./pages/Search/Search";
import Notifications from "./pages/Notifications/Notifications";
import PostView from "./pages/PostView/PostView";

// 🔹 COMPONENTS
import ShareCard from "./components/ShareCard/ShareCard";


// 🔹 HOOKS
import getCurrentUser from "./hooks/getCurrentUser";
import getsuggestedUsers from "./hooks/getSuggestedUsers";
import getAllPost from "./hooks/getAllPost";
import getAllLoops from "./hooks/getAllLoops";
import { useGetFeedStories } from "./hooks/useStory";
import useFollowingList from "./hooks/getFollowingList";
import getAllNotifications from "./hooks/getAllNotifications";

// 🔥 IMPORTANT
import useSocket from "./hooks/useSocket";



export const serverUrl = "http://localhost:8000";

const App = () => {
  // 🔹 INITIAL DATA HOOKS
  getCurrentUser();
  getsuggestedUsers();
  getAllPost();
  getAllLoops();
  useGetFeedStories();
  useFollowingList();
  getAllNotifications();

  // 🔥 SOCKET (ONLY HERE)
  useSocket();

  const { userData } = useSelector((state) => state.user);

  return (
    <>

      <Routes>
        <Route path="/signup" element={!userData ? <SignUp /> : <Navigate to="/" />} />
        <Route path="/signin" element={!userData ? <SignIn /> : <Navigate to="/" />} />
        <Route path="/" element={userData ? <Home /> : <Navigate to="/signin" />} />
        <Route path="/forgot-password" element={!userData ? <ForgotPassword /> : <Navigate to="/" />} />

        <Route path="/profile/:userName" element={userData ? <Profile /> : <Navigate to="/signin" />} />
        <Route path="/story/:userName" element={userData ? <Story /> : <Navigate to="/signin" />} />

        <Route path="/upload" element={userData ? <Upload /> : <Navigate to="/signin" />} />
        <Route path="/post/:postId" element={userData ? <PostView /> : <Navigate to="/signin" />} />
        <Route path="/search" element={userData ? <Search /> : <Navigate to="/signin" />} />
        <Route path="/notifications" element={userData ? <Notifications /> : <Navigate to="/signin" />} />
        <Route path="/editprofile" element={userData ? <EditProfile /> : <Navigate to="/signin" />} />

        <Route path="/messages" element={userData ? <MessageArea /> : <Navigate to="/signin" />} />
        <Route path="/loops" element={userData ? <Loops /> : <Navigate to="/signin" />} />

      </Routes>

      <ShareCard />
    </>
  );
};

export default App;