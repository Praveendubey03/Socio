import React from 'react'

import ChatList from '../ChatList/ChatList'

const RightHome = () => {
  return (

    <div className='w-[25%] h-[100vh] bg-black border-l border-gray-900 hidden lg:block overflow-auto'>

      <ChatList showBack={false} />
    </div>
  )
}

export default RightHome