import React, { useRef } from 'react'
import { assets } from '../assets/assets'
import {useNavigate} from 'react-router-dom'
import useStore from '../store/useStore'

function EmailVerify() {

  const navigate = useNavigate()
  const { verifyEmail } = useStore()
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

  const handleSubmit = async(e) => {
    e.preventDefault()
    const otpArray = inputRefs.current.map(input => input.value)
    const otp = otpArray.join('')

    const success = await verifyEmail(otp)
    if (success) {
      navigate('/dashboard')
    }
  }

  return (
    <div className='flex items-center justify-center min-h-screen
      bg-gradient-to-br from-blue-200 to-purple-400'>
        <img 
          onClick={() => navigate('/')}
          src={assets.logo} alt="" className='absolute left-5
          sm:left-20 top-5 w-28 sm:w-32 cursor-pointer' />
        
        <form onSubmit={handleSubmit}
          className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
          <h1 className='text-center text-2xl text-white mb-6'>Email Verification Otp</h1>
          
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
            text-white p-2 rounded-full'>Verify Email</button>
        </form>
    </div>
  )
}

export default EmailVerify