import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import useStore from '../store/useStore';
import axios from 'axios';

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
  const nextBonusAt = Math.ceil(successfulReferrals / settings.referralsRequired) * settings.referralsRequired;
  const remainingForBonus = nextBonusAt - successfulReferrals;

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
    <div className="bg-slate-800 p-6 rounded-xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-700 p-4 rounded-lg">
          <h3 className="text-gray-400 mb-2">Total Referrals</h3>
          <p className="text-2xl text-white font-semibold">{userData?.referralCount || 0}</p>
        </div>
        <div className="bg-slate-700 p-4 rounded-lg">
          <h3 className="text-gray-400 mb-2">Successful Referrals</h3>
          <p className="text-2xl text-white font-semibold">{successfulReferrals}</p>
          <p className="text-sm text-gray-400 mt-1">
            {remainingForBonus} more needed for next bonus
          </p>
        </div>
        <div className="bg-slate-700 p-4 rounded-lg">
          <h3 className="text-gray-400 mb-2">Referral Earnings</h3>
          <p className="text-2xl text-white font-semibold">
            ${Number(userData?.referralEarnings || 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-slate-700 p-4 rounded-lg">
        <h3 className="text-gray-400 mb-2">Referral Bonus</h3>
        <p className="text-lg text-white">
          {isLoadingSettings ? (
            "Loading bonus information..."
          ) : (
            `Earn $${settings.referralBonus} for every ${settings.referralsRequired} successful referrals!`
          )}
        </p>
        <p className="text-sm text-gray-400 mt-2">
          A successful referral is counted when your referred user makes their first deposit.
        </p>
      </div>

      {userData?.referredBy && (
        <div className="bg-slate-700 p-4 rounded-lg">
          <h3 className="text-gray-400 mb-2">Referred By</h3>
          <p className="text-lg text-white">{userData.referredBy}</p>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Your Referral Code</h3>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            readOnly
            ref={referralInputRef}
            value={userData?.referralCode || ''}
            className="w-full bg-slate-700 text-white p-3 rounded-lg text-center sm:text-left border border-slate-600"
            onClick={(e) => e.target.select()}
          />
          <button
            onClick={handleCopy}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto mt-2 sm:mt-0"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        
        <p className="text-sm text-gray-400">
          Share this code with friends. They can enter it during registration.
        </p>
      </div>
    </div>
  );
}

export default ReferralLink; 