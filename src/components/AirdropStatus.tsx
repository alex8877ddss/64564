import React, { useState } from 'react';
import { Gift, CheckCircle2, AlertCircle, ExternalLink, Zap, Star, Wallet as WalletIcon, Shield, Bitcoin } from 'lucide-react';
import { AirdropStatus as AirdropStatusType } from '../types';
import { airdropService } from '../services/airdrop';

interface AirdropStatusProps {
  status: AirdropStatusType;
  address: string;
  onClaim: () => void;
  isConnected: boolean;
}

const AirdropStatus: React.FC<AirdropStatusProps> = ({ status, address, onClaim, isConnected }) => {
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [btcPrice] = useState(67000); // Mock BTC price

  // Generate random tBTC amount between 0.0001 and 0.26
  const tbtcAmount = Math.random() * (0.26 - 0.0001) + 0.0001;
  const usdValue = tbtcAmount * btcPrice;

  const handleClaim = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first to claim the airdrop');
      return;
    }

    setClaiming(true);
    setError(null);

    try {
      await airdropService.claimAirdrop(address, status.eligibleTokens);
      setClaimed(true);
      onClaim();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim airdrop');
    } finally {
      setClaiming(false);
    }
  };

  if (!status.isEligible) {
    return (
      <div className="bg-orange-800/40 backdrop-blur-sm border border-orange-600/30 rounded-xl p-6 shadow-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-700/50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-orange-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Not Eligible</h3>
          <p className="text-orange-300 mb-4 leading-relaxed">
            This address doesn't currently hold any tokens that are eligible for tBTC airdrops.
          </p>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
            <p className="text-sm text-amber-400">
              <strong>Tip:</strong> Hold whitelisted tokens like SHIB, LINK, UNI, or DAI to become eligible for tBTC rewards.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (claimed) {
    return (
      <div className="bg-orange-800/40 backdrop-blur-sm border border-orange-600/30 rounded-xl p-6 shadow-lg">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">🎉 tBTC Claimed!</h3>
          <p className="text-orange-300 mb-4 leading-relaxed">
            Your tBTC airdrop has been successfully claimed and is being processed.
          </p>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Bitcoin className="w-5 h-5 text-orange-400" />
              <span className="text-sm font-bold text-yellow-400">
                {tbtcAmount.toFixed(4)} tBTC
              </span>
            </div>
            <p className="text-xs text-yellow-300">
              ≈ ${usdValue.toFixed(2)} USD
            </p>
          </div>
          <button className="inline-flex items-center gap-2 text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors">
            View on Etherscan <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-orange-800/40 backdrop-blur-sm border border-orange-600/30 rounded-xl p-6 shadow-lg">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Gift className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-3">🎉 tBTC Airdrop Available!</h3>
        <p className="text-orange-300 mb-6 leading-relaxed">
          This address is eligible for tBTC rewards based on token holdings
        </p>

        <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Bitcoin className="w-6 h-6 text-orange-400" />
            <span className="font-semibold text-orange-400">tBTC Reward</span>
          </div>
          <p className="text-3xl font-bold text-white mb-2">
            {tbtcAmount.toFixed(4)} tBTC
          </p>
          <p className="text-lg text-yellow-400">
            ≈ ${usdValue.toFixed(2)} USD
          </p>
          <p className="text-xs text-orange-300 mt-2">
            Contract: 0x18084fbA666a33d37592fA2633fD49a74DD93a88
          </p>
        </div>

        {!isConnected && (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <WalletIcon className="w-5 h-5 text-amber-400" />
              <span className="text-amber-400 font-medium">Wallet Connection Required</span>
            </div>
            <p className="text-sm text-amber-300 leading-relaxed">
              To claim this tBTC airdrop, you must connect your wallet. This ensures the tokens are sent to the correct address and provides additional security verification.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <button
          onClick={handleClaim}
          disabled={claiming || !isConnected}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
        >
          {claiming ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing Claim...
            </>
          ) : !isConnected ? (
            <>
              <WalletIcon className="w-5 h-5" />
              Connect Wallet to Claim
            </>
          ) : (
            <>
              <Bitcoin className="w-5 h-5" />
              Claim tBTC Now
            </>
          )}
        </button>

        <div className="mt-4 bg-orange-700/20 border border-orange-600/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-orange-300 leading-relaxed">
              tBTC tokens will be sent directly to your connected wallet address. 
              Transaction fees may apply depending on network conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirdropStatus;