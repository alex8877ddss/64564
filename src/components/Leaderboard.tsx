import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, Bitcoin } from 'lucide-react';
import { bitcoinPriceService } from '../services/bitcoin-price';

interface LeaderboardEntry {
  rank: number;
  address: string;
  totalClaimed: number;
  usdValue: number;
  claimsCount: number;
  badges: string[];
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'all'>('weekly');
  const [btcPrice, setBtcPrice] = useState(67000);

  // Subscribe to real Bitcoin price updates
  useEffect(() => {
    const unsubscribe = bitcoinPriceService.subscribeToUpdates((price) => {
      setBtcPrice(price);
    });

    return unsubscribe;
  }, []);

  // Generate leaderboard data (6 entries)
  useEffect(() => {
    const generateLeaderboard = () => {
      const addresses = [
        '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',
        '0x28C6c06298d514Db089934071355E5743bf21d60',
        '0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549',
        '0xDFd5293D8e347dFe59E90eFd55b2956a1343963d',
        '0x56Eddb7aa87536c09CCc2793473599fD21A8b17F'
      ];

      const badges = ['🔥', '⚡', '💎', '🚀', '🎯', '⭐'];

      return addresses.slice(0, 6).map((address, index) => {
        const tbtcAmount = (Math.random() * (2.5 - 0.0001) + 0.0001);
        const usdValue = tbtcAmount * btcPrice;
        
        return {
          rank: index + 1,
          address,
          totalClaimed: tbtcAmount,
          usdValue: usdValue,
          claimsCount: Math.floor(Math.random() * 50) + 5,
          badges: badges.slice(0, Math.floor(Math.random() * 2) + 1)
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
      default: return 'bg-black/30 border-gray-700/50';
    }
  };

  return (
    <div className="bg-gradient-to-br from-black/60 to-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-white to-gray-300 rounded-xl flex items-center justify-center">
              <Trophy className="w-4 h-4 text-black" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Top Earners</h3>
              <p className="text-xs text-gray-400">Leading tBTC holders</p>
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

      <div className="p-4">
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <div
              key={entry.address}
              className={`p-3 rounded-xl border transition-all hover:scale-[1.02] ${getRankStyle(entry.rank)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-white font-medium">
                        {formatAddress(entry.address)}
                      </span>
                      <div className="flex gap-1">
                        {entry.badges.map((badge, index) => (
                          <span key={index} className="text-xs">{badge}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {entry.claimsCount} claims
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
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 border-t border-gray-700/50 bg-black/30">
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Hold whitelisted tokens to earn tBTC rewards! 🏆
          </p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;