import React from 'react'
import LeftHome from '../../components/LeftHome/LeftHome'
import Feed from '../../components/Feed/Feed'
import RightHome from '../../components/RightHome/RightHome'

const Home = () => {
  return (
    <div className='w-full flex justify-center items-center'>
    <LeftHome/>
    <Feed/>
    <RightHome/>
    </div>
  )
}

export default Home
