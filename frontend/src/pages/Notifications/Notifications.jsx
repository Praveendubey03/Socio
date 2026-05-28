import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft } from "react-icons/fa6";
import NotificationCard from '../../components/NotificationCard/NotificationCard';
import axios from 'axios';
import { serverUrl } from '../../App';
import { useEffect } from 'react';
import { setNotificationData } from '../../redux/userSlice';
const Notifications = () => {
    const { userData } = useSelector(state => state.user)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const {notificationData} = useSelector(state=>state.user)
    const ids = notificationData.map((n)=>n._id)
    const markAsRead = async () => {
        try {
            const result = await axios.post(`${serverUrl}/api/user/markAsRead`, {notificationId :ids}, {withCredentials:true})
            fetchNotifications()
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(()=>{

    markAsRead()
    },[])
    const fetchNotifications = async () => {
            try {
                const result = await axios.get(
                    `${serverUrl}/api/user/getAllNotifications`,
                    { withCredentials: true }
                )
                dispatch(setNotificationData(result.data))
            } catch (error) {
                console.log(error)
            }
        }

    return (
        <div className='w-full h-[100vh] bg-black'>
            <div className='w-full h-[80px] flex items-center gap-[20px] px-[20px] lg:hidden'>
                <FaArrowLeft onClick={() => navigate(`/`)} className='w-[25px] h-[25px] text-white cursor-pointer ' />
                <h1 className='text-white text-[20px] font-semibold'>Notifications</h1>
            </div>

            <div className='w-full flex flex-col px-[10px] gap-[20px] h-[100%] overflow-auto'>

                {notificationData?.map((noti, index)=>(
                    <NotificationCard noti={noti} key={index}/>
                ))}
            </div>
        </div>
    )
}

export default Notifications
