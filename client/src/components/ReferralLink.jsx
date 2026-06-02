import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import useStore from '../store/useStore';
import axios from 'axios';
import { FaUsers, FaUserCheck, FaMoneyBillWave, FaLink, FaCopy, FaCheck } from 'react-icons/fa';
import { motion } from 'framer-motion';

function ReferralLink() {
  const { userData, fetchSettings, fetchDashboardData } = useStore();
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState({
    referralBonus: 0,
    referralsRequired: 2
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const referralInputRef = useRef(null);
  
  // Add logging to debug referral code issues
  useEffect(() => {
    if (userData) {
      console.log('User data in ReferralLink:', userData);
      console.log('Referral code:', userData.referralCode);
    }
  }, [userData]);
  
  // Fetch fresh user data when component mounts
  useEffect(() => {
    const refreshData = async () => {
      console.log('Refreshing dashboard data to get latest referral information');
      await fetchDashboardData();
    };
    
    refreshData();
  }, [fetchDashboardData]);
  
  // Calculate progress to next bonus
  const successfulReferrals = userData?.successfulReferrals || 0;
  
  // Calculate progress percentage - ensure we show correct progress
  const progressPercentage = successfulReferrals % settings.referralsRequired === 0 && successfulReferrals > 0
    ? 100
    : (successfulReferrals % settings.referralsRequired) / settings.referralsRequired * 100;

  // Ensure we display the correct progress towards next bonus
  const progressToNext = successfulReferrals % settings.referralsRequired === 0 && successfulReferrals > 0 
    ? settings.referralsRequired 
    : successfulReferrals % settings.referralsRequired;

  useEffect(() => {
    // Fetch settings from the server
    const fetchReferralSettings = async () => {
      try {
        setIsLoadingSettings(true);
        // Use the fetchSettings function from the store
        const settingsData = await fetchSettings(true);
        if (settingsData) {
          setSettings({
            referralBonus: settingsData.referralBonus || 0,
            referralsRequired: settingsData.referralsRequired || 2
          });
          console.log('Fetched referral settings:', settingsData.referralBonus, settingsData.referralsRequired);
        } else {
          // Fallback to direct API call
          const response = await axios.get('/api/settings/public', { withCredentials: true });
          if (response.data.success) {
            setSettings({
              referralBonus: response.data.settings.referralBonus || 0,
              referralsRequired: response.data.settings.referralsRequired || 2
            });
            console.log('Fetched referral settings via API:', response.data.settings.referralBonus, response.data.settings.referralsRequired);
          }
        }
      } catch (error) {
        console.error('Error fetching referral settings:', error);
        // If there's an error, we'll use the default values
      } finally {
        setIsLoadingSettings(false);
      }
    };

    fetchReferralSettings();
  }, [fetchSettings]);

  const copyToClipboard = (text) => {
    // Try using the Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
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
              <span>{progressToNext}/{settings.referralsRequired} for next bonus</span>
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
          <p className="text-gray-300">
            {typeof userData.referredBy === 'object' 
              ? userData.referredBy?.name || 'Another User' 
              : userData.referredByName || 'Another User'}
          </p>
        </div>
      )}

      <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 p-5 rounded-lg border border-blue-500/30 shadow-lg">
        <div className="flex items-center mb-4">
          <FaLink className="text-blue-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">Your Referral Code</h3>
        </div>
        
        {userData?.referralCode ? (
          <>
            <div className="mb-4">
              <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-lg flex items-center justify-between">
                <div className="font-mono text-xl text-white font-bold">{userData.referralCode}</div>
                <button 
                  onClick={() => copyToClipboard(userData.referralCode)}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                >
                  {copied ? <FaCheck /> : <FaCopy />}
                </button>
              </div>
              {copied && <p className="text-green-400 text-sm mt-2">Referral code copied!</p>}
            </div>
            <div className="mb-4">
              <p className="text-gray-300">Share your referral code with friends to earn commissions when they sign up and deposit.</p>
            </div>
          </>
        ) : (
          <p className="text-yellow-400 py-2">Loading your referral code...</p>
        )}
      </div>
    </div>
  );
}

export default ReferralLink; 