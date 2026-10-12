import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sun, RefreshCw, CheckCircle2, User, ChevronRight, ArrowLeft, Download } from 'lucide-react';
import type { UserProfile } from '../types';
import { networkManager } from '../services/network';

interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

const CURRENT_VERSION = '0.1.0-alpha';

export const SettingsOverlay: FC<SettingsOverlayProps> = ({
  isOpen,
  onClose,
  isDark,
  onToggleTheme
}) => {
  const [currentView, setCurrentView] = useState<'main' | 'profile'>('main');
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('KRSNA_PROFILE');
    return saved ? JSON.parse(saved) : {
      name: '',
      age: '',
      language: 'English',
      timezone: 'Asia/Kolkata',
      communicationStyle: 'Direct and concise',
      personalGoals: '',
      relationshipStatus: '',
      academicFocus: '',
      financialPriorities: '',
      coreValues: ''
    };
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');
  const [downloadLink, setDownloadLink] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = networkManager.onMessage((data) => {
      if (data.type === 'UPDATE_RESPONSE') {
        setCheckingUpdate(false);
        if (data.hasUpdate) {
          const config = networkManager.getConfig();
          const apkUrl = data.downloadPath ? `${config.httpBase}${data.downloadPath}` : null;
          setDownloadLink(apkUrl);
          setUpdateMsg(`New build ${data.latestVersion} available: ${data.releaseNotes || 'Update available'}`);
        } else {
          setDownloadLink(null);
          setUpdateMsg(`KRSNA build is up to date (v${CURRENT_VERSION}).`);
        }
      } else if (data.type === 'UPDATE_PUSH') {
        const config = networkManager.getConfig();
        const apkUrl = data.downloadPath ? `${config.httpBase}${data.downloadPath}` : null;
        setDownloadLink(apkUrl);
        setUpdateMsg(`Urgent update released: ${data.latestVersion}`);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSaveProfile = () => {
    localStorage.setItem('KRSNA_PROFILE', JSON.stringify(profile));
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setCurrentView('main');
    }, 1200);
  };

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    setUpdateMsg('');
    setDownloadLink(null);

    const sent = networkManager.sendMessage({
      type: 'CHECK_UPDATE',
      clientVersion: CURRENT_VERSION,
      platform: 'android'
    });

    if (!sent) {
      try {
        const config = networkManager.getConfig();
        const res = await fetch(`${config.httpBase}/api/version`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setCheckingUpdate(false);
          if (data.latestVersion && data.latestVersion !== CURRENT_VERSION) {
            setDownloadLink(data.downloadPath ? `${config.httpBase}${data.downloadPath}` : null);
            setUpdateMsg(`Update available: v${data.latestVersion}`);
          } else {
            setUpdateMsg(`KRSNA build is up to date (v${CURRENT_VERSION}).`);
          }
          return;
        }
      } catch (err) {
        console.warn('Update check failed over HTTP fallback:', err);
      }

      setCheckingUpdate(false);
      setUpdateMsg('Could not reach KRSNA update hub. Check connection.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="relative w-full max-w-sm sm:max-w-md h-full bg-[var(--bg-main)] border-l border-[var(--border-dial)] shadow-2xl flex flex-col z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-dial)]">
              <div className="flex items-center space-x-2">
                {currentView === 'profile' && (
                  <button
                    onClick={() => setCurrentView('main')}
                    className="p-1.5 rounded-lg border border-[var(--border-dial)] hover:bg-[#D2B48C]/20 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4 text-[var(--accent-gold)]" />
                  </button>
                )}
                <h2 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                  {currentView === 'profile' ? 'Profile Setup' : 'Settings'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg border border-[var(--border-dial)] hover:bg-[#D2B48C]/20 transition-all"
              >
                <X className="w-4 h-4 text-[var(--accent-gold)]" />
              </button>
            </div>

            {/* View 1: Main Settings */}
            {currentView === 'main' ? (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <button
                  onClick={() => setCurrentView('profile')}
                  className="w-full p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-dial)] flex items-center justify-between hover:bg-[#D2B48C]/15 active:scale-98 transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-[#D2B48C]/30 border border-[var(--border-dial)] text-[var(--accent-gold)]">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                        User Profile
                      </p>
                      <p className="text-[10px] font-mono opacity-60">
                        {profile.name ? `${profile.name} • Configured` : 'Not configured'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </button>

                <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-dial)] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-[#D2B48C]/30 border border-[var(--border-dial)] text-[var(--accent-gold)]">
                      {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">Theme</p>
                      <p className="text-[10px] font-mono opacity-60">{isDark ? 'Dark Mode' : 'Light Mode'}</p>
                    </div>
                  </div>
                  <button
                    onClick={onToggleTheme}
                    className="px-3 py-1.5 rounded-xl bg-[#D2B48C]/40 border border-[var(--border-dial)] text-[11px] font-bold active:scale-95 transition-all"
                  >
                    Switch
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-dial)] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] sm:text-xs uppercase font-bold tracking-wider">Build</p>
                      <p className="text-[9px] font-mono opacity-60">v{CURRENT_VERSION}</p>
                    </div>
                    <button
                      onClick={handleCheckUpdate}
                      disabled={checkingUpdate}
                      className="px-2.5 py-1.5 rounded-xl bg-[#D2B48C]/40 border border-[var(--border-dial)] text-[11px] font-bold flex items-center space-x-1 active:scale-95 transition-all"
                    >
                      <RefreshCw className={`w-3 h-3 ${checkingUpdate ? 'animate-spin' : ''}`} />
                      <span>Update</span>
                    </button>
                  </div>
                  {updateMsg && (
                    <p className="text-[10px] text-[var(--accent-gold)] font-mono leading-tight">{updateMsg}</p>
                  )}
                  {downloadLink && (
                    <a
                      href={downloadLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 mt-1 rounded-xl bg-[var(--accent-gold)] text-black text-[11px] font-bold active:scale-95 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Latest APK</span>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              /* View 2: Profile Form */
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                <p className="font-bold text-[10px] sm:text-xs uppercase tracking-widest text-[#8B0000] font-mono">
                  10 Parameters
                </p>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider block mb-1">Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-dial)] focus:outline-none"
                    placeholder="Your Name"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider block mb-1">Age</label>
                  <input
                    type="text"
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-dial)] focus:outline-none"
                    placeholder="Age"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider block mb-1">Language</label>
                  <input
                    type="text"
                    value={profile.language}
                    onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-dial)] focus:outline-none"
                    placeholder="English / Hindi / Hinglish"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider block mb-1">Personal Goals</label>
                  <textarea
                    rows={2}
                    value={profile.personalGoals}
                    onChange={(e) => setProfile({ ...profile, personalGoals: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-dial)] focus:outline-none resize-none"
                    placeholder="Your main goals..."
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider block mb-1">Core Values</label>
                  <textarea
                    rows={2}
                    value={profile.coreValues}
                    onChange={(e) => setProfile({ ...profile, coreValues: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-dial)] focus:outline-none resize-none"
                    placeholder="Core principles & values..."
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveProfile}
                    className="w-full py-2.5 rounded-xl bg-[var(--accent-gold)] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-md active:scale-95 transition-all"
                  >
                    {savedSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Saved</span>
                      </>
                    ) : (
                      <span>Save Profile</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
