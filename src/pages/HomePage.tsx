import React, { useState, useEffect } from 'react';
import { Shield, Globe, Lock, Coins, Award, Users, TrendingUp, Activity, Bitcoin } from 'lucide-react';
import WalletConnection from '../components/WalletConnection';
import AirdropStatus from '../components/AirdropStatus';
import LiveStats from '../components/LiveStats';
import Leaderboard from '../components/Leaderboard';
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

  // Loading screen
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
      {/* Minimal Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/2 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen p-3">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-black to-gray-800 border-2 border-white rounded-xl flex items-center justify-center shadow-xl relative">
              <Bitcoin className="text-white w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
                tBTC AirdropHub
              </h1>
              <p className="text-xs text-gray-400 font-medium">Bitcoin Rewards for Token Holders</p>
            </div>
          </div>
          
          <div className="inline-flex items-center gap-2 bg-black/50 border border-gray-700 rounded-full px-3 py-1 backdrop-blur-sm shadow-lg">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            <span className="text-gray-300 text-xs font-medium">Live</span>
            <div className="w-0.5 h-2 bg-gray-600 rounded-full"></div>
            <span className="text-white text-xs font-bold">2,847 Claims</span>
            <div className="w-0.5 h-2 bg-gray-600 rounded-full"></div>
            <span className="text-gray-400 text-xs font-medium">₿{(3200000 / btcPrice).toFixed(2)} Distributed</span>
          </div>
        </div>

        {/* Compact Grid Layout */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-3 h-[calc(100vh-200px)]">
            
            {/* Left Column - Wallet & Airdrop */}
            <div className="col-span-12 lg:col-span-4 space-y-3 flex flex-col">
              <WalletConnection
                onAddressChange={handleAddressChange}
                currentAddress={currentAddress}
              />
              
              {currentAddress && (
                <div className="flex-1">
                  <AirdropStatus
                    status={airdropStatus}
                    address={currentAddress}
                    onClaim={handleAirdropClaim}
                    isConnected={isConnected}
                  />
                </div>
              )}

              {/* Compact Stats Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105 group">
                  <div className="w-6 h-6 bg-gradient-to-r from-black to-gray-700 border border-white rounded-lg flex items-center justify-center mb-2 shadow-lg group-hover:shadow-white/25 transition-all duration-300">
                    <Users className="w-3 h-3 text-white" />
                  </div>
                  <div className="text-sm font-bold text-white mb-1">12.8K</div>
                  <div className="text-xs text-gray-400 font-medium">Holders</div>
                </div>
                
                <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105 group">
                  <div className="w-6 h-6 bg-gradient-to-r from-gray-800 to-black border border-white rounded-lg flex items-center justify-center mb-2 shadow-lg group-hover:shadow-white/25 transition-all duration-300">
                    <Bitcoin className="w-3 h-3 text-white" />
                  </div>
                  <div className="text-sm font-bold text-white mb-1">₿{(3200000 / btcPrice).toFixed(1)}</div>
                  <div className="text-xs text-gray-400 font-medium">Distributed</div>
                </div>
                
                <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105 group">
                  <div className="w-6 h-6 bg-gradient-to-r from-white to-gray-300 rounded-lg flex items-center justify-center mb-2 shadow-lg group-hover:shadow-white/25 transition-all duration-300">
                    <Coins className="w-3 h-3 text-black" />
                  </div>
                  <div className="text-sm font-bold text-white mb-1">67</div>
                  <div className="text-xs text-gray-400 font-medium">Tokens</div>
                </div>
                
                <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-105 group">
                  <div className="w-6 h-6 bg-gradient-to-r from-gray-600 to-black border border-white rounded-lg flex items-center justify-center mb-2 shadow-lg group-hover:shadow-white/25 transition-all duration-300">
                    <TrendingUp className="w-3 h-3 text-white" />
                  </div>
                  <div className="text-sm font-bold text-white mb-1">99.8%</div>
                  <div className="text-xs text-gray-400 font-medium">Success</div>
                </div>
              </div>
            </div>

            {/* Middle Column - Live Activity */}
            <div className="col-span-12 lg:col-span-4 h-full">
              <LiveStats />
            </div>

            {/* Right Column - Leaderboard */}
            <div className="col-span-12 lg:col-span-4 h-full">
              <Leaderboard />
            </div>
          </div>
        </div>

        {error && (
          <div className="fixed bottom-6 right-6 bg-black/80 border border-red-500 rounded-xl p-4 backdrop-blur-sm max-w-md shadow-lg animate-slide-in-right">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Compact Floating Features */}
        <div className="fixed bottom-3 left-3 flex items-center gap-2 text-xs">
          <div className="flex items-center gap-2 bg-black/60 border border-gray-700 rounded-full px-2 py-1 backdrop-blur-sm shadow-lg hover:bg-black/70 transition-all duration-300">
            <Shield className="w-3 h-3 text-white" />
            <span className="text-gray-300 font-medium">Secure</span>
          </div>
          <div className="flex items-center gap-2 bg-black/60 border border-gray-700 rounded-full px-2 py-1 backdrop-blur-sm shadow-lg hover:bg-black/70 transition-all duration-300">
            <Globe className="w-3 h-3 text-gray-400" />
            <span className="text-gray-300 font-medium">Decentralized</span>
          </div>
          <div className="flex items-center gap-2 bg-black/60 border border-gray-700 rounded-full px-2 py-1 backdrop-blur-sm shadow-lg hover:bg-black/70 transition-all duration-300">
            <Lock className="w-3 h-3 text-gray-500" />
            <span className="text-gray-300 font-medium">Non-Custodial</span>
          </div>
        </div>

        {/* System Status */}
        <div className="fixed bottom-3 right-3 flex items-center gap-2 bg-black/60 border border-gray-700 rounded-full px-2 py-1 backdrop-blur-sm text-xs shadow-lg">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
          <span className="text-gray-300 font-medium">Operational</span>
          <div className="w-0.5 h-2 bg-gray-600 rounded-full"></div>
          <Activity className="w-3 h-3 text-gray-400" />
          <span className="text-white font-medium">Live</span>
        </div>
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