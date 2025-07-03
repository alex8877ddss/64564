import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, TrendingUp, Bitcoin } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  address: string;
  totalClaimed: number;
  usdValue: number;
  claimsCount: number;
  streak: number;
  badges: string[];
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'all'>('weekly');
  const [btcPrice, setBtcPrice] = useState(67000);

  // Update BTC price
  useEffect(() => {
    const interval = setInterval(() => {
      setBtcPrice(prev => prev + (Math.random() - 0.5) * 1000);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Generate fake leaderboard data
  useEffect(() => {
    const generateLeaderboard = () => {
      const addresses = [
        '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',
        '0x28C6c06298d514Db089934071355E5743bf21d60',
        '0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549',
        '0xDFd5293D8e347dFe59E90eFd55b2956a1343963d',
        '0x56Eddb7aa87536c09CCc2793473599fD21A8b17F',
        '0x9696f59E4d72E237BE84fFD425DCaD154Bf96976',
        '0x4E9ce36E442e55EcD9025B9a6E0D88485d628A67'
      ];

      const badges = ['🔥', '⚡', '💎', '🚀', '🎯', '⭐', '🏆', '👑'];

      return addresses.slice(0, 8).map((address, index) => {
        // Generate tBTC amounts between 0.0001 and 2.5
        const tbtcAmount = (Math.random() * (2.5 - 0.0001) + 0.0001);
        const usdValue = tbtcAmount * btcPrice;
        
        return {
          rank: index + 1,
          address,
          totalClaimed: tbtcAmount,
          usdValue: usdValue,
          claimsCount: Math.floor(Math.random() * 50) + 5,
          streak: Math.floor(Math.random() * 30) + 1,
          badges: badges.slice(0, Math.floor(Math.random() * 3) + 1)
        };
      }).sort((a, b) => b.totalClaimed - a.totalClaimed);
    };

    setLeaderboard(generateLeaderboard());
  }, [timeframe, btcPrice]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-4 h-4 text-white" />;
      case 2: return <Medal className="w-4 h-4 text-gray-300" />;
      case 3: return <Medal className="w-4 h-4 text-gray-400" />;
      default: return <span className="text-gray-300 font-bold text-sm">#{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-white/20 to-gray-300/20 border-white/30';
      case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30';
      case 3: return 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 border-gray-500/30';
      default: return 'bg-black/30 border-gray-700';
    }
  };

  return (
    <div className="h-full bg-black/40 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-white to-gray-300 rounded-xl flex items-center justify-center">
              <Trophy className="w-4 h-4 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Top Earners</h3>
              <p className="text-xs text-gray-400">tBTC leaderboard</p>
            </div>
          </div>
          
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as 'daily' | 'weekly' | 'all')}
            className="px-2 py-1 bg-black/50 border border-gray-700 rounded-lg text-white text-xs"
          >
            <option value="daily">Today</option>
            <option value="weekly">This Week</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
        <div className="space-y-2">
          {leaderboard.map((entry) => (
            <div
              key={entry.address}
              className={`p-3 rounded-lg border transition-all hover:scale-[1.02] ${getRankStyle(entry.rank)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-black to-gray-800 border border-white rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">₿</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-white font-medium">
                          {formatAddress(entry.address)}
                        </span>
                        <div className="flex gap-1">
                          {entry.badges.map((badge, index) => (
                            <span key={index} className="text-xs">{badge}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span>{entry.claimsCount} claims</span>
                        <span>{entry.streak} day streak</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 mb-1">
                    <Bitcoin className="w-3 h-3 text-gray-400" />
                    <span className="text-sm font-bold text-white">
                      {entry.totalClaimed.toFixed(4)}
                    </span>
                  </div>
                  <div className="text-xs text-white">
                    ${entry.usdValue.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                    <TrendingUp className="w-2 h-2" />
                    +12.5%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 border-t border-gray-700 bg-black/30">
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Earn tBTC by holding whitelisted tokens! 🏆
          </p>
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

export default Leaderboard;