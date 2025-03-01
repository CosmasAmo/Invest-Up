import { useState, useEffect } from 'react';
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(userData?.referralCode || '');
      setCopied(true);
      toast.success('Referral code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error(error.message);
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
        
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={userData?.referralCode || ''}
            className="flex-1 bg-slate-700 text-white p-3 rounded-lg"
          />
          <button
            onClick={handleCopy}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
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