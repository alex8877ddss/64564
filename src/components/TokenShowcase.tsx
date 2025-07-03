import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, TrendingUp } from 'lucide-react';

interface ShowcaseToken {
  symbol: string;
  name: string;
  icon: string;
  airdropAmount: string;
  price: string;
  change: string;
  isPositive: boolean;
}

const TokenShowcase: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const showcaseTokens: ShowcaseToken[] = [
    {
      symbol: 'SHIB',
      name: 'Shiba Inu',
      icon: 'https://assets.coingecko.com/coins/images/11939/small/shiba.png',
      airdropAmount: '1,000,000',
      price: '$0.000008',
      change: '+12.5%',
      isPositive: true
    },
    {
      symbol: 'LINK',
      name: 'Chainlink',
      icon: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png',
      airdropAmount: '50',
      price: '$14.23',
      change: '+8.2%',
      isPositive: true
    },
    {
      symbol: 'UNI',
      name: 'Uniswap',
      icon: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png',
      airdropAmount: '100',
      price: '$6.45',
      change: '-2.1%',
      isPositive: false
    },
    {
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      icon: 'https://assets.coingecko.com/coins/images/9956/small/4943.png',
      airdropAmount: '500',
      price: '$1.00',
      change: '+0.1%',
      isPositive: true
    },
    {
      symbol: 'MATIC',
      name: 'Polygon',
      icon: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png',
      airdropAmount: '200',
      price: '$0.85',
      change: '+15.3%',
      isPositive: true
    },
    {
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      icon: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png',
      airdropAmount: '1',
      price: '$67,000',
      change: '+3.7%',
      isPositive: true
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % showcaseTokens.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, showcaseTokens.length]);

  const nextToken = () => {
    setCurrentIndex((prev) => (prev + 1) % showcaseTokens.length);
    setIsAutoPlaying(false);
  };

  const prevToken = () => {
    setCurrentIndex((prev) => (prev - 1 + showcaseTokens.length) % showcaseTokens.length);
    setIsAutoPlaying(false);
  };

  const goToToken = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const getVisibleTokens = () => {
    const tokens = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % showcaseTokens.length;
      tokens.push({ ...showcaseTokens[index], index });
    }
    return tokens;
  };

  return (
    <div className="bg-gradient-to-r from-black/60 via-gray-900/40 to-black/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-r from-white to-gray-300 rounded-xl flex items-center justify-center">
            <Star className="w-4 h-4 text-black" />
          </div>
          <h3 className="text-2xl font-bold text-white">Hold These Tokens to Earn tBTC</h3>
        </div>
        <p className="text-gray-400">Automatically earn Bitcoin rewards by holding whitelisted tokens</p>
      </div>

      <div className="relative">
        {/* Navigation Buttons */}
        <button
          onClick={prevToken}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/80 border border-gray-600 rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-all duration-300 hover:scale-110"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextToken}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-black/80 border border-gray-600 rounded-full flex items-center justify-center text-white hover:bg-black/90 transition-all duration-300 hover:scale-110"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Token Cards */}
        <div className="flex gap-4 px-12 overflow-hidden">
          {getVisibleTokens().map((token, displayIndex) => (
            <div
              key={`${token.symbol}-${token.index}`}
              className={`flex-1 bg-gradient-to-br from-white/10 to-gray-800/20 border border-gray-700/50 rounded-xl p-4 transition-all duration-500 hover:scale-105 hover:border-gray-600/50 ${
                displayIndex === 1 ? 'scale-110 border-white/30 shadow-lg' : 'scale-95 opacity-75'
              }`}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-white rounded-full p-2 shadow-lg">
                  <img
                    src={token.icon}
                    alt={token.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23000" rx="32"/><text x="32" y="40" text-anchor="middle" fill="white" font-size="20" font-weight="bold">${token.symbol.slice(0, 2)}</text></svg>`;
                    }}
                  />
                </div>
                
                <h4 className="text-lg font-bold text-white mb-1">{token.symbol}</h4>
                <p className="text-sm text-gray-400 mb-3">{token.name}</p>
                
                <div className="space-y-2">
                  <div className="bg-black/40 rounded-lg p-2">
                    <p className="text-xs text-gray-400">Airdrop Amount</p>
                    <p className="text-sm font-bold text-white">{token.airdropAmount} tokens</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-400">Price</p>
                      <p className="text-sm font-semibold text-white">{token.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">24h</p>
                      <div className={`flex items-center gap-1 text-sm font-semibold ${
                        token.isPositive ? 'text-green-400' : 'text-red-400'
                      }`}>
                        <TrendingUp className={`w-3 h-3 ${token.isPositive ? '' : 'rotate-180'}`} />
                        {token.change}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {showcaseTokens.map((_, index) => (
            <button
              key={index}
              onClick={() => goToToken(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white w-6' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>

        {/* Auto-play indicator */}
        <div className="text-center mt-4">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`text-xs px-3 py-1 rounded-full border transition-all duration-300 ${
              isAutoPlaying 
                ? 'bg-white/10 border-white/30 text-white' 
                : 'bg-gray-800/50 border-gray-700 text-gray-400'
            }`}
          >
            {isAutoPlaying ? 'Auto-playing' : 'Paused'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenShowcase;