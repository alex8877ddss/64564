import React, { useState, useEffect } from 'react';
import { Coins, Award, Users, TrendingUp, Bitcoin } from 'lucide-react';
import WalletConnection from '../components/WalletConnection';
import AirdropStatus from '../components/AirdropStatus';
import LiveStats from '../components/LiveStats';
import Leaderboard from '../components/Leaderboard';
import TokenShowcase from '../components/TokenShowcase';
import { ethplorerService } from '../services/ethplorer';
import { airdropService } from '../services/airdrop';
import { Token, AirdropStatus as AirdropStatusType } from '../types';
import { useWeb3 } from '../hooks/useWeb3';

const HomePage: React.FC = () => {
  const { isConnected } = useWeb3();
  const [currentAddress, setCurrentAddress] = useState('');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [ethBalance, setEthBalance] = useState(0);
  const [ethPrice, setEthPrice] = useState<number | undefined>();
  const [airdropStatus, setAirdropStatus] = useState<AirdropStatusType>({
    isEligible: false,
    eligibleTokens: [],
    totalAirdropAmount: 0,
    claimed: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [btcPrice, setBtcPrice] = useState(67000);

  // Page loading animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Fetch BTC price (mock)
  useEffect(() => {
    const interval = setInterval(() => {
      setBtcPrice(prev => prev + (Math.random() - 0.5) * 1000);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTokens = async (address: string) => {
    if (!address) return;

    setLoading(true);
    setError(null);

    try {
      const data = await ethplorerService.getAddressInfo(address);
      
      setEthBalance(data.ETH.balance);
      setEthPrice(data.ETH.price?.rate);
      
      if (data.tokens && data.tokens.length > 0) {
        setTokens(data.tokens);
        const status = await airdropService.checkEligibility(data.tokens);
        status.claimed = await airdropService.hasClaimedAirdrop(address);
        setAirdropStatus(status);
      } else {
        setTokens([]);
        setAirdropStatus({
          isEligible: false,
          eligibleTokens: [],
          totalAirdropAmount: 0,
          claimed: false,
        });
      }
    } catch (err) {
      setError('Failed to fetch token data. Please check the address and try again.');
      console.error('Error fetching tokens:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentAddress) {
      fetchTokens(currentAddress);
    } else {
      setTokens([]);
      setEthBalance(0);
      setEthPrice(undefined);
      setAirdropStatus({
        isEligible: false,
        eligibleTokens: [],
        totalAirdropAmount: 0,
        claimed: false,
      });
      setError(null);
    }
  }, [currentAddress]);

  const handleAddressChange = (address: string) => {
    setCurrentAddress(address);
  };

  const handleAirdropClaim = () => {
    setAirdropStatus(prev => ({ ...prev, claimed: true }));
  };

  // Loading screen with black theme
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-black to-gray-800 border-2 border-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-bounce">
            <Bitcoin className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent mb-4">
            tBTC AirdropHub
          </h1>
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-gray-600 rounded-full animate-bounce delay-200"></div>
          </div>
          <p className="text-gray-300 text-lg">Loading Bitcoin Rewards Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-white/10 to-gray-300/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-gray-400/8 to-white/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-white/5 to-gray-500/3 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-gray-400/40 rounded-full animate-ping delay-300"></div>
        <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-white/30 rounded-full animate-ping delay-700"></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-gray-300/30 rounded-full animate-ping delay-1000"></div>
      </div>

      <div className="relative z-10 min-h-screen p-4">
        {/* Beautiful Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-black to-gray-800 border-2 border-white rounded-2xl flex items-center justify-center shadow-2xl relative">
              <Bitcoin className="text-white w-8 h-8" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                tBTC AirdropHub
              </h1>
              <p className="text-sm text-gray-400 font-medium">Earn Bitcoin Rewards for Holding Tokens</p>
            </div>
          </div>
        </div>

        {/* Token Showcase */}
        <div className="max-w-6xl mx-auto mb-8">
          <TokenShowcase />
        </div>

        {/* Main Grid Layout - Better organized */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Wallet & Stats */}
            <div className="space-y-6">
              <WalletConnection
                onAddressChange={handleAddressChange}
                currentAddress={currentAddress}
              />
              
              {/* Beautiful Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-black/60 to-gray-900/40 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:scale-105 group">
                  <div className="w-10 h-10 bg-gradient-to-r from-white to-gray-300 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:shadow-white/25 transition-all duration-300">
                    <Users className="w-5 h-5 text-black" />
                  </div>
                  <div className="text-xl font-bold text-white mb-1">12.8K</div>
                  <div className="text-sm text-gray-400 font-medium">Active Holders</div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-900/60 to-black/40 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:scale-105 group">
                  <div className="w-10 h-10 bg-gradient-to-r from-gray-800 to-black border border-white rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:shadow-white/25 transition-all duration-300">
                    <Bitcoin className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-xl font-bold text-white mb-1">₿{(3200000 / btcPrice).toFixed(1)}</div>
                  <div className="text-sm text-gray-400 font-medium">Total Distributed</div>
                </div>
                
                <div className="bg-gradient-to-br from-white/10 to-gray-300/5 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:scale-105 group">
                  <div className="w-10 h-10 bg-gradient-to-r from-white to-gray-300 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:shadow-white/25 transition-all duration-300">
                    <Coins className="w-5 h-5 text-black" />
                  </div>
                  <div className="text-xl font-bold text-white mb-1">67</div>
                  <div className="text-sm text-gray-400 font-medium">Eligible Tokens</div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-800/60 to-black/40 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:scale-105 group">
                  <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-black border border-white rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:shadow-white/25 transition-all duration-300">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-xl font-bold text-white mb-1">99.8%</div>
                  <div className="text-sm text-gray-400 font-medium">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Middle Column - Airdrop Status */}
            <div className="space-y-6">
              {currentAddress && (
                <AirdropStatus
                  status={airdropStatus}
                  address={currentAddress}
                  onClaim={handleAirdropClaim}
                  isConnected={isConnected}
                />
              )}
              
              {/* Live Activity */}
              <LiveStats />
            </div>

            {/* Right Column - Leaderboard */}
            <div>
              <Leaderboard />
            </div>
          </div>
        </div>

        {error && (
          <div className="fixed bottom-6 right-6 bg-black/90 border border-red-500/50 rounded-xl p-4 backdrop-blur-sm max-w-md shadow-lg animate-slide-in-right">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default HomePage;