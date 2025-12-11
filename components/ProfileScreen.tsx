
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Info, ChevronRight, HardDrive, Bell, Globe, CircleHelp, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from './Layout';
import { COLORS, SUPPORTED_LANGUAGES } from '../types';
import { clearAllData, getStorageUsage } from '../services/storageService';

interface ProfileScreenProps {
  onBack: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack, language, onLanguageChange }) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [storageUsage, setStorageUsage] = useState({ usageBytes: 0, itemCount: 0 });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
        const stats = await getStorageUsage();
        setStorageUsage(stats);
    };
    loadStats();
  }, []);

  const handleClearHistory = async () => {
      await clearAllData();
      setShowClearConfirm(false);
      window.location.reload();
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  return (
    <Layout className="bg-appBackground">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 pt-4 pb-4 pt-safe mt-2">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 transition">
          <ArrowLeft size={24} color={COLORS.deepBlack} />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Profile</h1>
        <div className="w-10" /> 
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-safe">
        
        {/* User Info */}
        <div className="flex flex-col items-center py-8">
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-lg mb-4">
               <img src="https://picsum.photos/id/64/200/200" alt="User" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-bold text-deepBlack">Gemini User</h2>
            <p className="text-gray-500 font-medium">Pro Plan</p>
        </div>

        {/* Settings Section */}
        <div className="space-y-6">
            
            {/* Preferences */}
            <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 pl-1">Preferences</h3>
                <div className="bg-surfaceWhite rounded-3xl overflow-hidden shadow-sm">
                    <MenuItem 
                        icon={<Bell size={20} />}
                        label="Notifications"
                        rightElement={
                            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${notificationsEnabled ? 'bg-deepBlack' : 'bg-gray-200'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                        }
                        onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    />
                    <div className="h-[1px] bg-gray-50 mx-4" />
                    <MenuItem 
                        icon={<Globe size={20} />}
                        label="Language"
                        subLabel={language}
                        onClick={() => setShowLanguageModal(true)}
                    />
                </div>
            </div>

            {/* Storage & Data */}
            <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 pl-1">Data & Storage</h3>
                 <div className="bg-surfaceWhite rounded-3xl overflow-hidden shadow-sm">
                    <MenuItem 
                        icon={<HardDrive size={20} />}
                        label="Storage Used"
                        subLabel={`${formatBytes(storageUsage.usageBytes)} • ${storageUsage.itemCount} Items`}
                        hideChevron
                    />
                    <div className="h-[1px] bg-gray-50 mx-4" />
                    <MenuItem 
                        icon={<Trash2 size={20} className="text-red-500" />}
                        label="Clear History"
                        labelColor="text-red-500"
                        subLabel="Delete all chat sessions permanently"
                        onClick={() => setShowClearConfirm(true)}
                    />
                </div>
            </div>

            {/* Support */}
            <div>
                 <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 pl-1">Support</h3>
                 <div className="bg-surfaceWhite rounded-3xl overflow-hidden shadow-sm">
                    <MenuItem 
                        icon={<CircleHelp size={20} />}
                        label="Help Center"
                    />
                    <div className="h-[1px] bg-gray-50 mx-4" />
                    <MenuItem 
                        icon={<Info size={20} />}
                        label="Version"
                        subLabel="1.2.0 (IndexedDB)"
                        hideChevron
                    />
                </div>
            </div>

        </div>
      </div>

      {/* Language Selection Modal */}
      <AnimatePresence>
        {showLanguageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 sm:p-6"
            onClick={() => setShowLanguageModal(false)}
          >
             <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="bg-white rounded-3xl w-full max-w-sm max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
                onClick={(e) => e.stopPropagation()}
             >
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold">Select Language</h2>
                    <button onClick={() => setShowLanguageModal(false)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="overflow-y-auto p-4 space-y-2">
                    {SUPPORTED_LANGUAGES.map((lang) => (
                        <button
                            key={lang}
                            onClick={() => {
                                onLanguageChange(lang);
                                setShowLanguageModal(false);
                            }}
                            className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${language === lang ? 'bg-primaryBlue/20 text-deepBlack font-bold' : 'hover:bg-gray-50 text-gray-600'}`}
                        >
                            <span className="text-base">{lang}</span>
                            {language === lang && <Check size={20} className="text-deepBlack" />}
                        </button>
                    ))}
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Confirm Modal */}
       {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-fade-in">
                <h3 className="text-xl font-bold mb-2">Clear all history?</h3>
                <p className="text-gray-600 mb-6">This action cannot be undone. All your conversations, images, and videos will be permanently deleted.</p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowClearConfirm(false)}
                        className="flex-1 py-3 font-bold rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleClearHistory}
                        className="flex-1 py-3 font-bold rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
      )}

    </Layout>
  );
};

interface MenuItemProps {
    icon: React.ReactNode;
    label: string;
    subLabel?: string;
    onClick?: () => void;
    hideChevron?: boolean;
    labelColor?: string;
    rightElement?: React.ReactNode;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, subLabel, onClick, hideChevron, labelColor = 'text-deepBlack', rightElement }) => (
    <button onClick={onClick} className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors text-left group active:bg-gray-100">
        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 mr-4 group-hover:bg-white group-hover:shadow-sm transition-all">
            {icon}
        </div>
        <div className="flex-1">
            <div className={`font-bold text-base ${labelColor}`}>{label}</div>
            {subLabel && <div className="text-xs text-gray-400 font-medium">{subLabel}</div>}
        </div>
        {rightElement ? rightElement : (
            !hideChevron && <ChevronRight size={18} className="text-gray-300" />
        )}
    </button>
);

export default ProfileScreen;
