import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, User, Activity, Zap, Star, Award, DollarSign, Bitcoin } from 'lucide-react';

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
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik Buterin
    '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE', // Binance
    '0x28C6c06298d514Db089934071355E5743bf21d60', // Binance 2
    '0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549', // Binance 3
    '0xDFd5293D8e347dFe59E90eFd55b2956a1343963d', // Binance 4
    '0x56Eddb7aa87536c09CCc2793473599fD21A8b17F', // Binance 5
    '0x9696f59E4d72E237BE84fFD425DCaD154Bf96976', // Binance 6
    '0x4E9ce36E442e55EcD9025B9a6E0D88485d628A67', // Binance 7
    '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8', // Binance 8
    '0xF977814e90dA44bFA03b6295A0616a897441aceC', // Binance 9
    '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3', // Binance 10
    '0x179DAb8AFD9A3d9D426846d6AE4C6FF1A8757B3B', // Binance 11
    '0x892848074ddeA461A15f337250Da3ce55580CA85', // Crypto.com
    '0xA929022c9107643515F5c777cE9a910F0D1e490C', // Crypto.com 2
    '0x6cC5F688a315f3dC28A7781717a9A798a59fDA7b', // OKEx
    '0x236928EB1B8d2a762E5824ab6B4C0274eCc05A36', // Huobi
    '0x5C985E89DDe482eFE97ea9f1950aD149Eb73829B', // Huobi 2
    '0xeB2629a2734e272Bcc07BDA959863f316F4bD4Cf', // Coinbase
    '0x503828976D22510aad0201ac7EC88293211D23Da', // Coinbase 2
    '0xddfAbCdc4D8FfC6d5beaf154f18B778f892A0740', // Coinbase 3
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
    // Initialize with some fake data
    const initialClaims = Array.from({ length: 8 }, () => {
      const claim = generateRealClaim();
      claim.isNew = false;
      // Set random timestamps in the past
      claim.timestamp = new Date(Date.now() - Math.random() * 3600000); // Random time in last hour
      return claim;
    });
    setRecentClaims(initialClaims);

    // Update every minute with new fake claim
    const interval = setInterval(() => {
      const newClaim = generateRealClaim();
      setRecentClaims(prev => {
        const updated = [newClaim, ...prev.slice(0, 7)];
        // Mark old claims as not new
        return updated.map((claim, index) => ({
          ...claim,
          isNew: index === 0
        }));
      });
    }, 60000); // 60 seconds

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
    <div className="h-full bg-orange-800/40 backdrop-blur-sm border border-orange-600/30 rounded-2xl overflow-hidden shadow-2xl">
      {/* Enhanced Header */}
      <div className="p-6 border-b border-orange-600/30 bg-gradient-to-r from-orange-800/50 to-amber-700/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Live Activity</h3>
              <p className="text-sm text-orange-300">Real-time tBTC claims</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-400">Live</div>
            <div className="text-xs text-orange-300">Updates</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-yellow-400 font-medium">Real-time Updates</span>
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Bitcoin className="w-3 h-3 text-orange-400" />
              <span className="text-orange-200">₿{btcPrice.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3 h-3 text-amber-400" />
              <span className="text-orange-200">Instant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Claims List */}
      <div className="p-4 h-[calc(100%-200px)] overflow-y-auto custom-scrollbar">
        <div className="space-y-3">
          {recentClaims.map((claim, index) => (
            <div 
              key={claim.id} 
              className={`relative flex items-center justify-between p-4 bg-orange-700/30 rounded-xl border transition-all duration-500 hover:bg-orange-700/40 hover:scale-[1.02] group ${
                claim.isNew 
                  ? 'ring-2 ring-yellow-500/30 bg-yellow-500/5 border-yellow-500/30 animate-pulse' 
                  : 'border-orange-600/30'
              }`}
            >
              {claim.isNew && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
              )}
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-orange-500/25 transition-all duration-300">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm text-white font-medium">
                      {formatAddress(claim.address)}
                    </span>
                    {claim.isNew && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full font-bold animate-bounce">
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-orange-400">
                      +{claim.amount} tBTC
                    </span>
                    <span className="text-xs text-yellow-400 font-medium">
                      ${claim.usdValue}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-orange-500">
                      <Clock className="w-3 h-3" />
                      {formatTime(claim.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-yellow-500/25 transition-all duration-300">
                  <Bitcoin className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Footer Stats */}
      <div className="p-6 border-t border-orange-600/30 bg-gradient-to-r from-orange-800/50 to-amber-700/30">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="group hover:scale-105 transition-transform duration-300">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div className="text-lg font-bold text-white">2,847</div>
            <div className="text-xs text-orange-300">Total Claims</div>
          </div>
          <div className="group hover:scale-105 transition-transform duration-300">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Bitcoin className="w-4 h-4 text-white" />
            </div>
            <div className="text-lg font-bold text-white">₿{(3200000 / btcPrice).toFixed(1)}</div>
            <div className="text-xs text-orange-300">Distributed</div>
          </div>
          <div className="group hover:scale-105 transition-transform duration-300">
            <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div className="text-lg font-bold text-white">67</div>
            <div className="text-xs text-orange-300">Tokens</div>
          </div>
          <div className="group hover:scale-105 transition-transform duration-300">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div className="text-lg font-bold text-white">24h</div>
            <div className="text-xs text-orange-300">Last Claim</div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(194, 65, 12, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(251, 146, 60, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(251, 146, 60, 0.7);
        }
      `}</style>
    </div>
  );
};

export default LiveStats;