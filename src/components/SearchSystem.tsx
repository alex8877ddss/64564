import React, { useState, useEffect } from 'react';
import { Search, Clock, TrendingUp, User, Filter, Bitcoin } from 'lucide-react';

interface SearchResult {
  type: 'address' | 'transaction' | 'token';
  value: string;
  label: string;
  timestamp?: Date;
  amount?: string;
}

const SearchSystem: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Search function
  useEffect(() => {
    if (searchTerm.length < 3) {
      setResults([]);
      return;
    }

    // Simulate search results
    const mockResults: SearchResult[] = [
      {
        type: 'address',
        value: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        label: 'Vitalik Buterin',
        timestamp: new Date()
      },
      {
        type: 'address',
        value: '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',
        label: 'Binance Hot Wallet',
        timestamp: new Date()
      },
      {
        type: 'transaction',
        value: '0x1234567890abcdef1234567890abcdef12345678',
        label: 'Recent tBTC Claim',
        amount: '0.1234 tBTC'
      },
      {
        type: 'token',
        value: 'tBTC',
        label: 'tBTC Token',
        amount: '0.1234'
      }
    ].filter(result => 
      result.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setResults(mockResults);
  }, [searchTerm]);

  const handleSearch = (value: string) => {
    if (value && !recentSearches.includes(value)) {
      const updated = [value, ...recentSearches.slice(0, 4)];
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    }
    setIsOpen(false);
    // Trigger search action here
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'address': return <User className="w-4 h-4 text-amber-400" />;
      case 'transaction': return <TrendingUp className="w-4 h-4 text-yellow-400" />;
      case 'token': return <Bitcoin className="w-4 h-4 text-orange-400" />;
      default: return <Search className="w-4 h-4 text-orange-400" />;
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder="Search addresses, transactions, tokens..."
          className="w-full pl-10 pr-4 py-3 bg-orange-800/50 border border-orange-600/50 rounded-xl text-white placeholder-orange-400 focus:border-amber-500 focus:outline-none transition-colors"
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-orange-800/95 backdrop-blur-sm border border-orange-600/50 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
          {/* Recent Searches */}
          {recentSearches.length > 0 && searchTerm.length === 0 && (
            <div className="p-4 border-b border-orange-600/30">
              <h4 className="text-sm font-medium text-orange-200 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent Searches
              </h4>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="w-full text-left px-3 py-2 text-sm text-orange-300 hover:text-white hover:bg-orange-700/50 rounded-lg transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {results.length > 0 && (
            <div className="p-4">
              <h4 className="text-sm font-medium text-orange-200 mb-3">Search Results</h4>
              <div className="space-y-2">
                {results.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(result.value)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-orange-700/50 rounded-lg transition-colors"
                  >
                    {getResultIcon(result.type)}
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-white">{result.label}</div>
                      <div className="text-xs text-orange-300 font-mono">
                        {result.value.length > 20 ? `${result.value.slice(0, 20)}...` : result.value}
                      </div>
                      {result.amount && (
                        <div className="text-xs text-yellow-400">{result.amount}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {searchTerm.length >= 3 && results.length === 0 && (
            <div className="p-8 text-center">
              <Search className="w-8 h-8 text-orange-500 mx-auto mb-3" />
              <p className="text-orange-300">No results found for "{searchTerm}"</p>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default SearchSystem;