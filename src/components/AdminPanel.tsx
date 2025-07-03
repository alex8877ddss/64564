import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Settings, Users, Database, AlertCircle, CheckCircle, X, Edit2, History, RefreshCw } from 'lucide-react';
import { airdropService } from '../services/airdrop';
import { ethplorerService } from '../services/ethplorer';
import { databaseService } from '../services/database';

interface Token {
  id: string;
  address: string;
  name: string;
  symbol: string;
  airdrop_amount: number;
  is_active: boolean;
}

interface Claim {
  id: string;
  wallet_address: string;
  tokens_claimed: any[];
  total_amount: number;
  status: string;
  created_at: string;
}

interface SettingsLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}

interface NotificationProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border ${
      type === 'success' 
        ? 'bg-green-900/20 border-green-500/30 text-green-400' 
        : 'bg-red-900/20 border-red-500/30 text-red-400'
    }`}>
      <div className="flex items-center gap-3">
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
        )}
        <span className="text-sm">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 hover:opacity-70 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tokens' | 'claims' | 'settings' | 'logs'>('tokens');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [settingsLogs, setSettingsLogs] = useState<SettingsLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [editingToken, setEditingToken] = useState<Token | null>(null);

  // Token form state
  const [newToken, setNewToken] = useState({
    address: '',
    name: '',
    symbol: '',
    airdrop_amount: 0
  });

  // Settings state
  const [apiKey, setApiKey] = useState('');
  const [platformName, setPlatformName] = useState('');
  const [maxClaims, setMaxClaims] = useState('');
  const [airdropEnabled, setAirdropEnabled] = useState(true);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };

  const logSettingsChange = async (action: string, details: string) => {
    try {
      const logEntry = {
        action,
        details,
        timestamp: new Date().toISOString()
      };
      
      // Store in local state for display
      setSettingsLogs(prev => [logEntry, ...prev]);
      
      // You could also store this in the database if needed
      await databaseService.setSetting(`log_${Date.now()}`, JSON.stringify(logEntry));
    } catch (error) {
      console.error('Error logging settings change:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tokensData, claimsData] = await Promise.all([
        airdropService.getWhitelistTokens(),
        databaseService.getClaims()
      ]);
      
      setTokens(tokensData);
      setClaims(claimsData);
      
      // Load settings
      const settings = await databaseService.getSettings();
      setApiKey(settings.ethplorer_api_key || '');
      setPlatformName(settings.platform_name || '');
      setMaxClaims(settings.max_claims_per_address || '');
      setAirdropEnabled(settings.airdrop_enabled === 'true');

      // Load settings logs (mock data for now)
      setSettingsLogs([
        { id: '1', action: 'API Key Updated', details: 'Ethplorer API key changed', timestamp: new Date().toISOString() },
        { id: '2', action: 'Platform Name Changed', details: 'Platform name updated to AirdropHub', timestamp: new Date(Date.now() - 86400000).toISOString() },
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      showNotification('error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToken = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await airdropService.addToWhitelist(
        newToken.address,
        newToken.name,
        newToken.symbol,
        newToken.airdrop_amount
      );
      
      setNewToken({ address: '', name: '', symbol: '', airdrop_amount: 0 });
      await loadData();
      await logSettingsChange('Token Added', `Added ${newToken.symbol} (${newToken.name}) with ${newToken.airdrop_amount} airdrop amount`);
      showNotification('success', 'Token successfully added to whitelist');
    } catch (error) {
      console.error('Error adding token:', error);
      showNotification('error', 'Failed to add token to whitelist');
    }
  };

  const handleEditToken = async (token: Token) => {
    try {
      await databaseService.updateToken(token.id, {
        name: token.name,
        symbol: token.symbol,
        airdrop_amount: token.airdrop_amount,
        is_active: token.is_active
      });
      
      setEditingToken(null);
      await loadData();
      await logSettingsChange('Token Updated', `Updated ${token.symbol} - Amount: ${token.airdrop_amount}, Active: ${token.is_active}`);
      showNotification('success', 'Token successfully updated');
    } catch (error) {
      console.error('Error updating token:', error);
      showNotification('error', 'Failed to update token');
    }
  };

  const handleRemoveToken = async (tokenId: string) => {
    try {
      const token = tokens.find(t => t.id === tokenId);
      await airdropService.removeFromWhitelist(tokenId);
      await loadData();
      await logSettingsChange('Token Removed', `Removed ${token?.symbol} (${token?.name}) from whitelist`);
      showNotification('success', 'Token successfully removed from whitelist');
    } catch (error) {
      console.error('Error removing token:', error);
      showNotification('error', 'Failed to remove token from whitelist');
    }
  };

  const handleClearAllTokens = async () => {
    if (!confirm('Are you sure you want to remove ALL tokens from the whitelist? This action cannot be undone.')) {
      return;
    }

    try {
      await databaseService.clearWhitelist();
      await loadData();
      await logSettingsChange('All Tokens Cleared', 'Removed all tokens from whitelist');
      showNotification('success', 'All tokens successfully removed from whitelist');
    } catch (error) {
      console.error('Error clearing all tokens:', error);
      showNotification('error', 'Failed to clear all tokens');
    }
  };

  const handleToggleToken = async (tokenId: string, isActive: boolean) => {
    try {
      const token = tokens.find(t => t.id === tokenId);
      await databaseService.updateToken(tokenId, { is_active: !isActive });
      await loadData();
      await logSettingsChange('Token Status Changed', `${token?.symbol} ${!isActive ? 'activated' : 'deactivated'}`);
      showNotification('success', `Token ${!isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error toggling token:', error);
      showNotification('error', 'Failed to update token status');
    }
  };

  const handleSaveApiKey = async () => {
    try {
      await ethplorerService.setApiKey(apiKey);
      await logSettingsChange('API Key Updated', 'Ethplorer API key was changed');
      showNotification('success', 'API key saved successfully');
    } catch (error) {
      console.error('Error saving API key:', error);
      showNotification('error', 'Failed to save API key');
    }
  };

  const handleSaveSettings = async () => {
    try {
      const oldSettings = await databaseService.getSettings();
      
      await Promise.all([
        databaseService.setSetting('platform_name', platformName),
        databaseService.setSetting('max_claims_per_address', maxClaims),
        databaseService.setSetting('airdrop_enabled', airdropEnabled.toString())
      ]);

      // Log changes
      const changes = [];
      if (oldSettings.platform_name !== platformName) changes.push(`Platform name: ${platformName}`);
      if (oldSettings.max_claims_per_address !== maxClaims) changes.push(`Max claims: ${maxClaims}`);
      if (oldSettings.airdrop_enabled !== airdropEnabled.toString()) changes.push(`Airdrop enabled: ${airdropEnabled}`);
      
      if (changes.length > 0) {
        await logSettingsChange('Settings Updated', changes.join(', '));
      }

      showNotification('success', 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('error', 'Failed to save settings');
    }
  };

  const renderTokensTab = () => (
    <div className="space-y-6">
      {/* Add Token Form */}
      <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Add New Token</h3>
          <button
            onClick={handleClearAllTokens}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>
        <form onSubmit={handleAddToken} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Token Address"
            value={newToken.address}
            onChange={(e) => setNewToken({ ...newToken, address: e.target.value })}
            className="bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            required
          />
          <input
            type="text"
            placeholder="Token Name"
            value={newToken.name}
            onChange={(e) => setNewToken({ ...newToken, name: e.target.value })}
            className="bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            required
          />
          <input
            type="text"
            placeholder="Symbol"
            value={newToken.symbol}
            onChange={(e) => setNewToken({ ...newToken, symbol: e.target.value })}
            className="bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            required
          />
          <input
            type="number"
            placeholder="Airdrop Amount"
            value={newToken.airdrop_amount}
            onChange={(e) => setNewToken({ ...newToken, airdrop_amount: parseInt(e.target.value) || 0 })}
            className="bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            required
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Token
          </button>
        </form>
      </div>

      {/* Tokens List */}
      <div className="bg-gray-700/30 rounded-xl border border-gray-600/30 overflow-hidden">
        <div className="p-6 border-b border-gray-600/30 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Whitelist Tokens ({tokens.length})</h3>
          <button
            onClick={loadData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="text-left p-4 text-gray-300 font-medium">Token</th>
                <th className="text-left p-4 text-gray-300 font-medium">Address</th>
                <th className="text-left p-4 text-gray-300 font-medium">Airdrop Amount</th>
                <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => (
                <tr key={token.id} className="border-t border-gray-600/30">
                  <td className="p-4">
                    {editingToken?.id === token.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editingToken.name}
                          onChange={(e) => setEditingToken({ ...editingToken, name: e.target.value })}
                          className="w-full bg-gray-800/50 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                        />
                        <input
                          type="text"
                          value={editingToken.symbol}
                          onChange={(e) => setEditingToken({ ...editingToken, symbol: e.target.value })}
                          className="w-full bg-gray-800/50 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="text-white font-medium">{token.name}</div>
                        <div className="text-gray-400 text-sm">{token.symbol}</div>
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-gray-300 font-mono text-sm">
                    {token.address.slice(0, 10)}...{token.address.slice(-8)}
                  </td>
                  <td className="p-4">
                    {editingToken?.id === token.id ? (
                      <input
                        type="number"
                        value={editingToken.airdrop_amount}
                        onChange={(e) => setEditingToken({ ...editingToken, airdrop_amount: parseInt(e.target.value) || 0 })}
                        className="w-full bg-gray-800/50 border border-gray-600 rounded px-2 py-1 text-white text-sm"
                      />
                    ) : (
                      <span className="text-gray-300">{token.airdrop_amount.toLocaleString()}</span>
                    )}
                  </td>
                  <td className="p-4">
                    {editingToken?.id === token.id ? (
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingToken.is_active}
                          onChange={(e) => setEditingToken({ ...editingToken, is_active: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <span className="text-white text-sm">Active</span>
                      </label>
                    ) : (
                      <button
                        onClick={() => handleToggleToken(token.id, token.is_active)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          token.is_active
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {token.is_active ? 'Active' : 'Inactive'}
                      </button>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {editingToken?.id === token.id ? (
                        <>
                          <button
                            onClick={() => handleEditToken(editingToken)}
                            className="text-green-400 hover:text-green-300 transition-colors"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingToken(null)}
                            className="text-gray-400 hover:text-gray-300 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingToken(token)}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveToken(token.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderClaimsTab = () => (
    <div className="bg-gray-700/30 rounded-xl border border-gray-600/30 overflow-hidden">
      <div className="p-6 border-b border-gray-600/30">
        <h3 className="text-lg font-semibold text-white">Airdrop Claims</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800/50">
            <tr>
              <th className="text-left p-4 text-gray-300 font-medium">Wallet Address</th>
              <th className="text-left p-4 text-gray-300 font-medium">Tokens Claimed</th>
              <th className="text-left p-4 text-gray-300 font-medium">Total Amount</th>
              <th className="text-left p-4 text-gray-300 font-medium">Status</th>
              <th className="text-left p-4 text-gray-300 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => (
              <tr key={claim.id} className="border-t border-gray-600/30">
                <td className="p-4 text-gray-300 font-mono text-sm">
                  {claim.wallet_address.slice(0, 10)}...{claim.wallet_address.slice(-8)}
                </td>
                <td className="p-4 text-gray-300">{claim.tokens_claimed.length}</td>
                <td className="p-4 text-gray-300">{claim.total_amount.toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    claim.status === 'completed'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : claim.status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {claim.status}
                  </span>
                </td>
                <td className="p-4 text-gray-400 text-sm">
                  {new Date(claim.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      {/* API Settings */}
      <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
        <h3 className="text-lg font-semibold text-white mb-4">API Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Ethplorer API Key
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
                placeholder="Enter your Ethplorer API key"
              />
              <button
                onClick={handleSaveApiKey}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Settings */}
      <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
        <h3 className="text-lg font-semibold text-white mb-4">Platform Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Platform Name
            </label>
            <input
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              placeholder="Enter platform name"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Max Claims Per Address
            </label>
            <input
              type="number"
              value={maxClaims}
              onChange={(e) => setMaxClaims(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
              placeholder="Enter max claims per address"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="airdropEnabled"
              checked={airdropEnabled}
              onChange={(e) => setAirdropEnabled(e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="airdropEnabled" className="text-gray-300 text-sm font-medium">
              Enable Airdrop Claims
            </label>
          </div>

          <button
            onClick={handleSaveSettings}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );

  const renderLogsTab = () => (
    <div className="bg-gray-700/30 rounded-xl border border-gray-600/30 overflow-hidden">
      <div className="p-6 border-b border-gray-600/30">
        <h3 className="text-lg font-semibold text-white">Settings Change Log</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {settingsLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-4 p-4 bg-gray-800/30 rounded-lg border border-gray-600/30">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <History className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-white">{log.action}</h4>
                  <span className="text-xs text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{log.details}</p>
              </div>
            </div>
          ))}
          {settingsLogs.length === 0 && (
            <div className="text-center py-8">
              <History className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No settings changes logged yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-400 mt-1">Manage your airdrop platform</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('tokens')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'tokens'
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Database className="w-4 h-4" />
              Tokens
            </button>
            <button
              onClick={() => setActiveTab('claims')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'claims'
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Users className="w-4 h-4" />
              Claims
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                activeTab === 'logs'
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-purple-500/10'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <History className="w-4 h-4" />
              Logs
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'tokens' && renderTokensTab()}
            {activeTab === 'claims' && renderClaimsTab()}
            {activeTab === 'settings' && renderSettingsTab()}
            {activeTab === 'logs' && renderLogsTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;