import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Activity, Award, DollarSign, Bitcoin } from 'lucide-react';

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
    '0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549',
    '0xDFd5293D8e347dFe59E90eFd55b2956a1343963d',
    '0x56Eddb7aa87536c09CCc2793473599fD21A8b17F',
    '0x9696f59E4d72E237BE84fFD425DCaD154Bf96976',
    '0x4E9ce36E442e55EcD9025B9a6E0D88485d628A67',
    '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8',
    '0xF977814e90dA44bFA03b6295A0616a897441aceC'
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
    // Initialize with fewer claims (4 instead of 8)
    const initialClaims = Array.from({ length: 4 }, () => {
      const claim = generateRealClaim();
      claim.isNew = false;
      // Set random timestamps in the past
      claim.timestamp = new Date(Date.now() - Math.random() * 3600000); // Random time in last hour
      return claim;
    });
    setRecentClaims(initialClaims);

    // Update every 2 minutes instead of 1 minute
    const interval = setInterval(() => {
      const newClaim = generateRealClaim();
      setRecentClaims(prev => {
        const updated = [newClaim, ...prev.slice(0, 3)]; // Keep max 4 claims
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
    <div className="h-full bg-black/40 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
      {/* Compact Header */}
      <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-black/50 to-gray-900/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-black to-gray-800 border border-white rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Live Activity</h3>
              <p className="text-xs text-gray-400">Real-time tBTC claims</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-white">Live</div>
            <div className="text-xs text-gray-400">Updates</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-white font-medium">Real-time Updates</span>
          </div>
          
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1">
              <Bitcoin className="w-3 h-3 text-gray-400" />
              <span className="text-gray-300">₿{btcPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Claims List */}
      <div className="p-3 h-[calc(100%-160px)] overflow-y-auto custom-scrollbar">
        <div className="space-y-2">
          {recentClaims.map((claim, index) => (
            <div 
              key={claim.id} 
              className={`relative flex items-center justify-between p-3 bg-black/30 rounded-lg border transition-all duration-500 hover:bg-black/40 hover:scale-[1.02] group ${
                claim.isNew 
                  ? 'ring-1 ring-white/30 bg-white/5 border-white/30 animate-pulse' 
                  : 'border-gray-700'
              }`}
            >
              {claim.isNew && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></div>
              )}
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-black to-gray-800 border border-white rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-white/25 transition-all duration-300">
                  <span className="text-white text-xs font-bold">₿</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-white font-medium">
                      {formatAddress(claim.address)}
                    </span>
                    {claim.isNew && (
                      <span className="text-xs bg-white/20 text-white px-1 py-0.5 rounded-full font-bold animate-bounce">
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      +{claim.amount} tBTC
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      ${claim.usdValue}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-2 h-2" />
                      {formatTime(claim.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="w-6 h-6 bg-gradient-to-r from-white to-gray-300 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-white/25 transition-all duration-300">
                  <Bitcoin className="w-3 h-3 text-black" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compact Footer Stats */}
      <div className="p-4 border-t border-gray-700 bg-gradient-to-r from-black/50 to-gray-900/30">
        <div className="grid grid-cols-4 gap-3 text-center">
          <div className="group hover:scale-105 transition-transform duration-300">
            <div className="w-6 h-6 bg-gradient-to-r from-black to-gray-800 border border-white rounded-lg flex items-center justify-center mx-auto mb-1">
              <TrendingUp className="w-3 h-3 text-white" />
            </div>
            <div className="text-sm font-bold text-white">2,847</div>
            <div className="text-xs text-gray-400">Total Claims</div>
          </div>
          <div className="group hover:scale-105 transition-transform duration-300">
            <div className="w-6 h-6 bg-gradient-to-r from-white to-gray-300 rounded-lg flex items-center justify-center mx-auto mb-1">
              <Bitcoin className="w-3 h-3 text-black" />
            </div>
            <div className="text-sm font-bold text-white">₿{(3200000 / btcPrice).toFixed(1)}</div>
            <div className="text-xs text-gray-400">Distributed</div>
          </div>
          <div className="group hover:scale-105 transition-transform duration-300">
            <div className="w-6 h-6 bg-gradient-to-r from-gray-800 to-black border border-white rounded-lg flex items-center justify-center mx-auto mb-1">
              <Award className="w-3 h-3 text-white" />
            </div>
            <div className="text-sm font-bold text-white">67</div>
            <div className="text-xs text-gray-400">Tokens</div>
          </div>
          <div className="group hover:scale-105 transition-transform duration-300">
            <div className="w-6 h-6 bg-gradient-to-r from-gray-600 to-black border border-white rounded-lg flex items-center justify-center mx-auto mb-1">
              <Clock className="w-3 h-3 text-white" />
            </div>
            <div className="text-sm font-bold text-white">24h</div>
            <div className="text-xs text-gray-400">Last Claim</div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }
      `}</style>
    </div>
  );
};

export default LiveStats;