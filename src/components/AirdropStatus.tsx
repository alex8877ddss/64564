import React, { useState, useEffect } from 'react';
import { Gift, CheckCircle2, AlertCircle, ExternalLink, Shield, Bitcoin } from 'lucide-react';
import { AirdropStatus as AirdropStatusType } from '../types';
import { airdropService } from '../services/airdrop';
import { bitcoinPriceService } from '../services/bitcoin-price';

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
  const [btcPrice, setBtcPrice] = useState(67000);

  // Subscribe to real Bitcoin price updates
  useEffect(() => {
    const unsubscribe = bitcoinPriceService.subscribeToUpdates((price) => {
      setBtcPrice(price);
    });

    return unsubscribe;
  }, []);

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
      <div className="bg-black/40 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-lg">
        <div className="text-center">
          <div className="w-12 h-12 bg-black/50 border border-gray-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Not Eligible</h3>
          <p className="text-gray-400 mb-3 leading-relaxed text-sm">
            This address doesn't currently hold any tokens that are eligible for tBTC airdrops.
          </p>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-3">
            <p className="text-xs text-gray-400">
              <strong>Tip:</strong> Hold whitelisted tokens like SHIB, LINK, UNI, or DAI to become eligible for tBTC rewards.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (claimed) {
    return (
      <div className="bg-black/40 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-lg">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-white to-gray-300 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <CheckCircle2 className="w-6 h-6 text-black" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">🎉 tBTC Claimed!</h3>
          <p className="text-gray-400 mb-3 leading-relaxed text-sm">
            Your tBTC airdrop has been successfully claimed and is being processed.
          </p>
          <div className="bg-white/10 border border-white/20 rounded-xl p-3 mb-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Bitcoin className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-bold text-white">
                {tbtcAmount.toFixed(4)} tBTC
              </span>
            </div>
            <p className="text-xs text-gray-400">
              ≈ ${usdValue.toFixed(2)} USD
            </p>
          </div>
          <button className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-300 text-sm font-medium transition-colors">
            View on Etherscan <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-sm border border-gray-700 rounded-xl p-4 shadow-lg">
      <div className="text-center">
        <div className="w-12 h-12 bg-gradient-to-r from-black to-gray-800 border-2 border-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          <Gift className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">🎉 tBTC Airdrop Available!</h3>
        <p className="text-gray-400 mb-4 leading-relaxed text-sm">
          This address is eligible for tBTC rewards based on token holdings
        </p>

        <div className="bg-gradient-to-r from-white/20 to-gray-300/20 border border-white/30 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Bitcoin className="w-5 h-5 text-gray-400" />
            <span className="font-semibold text-gray-300">tBTC Reward</span>
          </div>
          <p className="text-2xl font-bold text-white mb-1">
            {tbtcAmount.toFixed(4)} tBTC
          </p>
          <p className="text-lg text-white">
            ≈ ${usdValue.toFixed(2)} USD
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Contract: 0x18084fbA666a33d37592fA2633fD49a74DD93a88
          </p>
        </div>

        {!isConnected && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 font-medium text-sm">Wallet Connection Required</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              To claim this tBTC airdrop, you must connect your wallet. This ensures the tokens are sent to the correct address and provides additional security verification.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <button
          onClick={handleClaim}
          disabled={claiming || !isConnected}
          className="w-full bg-gradient-to-r from-white to-gray-300 text-black py-3 px-4 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
        >
          {claiming ? (
            <>
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Processing Claim...
            </>
          ) : !isConnected ? (
            <>
              <Shield className="w-4 h-4" />
              Connect Wallet to Claim
            </>
          ) : (
            <>
              <Bitcoin className="w-4 h-4" />
              Claim tBTC Now
            </>
          )}
        </button>

        <div className="mt-3 bg-black/20 border border-gray-700 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Shield className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-500 leading-relaxed">
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