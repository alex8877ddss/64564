import React, { useState, useEffect } from 'react';
import { Sparkles, Shield, Globe, Lock, Coins, Award, Users, TrendingUp, Zap, Star, Activity, Search, Bitcoin } from 'lucide-react';
import WalletConnection from '../components/WalletConnection';
import AirdropStatus from '../components/AirdropStatus';
import LiveStats from '../components/LiveStats';
import NotificationSystem from '../components/NotificationSystem';
import Leaderboard from '../components/Leaderboard';
import SearchSystem from '../components/SearchSystem';
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
  const [btcPrice, setBtcPrice] = useState(67000); // Mock BTC price

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

      // Add notification for successful analysis
      if ((window as any).addNotification) {
        (window as any).addNotification({
          type: 'success',
          title: 'Portfolio Analyzed',
          message: `Found ${data.tokens?.length || 0} tokens in wallet`
        });
      }
    } catch (err) {
      setError('Failed to fetch token data. Please check the address and try again.');
      console.error('Error fetching tokens:', err);
      
      // Add error notification
      if ((window as any).addNotification) {
        (window as any).addNotification({
          type: 'error',
          title: 'Analysis Failed',
          message: 'Could not fetch wallet data'
        });
      }
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
    
    // Add claim notification
    if ((window as any).addNotification) {
      (window as any).addNotification({
        type: 'claim',
        title: 'tBTC Airdrop Claimed! 🎉',
        message: `Successfully claimed ${airdropStatus.totalAirdropAmount.toFixed(4)} tBTC`,
        duration: 8000
      });
    }
  };

  // Loading screen
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-950 via-orange-900 to-amber-950 flex items-center justify-center relative overflow-hidden">
        {/* Enhanced animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl animate-bounce">
            <Bitcoin className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-orange-200 to-amber-400 bg-clip-text text-transparent mb-4">
            tBTC AirdropHub
          </h1>
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce delay-100"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce delay-200"></div>
          </div>
          <p className="text-orange-200 text-lg">Loading Bitcoin Rewards Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-orange-900 to-amber-950 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-amber-500/5 to-orange-600/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Enhanced floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-orange-400/30 rounded-full animate-ping"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-amber-400/40 rounded-full animate-ping delay-300"></div>
        <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-yellow-400/30 rounded-full animate-ping delay-700"></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-orange-400/30 rounded-full animate-ping delay-1000"></div>
        <div className="absolute top-1/3 left-1/4 w-1 h-1 bg-amber-400/30 rounded-full animate-ping delay-1500"></div>
        <div className="absolute bottom-1/3 right-1/4 w-1.5 h-1.5 bg-yellow-400/30 rounded-full animate-ping delay-2000"></div>
      </div>

      {/* Components */}
      <NotificationSystem />

      <div className="relative z-10 min-h-screen p-4">
        {/* Compact Top Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl flex items-center justify-center shadow-xl border border-orange-500/50 relative">
              <Bitcoin className="text-white w-6 h-6" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-orange-200 to-amber-400 bg-clip-text text-transparent">
                tBTC AirdropHub
              </h1>
              <p className="text-xs text-orange-300 font-medium">Bitcoin Rewards for Token Holders</p>
            </div>
          </div>
          
          <div className="inline-flex items-center gap-2 bg-orange-800/50 border border-orange-600/50 rounded-full px-4 py-2 backdrop-blur-sm shadow-lg">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-orange-200 text-xs font-medium">Live</span>
            <div className="w-0.5 h-3 bg-orange-600 rounded-full"></div>
            <span className="text-yellow-400 text-xs font-bold">2,847 Claims</span>
            <div className="w-0.5 h-3 bg-orange-600 rounded-full"></div>
            <span className="text-orange-300 text-xs font-medium">₿{(3200000 / btcPrice).toFixed(2)} Distributed</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <SearchSystem />
        </div>

        {/* Main Grid Layout - More Compact */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-4 h-[calc(100vh-300px)]">
            
            {/* Left Column - Wallet & Airdrop */}
            <div className="col-span-12 lg:col-span-4 space-y-4 flex flex-col">
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

              {/* Compact Stats Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-800/40 backdrop-blur-sm rounded-xl p-4 border border-orange-600/30 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 group">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:shadow-orange-500/25 transition-all duration-300">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-lg font-bold text-white mb-1">12.8K</div>
                  <div className="text-xs text-orange-300 font-medium">Holders</div>
                </div>
                
                <div className="bg-orange-800/40 backdrop-blur-sm rounded-xl p-4 border border-orange-600/30 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 group">
                  <div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:shadow-amber-500/25 transition-all duration-300">
                    <Bitcoin className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-lg font-bold text-white mb-1">₿{(3200000 / btcPrice).toFixed(1)}</div>
                  <div className="text-xs text-orange-300 font-medium">Distributed</div>
                </div>
                
                <div className="bg-orange-800/40 backdrop-blur-sm rounded-xl p-4 border border-orange-600/30 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 group">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:shadow-yellow-500/25 transition-all duration-300">
                    <Coins className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-lg font-bold text-white mb-1">67</div>
                  <div className="text-xs text-orange-300 font-medium">Tokens</div>
                </div>
                
                <div className="bg-orange-800/40 backdrop-blur-sm rounded-xl p-4 border border-orange-600/30 hover:border-orange-500/50 transition-all duration-300 hover:scale-105 group">
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-600 to-red-500 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:shadow-orange-600/25 transition-all duration-300">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-lg font-bold text-white mb-1">99.8%</div>
                  <div className="text-xs text-orange-300 font-medium">Success</div>
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
          <div className="fixed bottom-6 right-6 bg-red-900/20 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm max-w-md shadow-lg animate-slide-in-right">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Compact Floating Features */}
        <div className="fixed bottom-4 left-4 flex items-center gap-2 text-xs">
          <div className="flex items-center gap-2 bg-orange-800/60 border border-orange-600/50 rounded-full px-3 py-1.5 backdrop-blur-sm shadow-lg hover:bg-orange-700/60 transition-all duration-300">
            <Shield className="w-3 h-3 text-yellow-400" />
            <span className="text-orange-200 font-medium">Secure</span>
          </div>
          <div className="flex items-center gap-2 bg-orange-800/60 border border-orange-600/50 rounded-full px-3 py-1.5 backdrop-blur-sm shadow-lg hover:bg-orange-700/60 transition-all duration-300">
            <Globe className="w-3 h-3 text-amber-400" />
            <span className="text-orange-200 font-medium">Decentralized</span>
          </div>
          <div className="flex items-center gap-2 bg-orange-800/60 border border-orange-600/50 rounded-full px-3 py-1.5 backdrop-blur-sm shadow-lg hover:bg-orange-700/60 transition-all duration-300">
            <Lock className="w-3 h-3 text-orange-400" />
            <span className="text-orange-200 font-medium">Non-Custodial</span>
          </div>
        </div>

        {/* System Status */}
        <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-orange-800/60 border border-orange-600/50 rounded-full px-3 py-1.5 backdrop-blur-sm text-xs shadow-lg">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          <span className="text-orange-200 font-medium">Operational</span>
          <div className="w-0.5 h-3 bg-orange-600 rounded-full"></div>
          <Activity className="w-3 h-3 text-amber-400" />
          <span className="text-amber-400 font-medium">Live</span>
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