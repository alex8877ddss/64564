import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface ShowcaseToken {
  symbol: string;
  name: string;
  icon: string;
}

const TokenShowcase: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const showcaseTokens: ShowcaseToken[] = [
    {
      symbol: 'SHIB',
      name: 'Shiba Inu',
      icon: 'https://assets.coingecko.com/coins/images/11939/small/shiba.png'
    },
    {
      symbol: 'LINK',
      name: 'Chainlink',
      icon: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png'
    },
    {
      symbol: 'UNI',
      name: 'Uniswap',
      icon: 'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png'
    },
    {
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      icon: 'https://assets.coingecko.com/coins/images/9956/small/4943.png'
    },
    {
      symbol: 'MATIC',
      name: 'Polygon',
      icon: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png'
    },
    {
      symbol: 'WBTC',
      name: 'Wrapped Bitcoin',
      icon: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png'
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % showcaseTokens.length);
    }, 2500);

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
    for (let i = 0; i < 5; i++) {
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

        {/* Token Icons Only - Clean Carousel */}
        <div className="flex gap-4 px-12 overflow-hidden">
          {getVisibleTokens().map((token, displayIndex) => (
            <div
              key={`${token.symbol}-${token.index}`}
              className={`flex-1 transition-all duration-500 ${
                displayIndex === 2 ? 'scale-125' : displayIndex === 1 || displayIndex === 3 ? 'scale-110' : 'scale-95 opacity-60'
              }`}
            >
              <div className="text-center">
                <div className={`mx-auto mb-3 bg-white rounded-full p-3 shadow-lg transition-all duration-500 ${
                  displayIndex === 2 ? 'w-20 h-20' : 'w-16 h-16'
                }`}>
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
                
                <h4 className={`font-bold text-white transition-all duration-500 ${
                  displayIndex === 2 ? 'text-lg' : 'text-base'
                }`}>
                  {token.symbol}
                </h4>
                <p className={`text-gray-400 transition-all duration-500 ${
                  displayIndex === 2 ? 'text-sm' : 'text-xs'
                }`}>
                  {token.name}
                </p>
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
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white w-8' 
                  : 'bg-gray-600 hover:bg-gray-500 w-2'
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