import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import useStore from '../store/useStore';
import axios from 'axios';
import { FaUsers, FaUserCheck, FaMoneyBillWave, FaLink, FaCopy } from 'react-icons/fa';
import { motion } from 'framer-motion';

function ReferralLink() {
  const { userData } = useStore();
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState({
    referralBonus: 0,
    referralsRequired: 2
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const referralInputRef = useRef(null);
  
  // Calculate progress to next bonus
  const successfulReferrals = userData?.successfulReferrals || 0;
  
  // Calculate progress percentage
  const progressPercentage = successfulReferrals % settings.referralsRequired === 0 && successfulReferrals > 0
    ? 100
    : (successfulReferrals % settings.referralsRequired) / settings.referralsRequired * 100;

  useEffect(() => {
    // Fetch settings from the server
    const fetchSettings = async () => {
      try {
        setIsLoadingSettings(true);
        const response = await axios.get('/api/settings', { withCredentials: true });
        if (response.data.success) {
          setSettings({
            referralBonus: response.data.settings.referralBonus,
            referralsRequired: response.data.settings.referralsRequired
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        // If there's an error, we'll use the default values
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchSettings();
  }, []);

  const handleCopy = () => {
    const referralCode = userData?.referralCode || '';
    
    // Try using the Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(referralCode)
        .then(() => {
          setCopied(true);
          toast.success('Referral code copied!');
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
    
    // Fallback method for mobile devices
    function fallbackCopy() {
      try {
        // Focus and select the input
        if (referralInputRef.current) {
          referralInputRef.current.select();
          referralInputRef.current.setSelectionRange(0, 99999); // For mobile devices
          
          // Try execCommand for older browsers
          const successful = document.execCommand('copy');
          
          if (successful) {
            setCopied(true);
            toast.success('Referral code copied!');
            setTimeout(() => setCopied(false), 2000);
          } else {
            toast.info('Please tap and hold to copy the code manually');
          }
        } else {
          toast.info('Please tap and hold to copy the code manually');
        }
      } catch {
        toast.info('Please tap and hold to copy the code manually');
      }
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-800 to-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white mb-2 md:mb-0 flex items-center">
          <FaUsers className="mr-2 text-blue-400" />
          Refer &amp; Earn Program
        </h2>
        <div className="bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/30 flex items-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
          <span className="text-blue-400 text-sm font-medium">
            {isLoadingSettings ? "Loading..." : `$${settings.referralBonus} per ${settings.referralsRequired} referrals`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div 
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-5 rounded-lg border border-blue-500/30 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-300 font-medium">Total Referrals</h3>
            <FaUsers className="text-blue-400 w-5 h-5" />
          </div>
          <p className="text-2xl text-white font-bold">{userData?.referralCount || 0}</p>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-gradient-to-br from-green-500/20 to-green-600/20 p-5 rounded-lg border border-green-500/30 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-300 font-medium">Successful Referrals</h3>
            <FaUserCheck className="text-green-400 w-5 h-5" />
          </div>
          <p className="text-2xl text-white font-bold">{successfulReferrals}</p>
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{successfulReferrals % settings.referralsRequired}/{settings.referralsRequired} for next bonus</span>
              <span>{progressPercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 p-5 rounded-lg border border-amber-500/30 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-300 font-medium">Referral Earnings</h3>
            <FaMoneyBillWave className="text-amber-400 w-5 h-5" />
          </div>
          <p className="text-2xl text-white font-bold">
            ${Number(userData?.referralEarnings || 0).toFixed(2)}
          </p>
        </motion.div>
      </div>

      <div className="bg-gradient-to-br from-slate-700/50 to-slate-700/30 p-5 rounded-lg border border-slate-600/50 shadow-lg mb-6">
        <div className="flex items-center mb-3">
          <FaLink className="text-blue-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">Referral Bonus</h3>
        </div>
        <p className="text-gray-300">
          {isLoadingSettings ? (
            "Loading bonus information..."
          ) : (
            <>
              Earn <span className="text-blue-400 font-semibold">${settings.referralBonus}</span> for every <span className="text-blue-400 font-semibold">{settings.referralsRequired}</span> successful referrals!
            </>
          )}
        </p>
        <p className="text-sm text-gray-400 mt-2">
          A successful referral is counted when your referred user makes their first deposit.
        </p>
      </div>

      {userData?.referredBy && (
        <div className="bg-gradient-to-br from-slate-700/50 to-slate-700/30 p-5 rounded-lg border border-slate-600/50 shadow-lg mb-6">
          <div className="flex items-center mb-2">
            <FaUserCheck className="text-green-400 mr-2" />
            <h3 className="text-lg font-semibold text-white">Referred By</h3>
          </div>
          <p className="text-gray-300">{userData.referredBy}</p>
        </div>
      )}

      <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 p-5 rounded-lg border border-blue-500/30 shadow-lg">
        <div className="flex items-center mb-4">
          <FaLink className="text-blue-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">Your Referral Code</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full">
            <input
              type="text"
              readOnly
              ref={referralInputRef}
              value={userData?.referralCode || ''}
              className="w-full bg-slate-700/70 text-white p-3 pl-4 pr-10 rounded-lg text-center sm:text-left border border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              onClick={(e) => e.target.select()}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <FaLink className="text-blue-400 w-4 h-4" />
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCopy}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg w-full sm:w-auto mt-2 sm:mt-0 flex items-center justify-center"
          >
            <FaCopy className="mr-2" />
            {copied ? 'Copied!' : 'Copy Code'}
          </motion.button>
        </div>
        
        <p className="text-sm text-gray-400 mt-4">
          Share this code with friends. When they register using your code, you&apos;ll earn bonuses when they make deposits.
        </p>
      </div>
    </div>
  );
}

export default ReferralLink; 