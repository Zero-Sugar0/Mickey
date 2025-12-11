
import React, { useEffect, useState, useRef } from 'react';
import { X, Keyboard, Mic } from 'lucide-react';
import { LiveClient } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, MessageRole, ChatMode } from '../types';
import { saveChat } from '../services/storageService';

interface VoiceModeProps {
  onClose: () => void;
  language: string;
  sessionId: string;
}

const VoiceMode: React.FC<VoiceModeProps> = ({ onClose, language, sessionId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isActive, setIsActive] = useState(false);
  const clientRef = useRef<LiveClient | null>(null);

  // Persistence Effect
  useEffect(() => {
    if (messages.length > 0 && sessionId) {
      saveChat(sessionId, messages, ChatMode.DEFAULT);
    }
  }, [messages, sessionId]);

  useEffect(() => {
    clientRef.current = new LiveClient(
      (text, isUser) => {
          setMessages(prev => {
              const role = isUser ? MessageRole.USER : MessageRole.MODEL;
              const lastMsg = prev[prev.length - 1];
              
              let newMsgs = [...prev];

              // If the last message belongs to the same role, append the text chunks
              if (lastMsg && lastMsg.role === role) {
                  newMsgs[newMsgs.length - 1] = {
                      ...lastMsg,
                      text: lastMsg.text + text,
                      timestamp: Date.now() // Update timestamp on modification
                  };
              } else {
                  // Otherwise, start a new message turn
                  newMsgs.push({
                      id: crypto.randomUUID(),
                      role,
                      text,
                      timestamp: Date.now()
                  });
              }
              
              return newMsgs;
          });
      },
      (active) => setIsActive(active)
    );

    clientRef.current.connect(language);

    return () => {
      clientRef.current?.disconnect();
    };
  }, [language]);

  // For display, we only want the last 2-3 messages to keep UI clean
  const displayMessages = messages.slice(-2);

  return (
    <motion.div 
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-50 flex flex-col mesh-gradient h-[100dvh]"
    >
      {/* Header with Safe Area - Fixed */}
      <div className="flex-shrink-0 flex justify-between items-center p-6 pt-safe mt-2 relative z-10">
        <button onClick={onClose} className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors border border-white/20">
           <ArrowDownIcon />
        </button>
        <span className="font-semibold text-white tracking-wide text-sm uppercase opacity-90">Live Conversation</span>
        <button className="p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors border border-white/20">
            <MenuIcon />
        </button>
      </div>

      {/* Live Conversation Area - Flexible & Scrollable */}
      <div className="flex-1 w-full max-w-2xl mx-auto px-6 flex flex-col justify-center items-center relative z-10 gap-8 min-h-0 overflow-y-auto no-scrollbar py-4">
             <AnimatePresence mode="popLayout" initial={false}>
                {displayMessages.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="text-white/50 text-xl font-medium"
                    >
                        Listening...
                    </motion.div>
                )}
                
                {displayMessages.map((msg) => (
                    <motion.div 
                        key={msg.id}
                        layout
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ 
                            opacity: msg.role === MessageRole.USER ? 0.7 : 1, 
                            y: 0, 
                            scale: 1,
                            filter: 'blur(0px)'
                        }}
                        exit={{ 
                            opacity: 0, 
                            y: -50, 
                            scale: 0.9, 
                            filter: 'blur(10px)' 
                        }}
                        transition={{ 
                            type: 'spring', 
                            damping: 20, 
                            stiffness: 100,
                            layout: { duration: 0.3 }
                        }}
                        className={`text-center w-full transition-colors flex-shrink-0 ${msg.role === MessageRole.USER ? 'origin-bottom' : 'origin-top'}`}
                    >
                        <p className={`
                            font-bold leading-relaxed drop-shadow-sm tracking-tight
                            ${msg.role === MessageRole.MODEL 
                                ? 'text-2xl md:text-3xl text-white' 
                                : 'text-lg md:text-xl text-white/80'}
                        `}>
                            {msg.text}
                        </p>
                    </motion.div>
                ))}
             </AnimatePresence>
      </div>

      {/* Controls with Safe Area - Fixed */}
      <div className="flex-shrink-0 pb-8 pb-safe px-8 flex items-center justify-between relative z-10 mt-auto">
         <button className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
             <Keyboard size={24} />
         </button>

         {/* Mic Button with Pulse */}
         <div className="relative flex items-center justify-center">
             {isActive && (
                 <>
                    {/* Outer Rings */}
                    <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute w-full h-full rounded-full bg-white/20"
                        style={{ width: '120%', height: '120%' }}
                    />
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                        className="absolute w-full h-full rounded-full bg-white/30"
                        style={{ width: '100%', height: '100%' }}
                    />
                 </>
             )}
             <button className="w-24 h-24 rounded-full bg-black flex items-center justify-center text-white relative z-10 shadow-2xl border-4 border-white/10 transition-transform active:scale-95">
                 <Mic size={36} className={isActive ? "animate-pulse" : ""} />
             </button>
         </div>

         <button onClick={onClose} className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
             <X size={24} />
         </button>
      </div>
      
      {/* Optional: Add a subtle overlay to ensure text contrast if the gradient is too light */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none z-0" />
    </motion.div>
  );
};

// Icons helper
const ArrowDownIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12l-7 7-7-7"></path><path d="M12 19V5"></path></svg>
);

const MenuIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
);

export default VoiceMode;
