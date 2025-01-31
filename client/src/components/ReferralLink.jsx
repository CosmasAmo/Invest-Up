import { useState } from 'react';
import { toast } from 'react-toastify';
import useStore from '../store/useStore';

function ReferralLink() {
  const { userData } = useStore();
  const [copied, setCopied] = useState(false);

  const referralLink = `${window.location.origin}/register?ref=${userData?.referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-700 p-4 rounded-lg">
          <h3 className="text-gray-400 mb-2">Total Referrals</h3>
          <p className="text-2xl text-white font-semibold">{userData?.referralCount || 0}</p>
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
        <p className="text-lg text-white">Earn $20 for each successful referral!</p>
      </div>

      {userData?.referredBy && (
        <div className="bg-slate-700 p-4 rounded-lg">
          <h3 className="text-gray-400 mb-2">Referred By</h3>
          <p className="text-lg text-white">{userData.referredBy}</p>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">Your Referral Link</h3>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-1 bg-slate-700 text-white p-3 rounded-lg"
          />
          <button
            onClick={handleCopy}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReferralLink; 