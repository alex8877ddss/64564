import React, { useState, useMemo } from 'react';
import { CheckCircle, XCircle, Coins, Search, SortAsc, SortDesc, ChevronDown, ChevronUp, Wallet, TrendingUp, Filter } from 'lucide-react';
import { Token, WhitelistToken } from '../types';

interface TokenListProps {
  tokens: Token[];
  ethBalance: number;
  ethPrice?: number;
  eligibleTokens: WhitelistToken[];
  loading: boolean;
  currentAddress: string;
}

const TokenList: React.FC<TokenListProps> = ({ 
  tokens, 
  ethBalance, 
  ethPrice, 
  eligibleTokens, 
  loading,
  currentAddress
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'balance' | 'value' | 'name'>('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showOnlyEligible, setShowOnlyEligible] = useState(false);
  const [showOnlyWithBalance, setShowOnlyWithBalance] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const formatBalance = (balance: number, decimals: number) => {
    const formatted = balance / Math.pow(10, decimals);
    return formatted.toLocaleString(undefined, { 
      maximumFractionDigits: 4,
      minimumFractionDigits: 0 
    });
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString(undefined, { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const isTokenEligible = (tokenAddress: string) => {
    return eligibleTokens.some(
      eligible => eligible.address.toLowerCase() === tokenAddress.toLowerCase()
    );
  };

  const getTokenValue = (token: Token) => {
    if (!token.tokenInfo.price) return 0;
    return (token.balance / Math.pow(10, token.tokenInfo.decimals)) * token.tokenInfo.price.rate;
  };

  const filteredAndSortedTokens = useMemo(() => {
    let filtered = tokens.filter(token => {
      const matchesSearch = token.tokenInfo.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           token.tokenInfo.symbol?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const hasBalance = token.balance > 0;
      const isEligible = isTokenEligible(token.tokenInfo.address);
      
      if (showOnlyWithBalance && !hasBalance) return false;
      if (showOnlyEligible && !isEligible) return false;
      
      return matchesSearch;
    });

    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'balance':
          aValue = a.balance / Math.pow(10, a.tokenInfo.decimals);
          bValue = b.balance / Math.pow(10, b.tokenInfo.decimals);
          break;
        case 'value':
          aValue = getTokenValue(a);
          bValue = getTokenValue(b);
          break;
        case 'name':
          aValue = a.tokenInfo.name || '';
          bValue = b.tokenInfo.name || '';
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [tokens, searchTerm, sortBy, sortOrder, showOnlyEligible, showOnlyWithBalance, eligibleTokens]);

  const displayedTokens = isExpanded ? filteredAndSortedTokens : filteredAndSortedTokens.slice(0, 6);

  const totalPortfolioValue = useMemo(() => {
    const ethValue = ethBalance * (ethPrice || 0);
    const tokensValue = tokens.reduce((sum, token) => sum + getTokenValue(token), 0);
    return ethValue + tokensValue;
  }, [tokens, ethBalance, ethPrice]);

  // Show empty state when no address is provided
  if (!currentAddress) {
    return (
      <div className="h-full bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Wallet className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-4">Portfolio Analysis</h3>
          <p className="text-slate-400 mb-6 leading-relaxed max-w-md mx-auto">
            Connect your wallet or enter an Ethereum address to view detailed token portfolio analysis and airdrop eligibility.
          </p>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
            <h4 className="text-blue-400 font-medium mb-2">What you'll see:</h4>
            <ul className="text-sm text-blue-300 space-y-1 text-left">
              <li>• Complete token portfolio breakdown</li>
              <li>• Real-time USD values and balances</li>
              <li>• Airdrop eligibility analysis</li>
              <li>• Advanced filtering and sorting options</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Coins className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Analyzing Portfolio...</h3>
          <p className="text-sm text-slate-400">Fetching token data and calculating values</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-800/40 backdrop-blur-sm border border-slate-700/30 rounded-xl flex flex-col overflow-hidden">
      {/* Header with Portfolio Value */}
      <div className="p-6 border-b border-slate-700/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Portfolio Analysis</h3>
              <p className="text-sm text-slate-400">
                {filteredAndSortedTokens.length + 1} assets • {eligibleTokens.length} eligible for airdrops
              </p>
            </div>
          </div>
          
          {totalPortfolioValue > 0 && (
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-slate-400">Total Value</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {formatPrice(totalPortfolioValue)}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tokens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-colors text-sm"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'balance' | 'value' | 'name')}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:border-indigo-500 focus:outline-none transition-colors text-sm"
            >
              <option value="value">Sort by Value</option>
              <option value="balance">Sort by Balance</option>
              <option value="name">Sort by Name</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white hover:bg-slate-600/50 transition-colors"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowOnlyEligible(!showOnlyEligible)}
              className={`px-3 py-2 rounded-lg border transition-colors text-xs font-medium ${
                showOnlyEligible 
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                  : 'bg-slate-700/50 border-slate-600/50 text-slate-400 hover:bg-slate-600/50'
              }`}
            >
              <Filter className="w-3 h-3 inline mr-1" />
              Airdrop Eligible
            </button>
            <button
              onClick={() => setShowOnlyWithBalance(!showOnlyWithBalance)}
              className={`px-3 py-2 rounded-lg border transition-colors text-xs font-medium ${
                showOnlyWithBalance 
                  ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' 
                  : 'bg-slate-700/50 border-slate-600/50 text-slate-400 hover:bg-slate-600/50'
              }`}
            >
              With Balance
            </button>
          </div>
        </div>
      </div>

      {/* Token List */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-3">
          {/* ETH Balance */}
          <div className="flex items-center justify-between p-3 border border-slate-600/50 rounded-lg bg-slate-700/30 hover:bg-slate-700/40 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-800 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">ETH</span>
              </div>
              <div>
                <h4 className="font-semibold text-white">Ethereum</h4>
                <p className="text-xs text-slate-400">ETH • Native Token</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-white">
                {ethBalance.toFixed(4)} ETH
              </p>
              {ethPrice && ethBalance > 0 && (
                <p className="text-xs text-slate-400">
                  {formatPrice(ethBalance * ethPrice)}
                </p>
              )}
            </div>
          </div>

          {/* Token List */}
          {displayedTokens.map((token, index) => {
            const isEligible = isTokenEligible(token.tokenInfo.address);
            const tokenValue = getTokenValue(token);
            
            return (
              <div
                key={index}
                className={`flex items-center justify-between p-3 border rounded-lg transition-all hover:shadow-md ${
                  isEligible 
                    ? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15' 
                    : 'border-slate-600/50 bg-slate-700/20 hover:bg-slate-700/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xs">
                      {token.tokenInfo.symbol?.slice(0, 3) || '?'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white text-sm">
                        {token.tokenInfo.name || 'Unknown Token'}
                      </h4>
                      {isEligible ? (
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <XCircle className="w-3 h-3 text-slate-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-slate-400">{token.tokenInfo.symbol}</p>
                      {isEligible && (
                        <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                          Eligible
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white text-sm">
                    {formatBalance(token.balance, token.tokenInfo.decimals)} {token.tokenInfo.symbol}
                  </p>
                  {tokenValue > 0 && (
                    <p className="text-xs text-slate-400">
                      {formatPrice(tokenValue)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {filteredAndSortedTokens.length > 6 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-center gap-2 p-3 border border-slate-600/50 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/30 transition-colors"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show Less Tokens
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show {filteredAndSortedTokens.length - 6} More Tokens
                </>
              )}
            </button>
          )}

          {filteredAndSortedTokens.length === 0 && tokens.length > 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Coins className="w-8 h-8 text-slate-500" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">No Tokens Found</h4>
              <p className="text-slate-400">No tokens match your current filters</p>
            </div>
          )}

          {tokens.length === 0 && ethBalance === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Coins className="w-8 h-8 text-slate-500" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">No Tokens Found</h4>
              <p className="text-slate-400">This address doesn't hold any tokens</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenList;