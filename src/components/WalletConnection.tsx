import React, { useState } from 'react';
import { Wallet, ExternalLink, Copy, CheckCircle, Zap, LogOut, AlertCircle, Shield, Bitcoin } from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';

interface WalletConnectionProps {
  onAddressChange: (address: string) => void;
  currentAddress: string;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({ onAddressChange, currentAddress }) => {
  const { isConnected, account, isMetaMaskInstalled, isConnecting, connectWallet, disconnectWallet } = useWeb3();
  const [manualAddress, setManualAddress] = useState('');
  const [useManualInput, setUseManualInput] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addressError, setAddressError] = useState('');

  React.useEffect(() => {
    if (account) {
      onAddressChange(account);
    }
  }, [account, onAddressChange]);

  const isValidEthereumAddress = (address: string): boolean => {
    // Check if it's a valid Ethereum address format
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethAddressRegex.test(address);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError('');
    
    if (!manualAddress.trim()) {
      setAddressError('Please enter an address');
      return;
    }

    if (!isValidEthereumAddress(manualAddress.trim())) {
      setAddressError('Please enter a valid Ethereum address (0x...)');
      return;
    }

    onAddressChange(manualAddress.trim());
  };

  const handleDisconnect = () => {
    disconnectWallet();
    onAddressChange('');
    setUseManualInput(false);
    setManualAddress('');
    setAddressError('');
  };

  const copyAddress = async () => {
    await navigator.clipboard.writeText(currentAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && currentAddress) {
    return (
      <div className="bg-black/40 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-white to-gray-300 rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircle className="w-5 h-5 text-black" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Wallet Connected</h3>
              <p className="text-xs text-gray-400">MetaMask • Secure Connection</p>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 font-medium transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10 border border-red-500/20"
          >
            <LogOut className="w-3 h-3" />
            Disconnect
          </button>
        </div>

        <div className="bg-black/50 rounded-lg p-3 mb-3 border border-gray-700">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-gray-300">{formatAddress(currentAddress)}</span>
            <button
              onClick={copyAddress}
              className="flex items-center gap-2 text-white hover:text-gray-300 text-xs font-medium transition-colors px-2 py-1 rounded hover:bg-white/10"
            >
              {copied ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => setUseManualInput(!useManualInput)}
            className="text-xs text-white hover:text-gray-300 font-medium transition-colors"
          >
            Use different address
          </button>
        </div>

        {useManualInput && (
          <form onSubmit={handleManualSubmit} className="mt-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={manualAddress}
                onChange={(e) => {
                  setManualAddress(e.target.value);
                  setAddressError('');
                }}
                placeholder="Enter Ethereum address"
                className="flex-1 px-3 py-2 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-white focus:border-white text-xs"
              />
              <button
                type="submit"
                disabled={!manualAddress.trim()}
                className="px-3 py-2 bg-gradient-to-r from-white to-gray-300 text-black rounded-lg hover:from-gray-200 hover:to-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium transition-all"
              >
                Use
              </button>
            </div>
            {addressError && (
              <div className="mt-2 flex items-center gap-2 text-red-400 text-xs">
                <AlertCircle className="w-3 h-3" />
                {addressError}
              </div>
            )}
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
      <div className="text-center">
        <div className="w-12 h-12 bg-gradient-to-r from-black to-gray-800 border-2 border-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Connect Your Wallet</h3>
        <p className="text-gray-400 mb-4 text-sm">Connect MetaMask or enter address manually to earn tBTC</p>

        <div className="space-y-3">
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-white to-gray-300 text-black py-3 px-4 rounded-lg font-medium hover:from-gray-200 hover:to-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            {isConnecting ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
          </button>

          {!isMetaMaskInstalled && (
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white hover:text-gray-300 text-xs font-medium"
            >
              Install MetaMask <ExternalLink className="w-3 h-3" />
            </a>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-black text-gray-400">or</span>
            </div>
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-3">
            <input
              type="text"
              value={manualAddress}
              onChange={(e) => {
                setManualAddress(e.target.value);
                setAddressError('');
              }}
              placeholder="Enter Ethereum address (0x...)"
              className="w-full px-4 py-3 bg-black/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-white focus:border-white text-sm"
            />
            {addressError && (
              <div className="flex items-center gap-2 text-red-400 text-xs">
                <AlertCircle className="w-3 h-3" />
                {addressError}
              </div>
            )}
            <button
              type="submit"
              disabled={!manualAddress.trim()}
              className="w-full bg-black/50 text-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-black/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-gray-700 text-sm"
            >
              Check Address
            </button>
          </form>
        </div>

        <div className="mt-4 bg-black/20 border border-gray-700 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <Bitcoin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <p className="text-gray-400 text-xs font-medium mb-1">Earn tBTC Rewards</p>
              <p className="text-gray-500 text-xs leading-relaxed">
                Hold whitelisted tokens to earn tBTC rewards. Your wallet remains under your control - we never store private keys.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletConnection;