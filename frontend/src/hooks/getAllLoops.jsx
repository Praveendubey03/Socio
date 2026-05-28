import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setUserData } from '../redux/userSlice'
import { setLoopData } from '../redux/loopSlice'



const getAllLoops = () => {
  const dispatch = useDispatch()
  const {userData} = useSelector(state=>state.user)
 
  useEffect(()=>{
    const fetchLoops = async () => {
      try {
        const result = await axios.get(`${serverUrl}/api/loop/getAll`, {withCredentials:true})
        dispatch(setLoopData(result.data))
      } catch (error) {
        console.log(error)
      }
    }
    fetchLoops()
  },[dispatch, userData])
}

export default getAllLoops
