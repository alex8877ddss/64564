import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, Zap, Bell } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'claim';
  title: string;
  message: string;
  timestamp: Date;
  duration?: number;
}

interface NotificationSystemProps {
  onNotificationAdd?: (notification: Notification) => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ onNotificationAdd }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Auto-remove notifications
  useEffect(() => {
    const timer = setInterval(() => {
      setNotifications(prev => 
        prev.filter(notification => {
          const age = Date.now() - notification.timestamp.getTime();
          const duration = notification.duration || 5000;
          return age < duration;
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Play notification sound
  const playNotificationSound = (type: string) => {
    if (!soundEnabled) return;
    
    // Create audio context for notification sounds
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different frequencies for different notification types
    const frequencies = {
      success: 800,
      error: 400,
      info: 600,
      claim: 1000
    };
    
    oscillator.frequency.setValueAtTime(frequencies[type as keyof typeof frequencies] || 600, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Keep max 5 notifications
    playNotificationSound(notification.type);
    
    if (onNotificationAdd) {
      onNotificationAdd(newNotification);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'claim': return <Zap className="w-5 h-5 text-orange-400" />;
      default: return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-900/20 border-emerald-500/30';
      case 'error': return 'bg-red-900/20 border-red-500/30';
      case 'claim': return 'bg-orange-900/20 border-orange-500/30';
      default: return 'bg-blue-900/20 border-blue-500/30';
    }
  };

  // Expose addNotification globally for other components
  React.useEffect(() => {
    (window as any).addNotification = addNotification;
    return () => {
      delete (window as any).addNotification;
    };
  }, []);

  return (
    <>
      {/* Sound Toggle */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className={`fixed top-4 right-20 z-50 p-2 rounded-lg border transition-all ${
          soundEnabled 
            ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' 
            : 'bg-slate-700/50 border-slate-600/50 text-slate-400'
        }`}
        title={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
      >
        <Bell className="w-4 h-4" />
      </button>

      {/* Notifications Container */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-xl border backdrop-blur-sm shadow-lg animate-slide-in-right ${getStyles(notification.type)}`}
          >
            <div className="flex items-start gap-3">
              {getIcon(notification.type)}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white text-sm">{notification.title}</h4>
                <p className="text-xs text-slate-300 mt-1">{notification.message}</p>
                <p className="text-xs text-slate-500 mt-2">
                  {notification.timestamp.toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default NotificationSystem;