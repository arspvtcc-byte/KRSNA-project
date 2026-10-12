import { useState, useEffect } from 'react';
import { ModeDial } from './components/ModeDial';
import { ChatView } from './components/ChatView';
import { SettingsOverlay } from './components/SettingsOverlay';
import { MandalaBackground } from './components/MandalaBackground';
import { networkManager } from './services/network';
import type { ModeId, AuthStatus } from './types';
import { ShieldAlert, ShieldCheck, Settings } from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeMode, setActiveMode] = useState<ModeId | null>(null);
  const [dialKey, setDialKey] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [showChatUI, setShowChatUI] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('KRSNA_THEME') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('KRSNA_THEME', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('KRSNA_THEME', 'light');
    }
  }, [isDark]);

  const handleToggleTheme = () => setIsDark(prev => !prev);

  const [auth, setAuth] = useState<AuthStatus>(() => {
    let devId = localStorage.getItem('KRSNA_DEVICE_ID');
    if (!devId) {
      devId = `krsna-dev-${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem('KRSNA_DEVICE_ID', devId);
    }
    return { deviceId: devId, approved: true };
  });

  useEffect(() => {
    networkManager.resolveEndpointsFromGitHub().then(() => {
      networkManager.connectWebSocket(auth.deviceId);
    });

    const unsubscribe = networkManager.onStatusChange(connected => {
      setWsConnected(connected);
    });

    return () => unsubscribe();
  }, [auth.deviceId]);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  const handleAuthorizeDevice = () => {
    localStorage.setItem('KRSNA_APPROVED', 'true');
    setAuth(prev => ({ ...prev, approved: true }));
  };

  const handleSelectMode = (mode: ModeId) => {
    setIsZooming(true);
    setActiveMode(mode);

    setTimeout(() => {
      setShowChatUI(true);
    }, 400);

    setTimeout(() => {
      setIsZooming(false);
    }, 700);
  };

  const handleBackToDial = () => {
    setShowChatUI(false);
    setDialKey(prev => prev + 1);
    setTimeout(() => {
      setActiveMode(null);
    }, 300);
  };

  if (showSplash) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-[#000000] select-none">
        <h1 
          className="text-6xl sm:text-7xl font-black tracking-widest uppercase animate-pulse"
          style={{ color: '#F5F5DC', letterSpacing: '0.45em' }}
        >
          KRSNA
        </h1>
      </div>
    );
  }

  

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[var(--bg-app)] text-[var(--text-app)] flex flex-col">
      <MandalaBackground />

      {/* Top Header: Centered KRSNA brand + Settings only */}
      {!activeMode && (
        <header className="absolute top-0 inset-x-0 h-16 px-5 flex items-center justify-between z-30 pointer-events-auto">
          {/* Spacer on left for symmetry */}
          <div className="w-9 h-9" />

          <div className="flex items-center space-x-2">
            <span 
              className="text-xl sm:text-2xl font-black tracking-widest uppercase text-[var(--text-app)] select-none"
              style={{ letterSpacing: '0.3em' }}
            >
              KRSNA
            </span>
          </div>

          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-lg hover:bg-[#D2B48C]/30 active:scale-95 transition-all text-[var(--text-app)]"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </header>
      )}

      {/* Assembly Mode Dial */}
      <div className={`relative z-10 w-full h-full transition-opacity duration-500 ${showChatUI ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <ModeDial
          key={dialKey}
          onSelectMode={handleSelectMode}
          selectedMode={activeMode}
          isZooming={isZooming}
        />
      </div>

      {/* Morphed Chat Screen */}
      {activeMode && (
        <div className={`absolute inset-0 z-20 w-full h-full flex flex-col transition-all duration-400 ${showChatUI ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <ChatView
            mode={activeMode}
            onBack={handleBackToDial}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </div>
      )}

      {/* Half-Screen Settings Drawer */}
      <SettingsOverlay
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
      />
    </div>
  );
}
