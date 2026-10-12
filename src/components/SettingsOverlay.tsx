import { useState } from 'react';
import type { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Moon, Sun, RefreshCw, CheckCircle2, User, ChevronRight, ArrowLeft } from 'lucide-react';
import type { UserProfile } from '../types';

interface SettingsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

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

  const handleSaveProfile = () => {
    localStorage.setItem('KRSNA_PROFILE', JSON.stringify(profile));
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setCurrentView('main');
    }, 1200);
  };

  const handleCheckUpdate = () => {
    setCheckingUpdate(true);
    setUpdateMsg('');
    setTimeout(() => {
      setCheckingUpdate(false);
      setUpdateMsg('KRSNA build is up to date (v0.1.0-alpha).');
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          {/* Backdrop covering the left half with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setCurrentView('main'); onClose(); }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Locked to exactly 50% width */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative w-1/2 h-full bg-[var(--bg-app)] text-[var(--text-app)] border-l border-[var(--border-dial)] shadow-2xl flex flex-col z-10 select-none"
          >
            {/* Drawer Header */}
            <div className="p-3 sm:p-4 border-b border-[var(--border-dial)] flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                {currentView === 'profile' && (
                  <button 
                    onClick={() => setCurrentView('main')} 
                    className="p-1 rounded-lg hover:bg-[#D2B48C]/30 text-[var(--text-app)] mr-1 active:scale-95 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                )}
                <h2 className="font-black text-xs sm:text-base tracking-wider uppercase truncate">
                  {currentView === 'profile' ? 'Profile' : 'Settings'}
                </h2>
              </div>
              <button 
                onClick={() => { setCurrentView('main'); onClose(); }} 
                className="p-1 rounded-lg hover:bg-[#D2B48C]/30 text-[var(--text-app)] active:scale-95 transition-all"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* View 1: Main Drawer Navigation */}
            {currentView === 'main' ? (
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
                <button
                  onClick={() => setCurrentView('profile')}
                  className="w-full p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-dial)] flex items-center justify-between hover:border-[#8B0000] active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#D2B48C]/30 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-[#8B0000]" />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="font-bold text-xs sm:text-sm tracking-wide truncate">Profile</p>
                      <p className="text-[10px] text-[var(--text-app)] opacity-60 truncate">
                        {profile.name || 'Set attributes'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-60 shrink-0" />
                </button>

                <hr className="border-[var(--border-dial)] opacity-60" />

                <div className="flex items-center justify-between px-1">
                  <div>
                    <p className="text-[11px] sm:text-xs uppercase font-bold tracking-wider">Theme</p>
                    <p className="text-[10px] opacity-60">{isDark ? 'Dark Mode' : 'Light (Beige)'}</p>
                  </div>
                  <button
                    onClick={onToggleTheme}
                    className="p-2 rounded-xl border border-[var(--border-dial)] flex items-center space-x-1.5 text-xs font-semibold bg-[var(--input-bg)] active:scale-95 transition-all"
                  >
                    {isDark ? <Moon className="w-3.5 h-3.5 text-[#8B0000]" /> : <Sun className="w-3.5 h-3.5 text-[#D2B48C]" />}
                    <span className="text-[10px] sm:text-xs">{isDark ? 'Dark' : 'Beige'}</span>
                  </button>
                </div>

                <hr className="border-[var(--border-dial)] opacity-60" />

                <div className="space-y-2 px-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] sm:text-xs uppercase font-bold tracking-wider">Build</p>
                      <p className="text-[9px] font-mono opacity-60">v0.1.0-alpha</p>
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
                    <p className="text-[10px] text-[#8B0000] font-mono leading-tight">{updateMsg}</p>
                  )}
                </div>
              </div>
            ) : (
              /* View 2: Nested Profile Form */
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
                <p className="font-bold text-[10px] sm:text-xs uppercase tracking-widest text-[#8B0000] font-mono">
                  10 Parameters
                </p>

                <div>
                  <label className="text-[10px] uppercase font-semibold opacity-70">1. Name</label>
                  <input 
                    type="text" 
                    value={profile.name} 
                    onChange={e => setProfile({...profile, name: e.target.value})} 
                    className="w-full mt-0.5 p-1.5 bg-[var(--input-bg)] border border-[var(--border-dial)] rounded-lg text-xs text-[var(--text-app)] outline-none"
                    placeholder="User Name"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-semibold opacity-70">2. Age</label>
                  <input 
                    type="text" 
                    value={profile.age} 
                    onChange={e => setProfile({...profile, age: e.target.value})} 
                    className="w-full mt-0.5 p-1.5 bg-[var(--input-bg)] border border-[var(--border-dial)] rounded-lg text-xs text-[var(--text-app)] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-semibold opacity-70">3. Language</label>
                  <input 
                    type="text" 
                    value={profile.language} 
                    onChange={e => setProfile({...profile, language: e.target.value})} 
                    className="w-full mt-0.5 p-1.5 bg-[var(--input-bg)] border border-[var(--border-dial)] rounded-lg text-xs text-[var(--text-app)] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-semibold opacity-70">4. Comm. Style</label>
                  <input 
                    type="text" 
                    value={profile.communicationStyle} 
                    onChange={e => setProfile({...profile, communicationStyle: e.target.value})} 
                    className="w-full mt-0.5 p-1.5 bg-[var(--input-bg)] border border-[var(--border-dial)] rounded-lg text-xs text-[var(--text-app)] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-semibold opacity-70">5. Timezone</label>
                  <input 
                    type="text" 
                    value={profile.timezone} 
                    onChange={e => setProfile({...profile, timezone: e.target.value})} 
                    className="w-full mt-0.5 p-1.5 bg-[var(--input-bg)] border border-[var(--border-dial)] rounded-lg text-xs text-[var(--text-app)] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-semibold opacity-70">6. Goals</label>
                  <input 
                    type="text" 
                    value={profile.personalGoals} 
                    onChange={e => setProfile({...profile, personalGoals: e.target.value})} 
                    className="w-full mt-0.5 p-1.5 bg-[var(--input-bg)] border border-[var(--border-dial)] rounded-lg text-xs text-[var(--text-app)] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-semibold opacity-70">7. Focus</label>
                  <input 
                    type="text" 
                    value={profile.academicFocus} 
                    onChange={e => setProfile({...profile, academicFocus: e.target.value})} 
                    className="w-full mt-0.5 p-1.5 bg-[var(--input-bg)] border border-[var(--border-dial)] rounded-lg text-xs text-[var(--text-app)] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-semibold opacity-70">8. Financials</label>
                  <input 
                    type="text" 
                    value={profile.financialPriorities} 
                    onChange={e => setProfile({...profile, financialPriorities: e.target.value})} 
                    className="w-full mt-0.5 p-1.5 bg-[var(--input-bg)] border border-[var(--border-dial)] rounded-lg text-xs text-[var(--text-app)] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-semibold opacity-70">9. Relationships</label>
                  <input 
                    type="text" 
                    value={profile.relationshipStatus} 
                    onChange={e => setProfile({...profile, relationshipStatus: e.target.value})} 
                    className="w-full mt-0.5 p-1.5 bg-[var(--input-bg)] border border-[var(--border-dial)] rounded-lg text-xs text-[var(--text-app)] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-semibold opacity-70">10. Core Values</label>
                  <input 
                    type="text" 
                    value={profile.coreValues} 
                    onChange={e => setProfile({...profile, coreValues: e.target.value})} 
                    className="w-full mt-0.5 p-1.5 bg-[var(--input-bg)] border border-[var(--border-dial)] rounded-lg text-xs text-[var(--text-app)] outline-none"
                  />
                </div>

                <button
                  onClick={handleSaveProfile}
                  className="w-full py-2 rounded-xl bg-[var(--text-app)] text-[var(--bg-app)] font-bold text-[11px] uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center space-x-1.5 mt-2"
                >
                  {savedSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <span>Save Profile</span>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
