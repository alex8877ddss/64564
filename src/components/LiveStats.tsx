import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Activity, Bitcoin } from 'lucide-react';

interface StatEntry {
  id: string;
  address: string;
  amount: string;
  usdValue: string;
  timestamp: Date;
  token: string;
  isNew?: boolean;
}

const LiveStats: React.FC = () => {
  const [recentClaims, setRecentClaims] = useState<StatEntry[]>([]);
  const [usedAddresses, setUsedAddresses] = useState<Set<string>>(new Set());
  const [btcPrice, setBtcPrice] = useState(67000);

  // Real Ethereum addresses pool (verified addresses from Etherscan)
  const realAddressPool = [
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',
    '0x28C6c06298d514Db089934071355E5743bf21d60',
    '0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549'
  ];

  // Update BTC price
  useEffect(() => {
    const interval = setInterval(() => {
      setBtcPrice(prev => prev + (Math.random() - 0.5) * 1000);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const generateRealClaim = (): StatEntry => {
    // Get available addresses (not used recently)
    const availableAddresses = realAddressPool.filter(addr => !usedAddresses.has(addr));
    
    // If all addresses used, reset the set
    if (availableAddresses.length === 0) {
      setUsedAddresses(new Set());
      return generateRealClaim();
    }

    const randomAddress = availableAddresses[Math.floor(Math.random() * availableAddresses.length)];
    
    // Generate tBTC amount between 0.0001 and 0.26
    const tbtcAmount = (Math.random() * (0.26 - 0.0001) + 0.0001);
    const usdValue = tbtcAmount * btcPrice;

    // Mark address as used
    setUsedAddresses(prev => new Set([...prev, randomAddress]));

    return {
      id: Math.random().toString(36).substr(2, 9),
      address: randomAddress,
      amount: tbtcAmount.toFixed(4),
      usdValue: usdValue.toFixed(2),
      timestamp: new Date(),
      token: 'tBTC',
      isNew: true
    };
  };

  useEffect(() => {
    // Initialize with fewer claims (3 instead of 4)
    const initialClaims = Array.from({ length: 3 }, () => {
      const claim = generateRealClaim();
      claim.isNew = false;
      // Set random timestamps in the past
      claim.timestamp = new Date(Date.now() - Math.random() * 3600000); // Random time in last hour
      return claim;
    });
    setRecentClaims(initialClaims);

    // Update every 2 minutes
    const interval = setInterval(() => {
      const newClaim = generateRealClaim();
      setRecentClaims(prev => {
        const updated = [newClaim, ...prev.slice(0, 2)]; // Keep max 3 claims
        // Mark old claims as not new
        return updated.map((claim, index) => ({
          ...claim,
          isNew: index === 0
        }));
      });
    }, 120000); // 120 seconds

    return () => clearInterval(interval);
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - timestamp.getTime()) / 1000);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="bg-gradient-to-br from-black/60 to-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-black/50 to-gray-900/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-r from-black to-gray-800 border border-white rounded-xl flex items-center justify-center shadow-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Recent Claims</h3>
            <p className="text-xs text-gray-400">Latest tBTC rewards</p>
          </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="p-4">
        <div className="space-y-3">
          {recentClaims.map((claim, index) => (
            <div 
              key={claim.id} 
              className={`relative flex items-center justify-between p-3 bg-gradient-to-r from-black/30 to-gray-900/20 rounded-xl border transition-all duration-500 hover:scale-[1.02] group ${
                claim.isNew 
                  ? 'ring-1 ring-white/30 bg-white/5 border-white/30 animate-pulse' 
                  : 'border-gray-700/50'
              }`}
            >
              {claim.isNew && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></div>
              )}
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-black to-gray-800 border border-white rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs font-bold">₿</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-white font-medium">
                      {formatAddress(claim.address)}
                    </span>
                    {claim.isNew && (
                      <span className="text-xs bg-white/20 text-white px-1 py-0.5 rounded-full font-bold">
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      +{claim.amount} tBTC
                    </span>
                    <span className="text-xs text-gray-400">
                      ${claim.usdValue}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <Clock className="w-2 h-2" />
                  {formatTime(claim.timestamp)}
                </div>
                <div className="w-6 h-6 bg-gradient-to-r from-white to-gray-300 rounded-lg flex items-center justify-center">
                  <Bitcoin className="w-3 h-3 text-black" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveStats;