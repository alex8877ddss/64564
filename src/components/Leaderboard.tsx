import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, Star, TrendingUp, User, Bitcoin } from 'lucide-react';

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
        '0x4E9ce36E442e55EcD9025B9a6E0D88485d628A67',
        '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8',
        '0xF977814e90dA44bFA03b6295A0616a897441aceC'
      ];

      const badges = ['🔥', '⚡', '💎', '🚀', '🎯', '⭐', '🏆', '👑'];

      return addresses.slice(0, 10).map((address, index) => {
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
      case 1: return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2: return <Medal className="w-5 h-5 text-gray-300" />;
      case 3: return <Medal className="w-5 h-5 text-orange-400" />;
      default: return <span className="text-orange-300 font-bold">#{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      case 2: return 'bg-gradient-to-r from-gray-500/20 to-orange-500/20 border-gray-400/30';
      case 3: return 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 border-orange-500/30';
      default: return 'bg-orange-700/30 border-orange-600/30';
    }
  };

  return (
    <div className="h-full bg-orange-800/40 backdrop-blur-sm border border-orange-600/30 rounded-xl overflow-hidden">
      <div className="p-6 border-b border-orange-600/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Top Earners</h3>
              <p className="text-xs text-orange-300">tBTC leaderboard</p>
            </div>
          </div>
          
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as 'daily' | 'weekly' | 'all')}
            className="px-3 py-1 bg-orange-700/50 border border-orange-600/50 rounded-lg text-white text-xs"
          >
            <option value="daily">Today</option>
            <option value="weekly">This Week</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <div
              key={entry.address}
              className={`p-4 rounded-xl border transition-all hover:scale-[1.02] ${getRankStyle(entry.rank)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-white font-medium">
                          {formatAddress(entry.address)}
                        </span>
                        <div className="flex gap-1">
                          {entry.badges.map((badge, index) => (
                            <span key={index} className="text-xs">{badge}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-orange-300">
                        <span>{entry.claimsCount} claims</span>
                        <span>{entry.streak} day streak</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <Bitcoin className="w-4 h-4 text-orange-400" />
                    <span className="text-lg font-bold text-white">
                      {entry.totalClaimed.toFixed(4)}
                    </span>
                  </div>
                  <div className="text-xs text-yellow-400">
                    ${entry.usdValue.toLocaleString()}
                  </div>
                  <div className="text-xs text-orange-400 flex items-center gap-1 justify-end">
                    <TrendingUp className="w-3 h-3" />
                    +12.5%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-orange-600/30 bg-orange-800/30">
        <div className="text-center">
          <p className="text-xs text-orange-300">
            Earn tBTC by holding whitelisted tokens! 🏆
          </p>
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

export default Leaderboard;