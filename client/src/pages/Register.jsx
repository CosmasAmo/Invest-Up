import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import useStore from '../store/useStore';
import { assets } from '../assets/assets';
import GoogleAuthButton from '../components/GoogleAuthButton';

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const referralCode = queryParams.get('ref');
  const { register, error, isLoading, isSubmitting } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    referralCode: referralCode || ''
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(formData);
    if (success) {
      navigate('/email-verify');
      toast.success('Account created! Please verify your email.');
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen
    px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
      <img 
        onClick={() => navigate('/')}
        src={assets.logo} alt="" className='absolute left-5
        sm:left-20 top-5 w-28 sm:w-32 cursor-pointer' />

      <div className='bg-slate-900 p-10 rounded-lg
      w-full sm:w-96 text-indigo-300 text-sm'>
        <h2 className='text-3xl font-semibold text-white
          text-center mb-3'>Create your Account</h2>

        {isLoading && isSubmitting ? (
          <div>Loading...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className='mb-4 flex items-center gap-3
              w-full px-5 py-2.5 bg-[#333A5C] rounded-full'>
              <img src={assets.person_icon} alt="" />
              <input 
                name="name"
                onChange={handleChange}
                value={formData.name}
                type="text" 
                placeholder='Username' 
                className='w-full bg-transparent focus:outline-none text-white'
                required 
              />
            </div>

            <div className='mb-4 flex items-center gap-3
              w-full px-5 py-2.5 bg-[#333A5C] rounded-full'>
              <input 
                name="referralCode"
                onChange={handleChange}
                value={formData.referralCode}
                type="text" 
                placeholder='Referral Code (Optional)' 
                className='w-full bg-transparent focus:outline-none text-white'
              />
            </div>

            <div className='mb-4 flex items-center gap-3
              w-full px-5 py-2.5 bg-[#333A5C] rounded-full'>
              <img src={assets.mail_icon} alt="" />
              <input 
                name="email"
                onChange={handleChange}
                value={formData.email}
                type="email" 
                placeholder='Email' 
                className='w-full bg-transparent focus:outline-none text-white'
                required 
              />
            </div>

            <div className='mb-4 flex items-center gap-3
              w-full px-5 py-2.5 bg-[#333A5C] rounded-full'>
              <img src={assets.lock_icon} alt="" />
              <input 
                name="password"
                onChange={handleChange}
                value={formData.password}
                type="password" 
                placeholder='Password' 
                className='w-full bg-transparent focus:outline-none text-white'
                required 
              />
            </div>

            <button className='w-full py-2.5 rounded-full 
            bg-gradient-to-r from-indigo-500 to-indigo-900 text-white font-medium'>Sign Up</button>
          </form>
        )}

        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900 text-gray-400">Or sign up with</span>
            </div>
          </div>
          <div className="mt-4">
            <GoogleAuthButton type="register" />
          </div>
        </div>

        <p className='text-gray-400 text-center text-sm mt-4'>
          Already have an account{' '}
          <span onClick={() => navigate('/login')} className='text-blue-400 cursor-pointer underline'>
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register; 