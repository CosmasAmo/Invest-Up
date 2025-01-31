import React, { useState, useRef } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import useStore  from '../store/useStore'

function ResetPassword() {

  axios.defaults.withCredentials = true;

  const navigate = useNavigate()
  const { sendResetOtp, resetPassword } = useStore();

  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const[isEmailSent, setIsEmailSent] = useState(false)
  const[otp, setOtp] = useState('')
  const[isOtpSubmitted, setIsOtpSubmitted] = useState(false)

  const inputRefs = useRef([])

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length-1) {
      inputRefs.current[index+1].focus()
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRefs.current[index-1].focus()
    }
  }

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text')
    const pasteArray = paste.split('')
    pasteArray.forEach((char, index) => {
      if(inputRefs.current[index]) {
        inputRefs.current[index].value = char
      }
    })
  }

  const onSubmitEmail = async (e) => {
    e.preventDefault()
    const success = await sendResetOtp(email)
    if (success) {
      setIsEmailSent(true)
    }
  }

  const onSubmitOtp = async (e) => {
    e.preventDefault()

    const otpArray = inputRefs.current.map(e => e.value)
    setOtp(otpArray.join(''))
    setIsOtpSubmitted(true)
  }

  const onSubmitNewPassword = async (e) => {
    e.preventDefault()
    const success = await resetPassword(email, newPassword, otp)
    if (success) {
      navigate('/login')
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen
      bg-gradient-to-br from-blue-200 to-purple-400'>
        <img 
          onClick={() => navigate('/')}
          src={assets.logo} alt="" className='absolute left-5
          sm:left-20 top-5 w-28 sm:w-32 cursor-pointer' />

        {/* Enter email form */}
        {!isEmailSent &&

          <form onSubmit={onSubmitEmail}
            className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
            <h1 className='text-center text-2xl text-white mb-6'>Reset password</h1>
            
            <p className='text-center mb-6 text-indigo-300'>Enter your registered email address</p>

            <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5
              bg-[#333A5C] rounded-full'>
              <img src={assets.mail_icon} alt="" className='w-3 h-3' />
              <input type="email" placeholder='Email' 
                className='bg-transparent outline-none text-white'
                value={email} onChange={e => setEmail(e.target.value)} required/>
            </div>

            <button type='submit' className='w-full bg-gradient-to-r from-indigo-500 to-indigo-900
              text-white p-2 rounded-full'>Submit</button>

          </form>
        }

        {/* password reset otp form */}
        {!isOtpSubmitted && isEmailSent &&

          <form onSubmit={onSubmitOtp}
            className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
            <h1 className='text-center text-2xl text-white mb-6'>Password reset OTP</h1>
            
            <p className='text-center mb-6 text-indigo-300'>Enter the 6-digit code sent to your email.</p>

            <div onPaste={handlePaste} className='flex justify-between mb-8'>
              {Array(6).fill(0).map((_, index) => (

                <input type="text" maxLength='1' key={index} required 
                  className='w-12 h-12 text-center bg-slate-800 text-white 
                  border-2 border-indigo-300 rounded-lg text-xl' 
                  ref={e=>inputRefs.current[index] = e}
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  
                />
              ))}
            </div>
          
            <button type='submit' className='w-full bg-gradient-to-r from-indigo-500 to-indigo-900
              text-white p-2 rounded-full'>Reset password</button>
          </form>
        }

        {/*Enter new password form*/}
        {isOtpSubmitted && isEmailSent && 

          <form onSubmit={onSubmitNewPassword}
            className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
            <h1 className='text-center text-2xl text-white mb-6'>Reset password</h1>
            
            <p className='text-center mb-6 text-indigo-300'>Enter new password</p>

            <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5
              bg-[#333A5C] rounded-full'>
              <img src={assets.lock_icon} alt="" className='w-3 h-3' />
              <input type="password" placeholder='newPassword' 
                className='bg-transparent outline-none text-white'
                value={newPassword} onChange={e => setNewPassword(e.target.value)} required/>
            </div>

            <button type='submit' className='w-full bg-gradient-to-r from-indigo-500 to-indigo-900
              text-white p-2 rounded-full'>Submit</button>

          </form>
        }
      
    </div>
  )
}

export default ResetPassword