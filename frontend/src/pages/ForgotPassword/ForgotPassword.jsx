import axios from 'axios'
import React, { use, useState } from 'react'
import { ClipLoader } from 'react-spinners'
import { serverUrl } from '../../App'

const ForgotPassword = () => {

  const [step, setStep] = useState(1)
  const [inputClicked, setInputClicked] = useState({
    email: false,
    otp: false,
    newPassword: false,
    confirmNewPassword: false
  })
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)


  const handleStep1 = async () => {
    setLoading(true)
    setErr("")
    try {
      const result = await axios.post(`${serverUrl}/api/auth/sendOtp`, { email }, { withCredentials: true })
      console.log(result.data);
      setLoading(false)
      setStep(2)

    } catch (error) {
      setErr(error.response.data.message)
      console.log(error);
      setLoading(false)
    }
  }
  const handleStep2 = async () => {
    setErr()
    setLoading(true)
    try {
      const result = await axios.post(`${serverUrl}/api/auth/verifyOtp`, { email, otp }, { withCredentials: true })
      console.log(result.data);
      setLoading(false)
      setStep(3)

    } catch (error) {
      setErr(error.response.data.message)
      console.log(error);
      setLoading(false)
    }
  }
  const handleStep3 = async () => {

    if (newPassword !== confirmNewPassword) {
      return setErr("Password doesn't match");

    }
    setErr("")
    setLoading(true)
    try {


      const result = await axios.post(`${serverUrl}/api/auth/resetPassword`, { email, password: newPassword }, { withCredentials: true })
      console.log(result.data);
      setLoading(false)

    } catch (error) {
      setErr(error.response?.data?.message)
      console.log(error);
      setLoading(false)

    }
  }
  return (
    <div className='w-full h-screen bg-gradient-to-b from-black to-gray-800 
    flex flex-col justify-center items-center'>
      {/* step-1 */}
      {step == 1 && <div className='w-[90%] max-w-[500px] h-[500px] bg-white rounded-2xl flex justify-center items-center flex-col border-[#1a1f23'>
        <h2 className='text-[30px] font-semibold'>Forgot Password</h2>
        {/* email */}
        <div className='relative flex items-center justify-start w-[90%] h-[50px] 
              rounded-2xl border-2 mt-[30px] border-black '
          onClick={() => setInputClicked({ ...inputClicked, email: true })}>

          <label htmlFor="email" className={`text-gray-700 absolute left-[20px]
            p-[5px] bg-white text-[15px] ${inputClicked.email ?
              "top-[-15px]" : ""}`}  >Enter Your E-mail</label>
          <input type="email" id='email' className='w-[100%] h-[100%] rounded-2xl px-[20px]
              outline-none border-0 ' required onChange={(e) => setEmail(e.target.value)} value={email} />

        </div>
        {err && <p className='text-red-500'>{err}</p>}
        {/* send otp button*/}
        <button className='w-[70%] px-[20px] py-[10px] bg-gradient-to-b from-blue-600 to-blue-800 text-white font-semibold h-[50px] cursor-pointer rounded-2xl mt-[30px] ' disabled={loading} onClick={handleStep1} >{loading ? <ClipLoader size={30} color='white' /> : "Send OTP"}</button>


      </div>}

      {step == 2 && <div className='w-[90%] max-w-[500px] h-[500px] bg-white rounded-2xl flex justify-center items-center flex-col border-[#1a1f23'>
        <h2 className='text-[30px] font-semibold'>Forgot Password</h2>
        {/* otp */}
        <div className='relative flex items-center justify-start w-[90%] h-[50px] 
              rounded-2xl border-2 mt-[30px] border-black '
          onClick={() => setInputClicked({ ...inputClicked, otp: true })}>

          <label htmlFor="otp" className={`text-gray-700 absolute left-[20px]
            p-[5px] bg-white text-[15px] ${inputClicked.otp ?
              "top-[-15px]" : ""}`}  >Enter OTP </label>
          <input type="text" id='otp' className='w-[100%] h-[100%] rounded-2xl px-[20px]
              outline-none border-0 ' required onChange={(e) => setOtp(e.target.value)} value={otp} />

        </div>
        {err && <p className='text-red-500'>{err}</p>}
        {/* submit otp button*/}
        <button className='w-[70%] px-[20px] py-[10px] bg-gradient-to-b from-blue-600 to-blue-800 text-white font-semibold h-[50px] cursor-pointer rounded-2xl mt-[30px] ' disabled={loading} onClick={handleStep2} >{loading ? <ClipLoader size={30} color='white' /> : "Submit"}</button>


      </div>}

      {step == 3 && <div className='w-[90%] max-w-[500px] h-[500px] bg-white rounded-2xl flex justify-center items-center flex-col border-[#1a1f23'>
        <h2 className='text-[30px] font-semibold'>Reset Password</h2>

        {/* new password*/}
        <div className='relative flex items-center justify-start w-[90%] h-[50px] 
              rounded-2xl border-2 mt-[30px] border-black '
          onClick={() => setInputClicked({ ...inputClicked, newPassword: true })}>

          <label htmlFor="newPasssword" className={`text-gray-700 absolute left-[20px]
            p-[5px] bg-white text-[15px] ${inputClicked.newPassword ?
              "top-[-15px]" : ""}`}  >Enter New Password </label>
          <input type="password" id='newPassword' className='w-[100%] h-[100%] rounded-2xl px-[20px]
              outline-none border-0 ' required onChange={(e) => setNewPassword(e.target.value)} value={newPassword} />


        </div>
        {/* confirm new password */}
        <div className='relative flex items-center justify-start w-[90%] h-[50px] 
              rounded-2xl border-2 mt-[30px] border-black '
          onClick={() => setInputClicked({ ...inputClicked, confirmNewPassword: true })}>

          <label htmlFor="confirmNewPassword" className={`text-gray-700 absolute left-[20px]
            p-[5px] bg-white text-[15px] ${inputClicked.confirmNewPassword ?
              "top-[-15px]" : ""}`}  >Confirm New Password </label>
          <input type="password" id='confirmNewPassword' className='w-[100%] h-[100%] rounded-2xl px-[20px]
              outline-none border-0 ' required onChange={(e) => setConfirmNewPassword(e.target.value)} value={confirmNewPassword} />


        </div>
        {err && <p className='text-red-500'>{err}</p>}
        {/* submit new password*/}
        <button className='w-[70%] px-[20px] py-[10px] bg-gradient-to-b from-blue-600 to-blue-800 text-white font-semibold h-[50px] cursor-pointer rounded-2xl mt-[30px] ' disabled={loading} onClick={handleStep3}>{loading ? <ClipLoader size={30} color='white' /> : "Reset Password"}</button>


      </div>}

    </div>
  )
}

export default ForgotPassword
