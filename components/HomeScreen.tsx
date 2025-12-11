
import React, { useEffect, useState } from 'react';
import { Mic, MessageSquareText, Image as ImageIcon, Video, ArrowRight, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import Layout from './Layout';
import Card from './Card';
import { COLORS, ChatSession, ChatMode } from '../types';
import { getChatSessions } from '../services/storageService';

interface HomeScreenProps {
  onStartVoice: () => void;
  onStartChat: () => void;
  onStartImageGen: () => void;
  onStartVideoGen: () => void;
  onRecentQuery: (text: string) => void;
  onLoadChat: (sessionId: string, mode: ChatMode) => void;
  onOpenProfile: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStartVoice, onStartChat, onStartImageGen, onStartVideoGen, onRecentQuery, onLoadChat, onOpenProfile }) => {
  const [recentChats, setRecentChats] = useState<ChatSession[]>([]);

  useEffect(() => {
    const loadSessions = async () => {
        const sessions = await getChatSessions();
        setRecentChats(sessions.slice(0, 5));
    };
    loadSessions();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto w-full">
        <div className="pt-safe px-6 pb-32 min-h-full flex flex-col w-full max-w-lg mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-6 mt-4">
            <button 
                onClick={onOpenProfile}
                className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-white shadow-sm flex-shrink-0 active:scale-95 transition-transform"
            >
              <img src="https://picsum.photos/id/64/100/100" alt="User" className="w-full h-full object-cover" />
            </button>
            <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-surfaceWhite shadow-sm active:scale-95 transition-transform hover:bg-gray-50 flex-shrink-0">
              <Menu size={20} color={COLORS.deepBlack} />
            </button>
          </div>

          <h1 className="text-3xl font-extrabold text-deepBlack mb-8 leading-tight tracking-tight">
            <span className="text-4xl inline-block mb-2">🐁</span><br/>
            Hi, I'm Mikey.<br/>
            How can I help?
          </h1>

          {/* Feature Flex Columns (Masonry Layout) */}
          <div className="flex gap-4 mb-10">
            
            {/* Left Column */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
                {/* Talk with bot (Voice Mode) */}
                <Card 
                    onClick={onStartVoice}
                    className="relative bg-[#eaf6ff] border border-blue-50 h-72 sm:h-80"
                >
                    {/* Abstract Swirl Background */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-[-20%] right-[-50%] w-[150%] h-[100%] bg-[#abd5ff] rounded-full blur-[60px] opacity-60 mix-blend-multiply"></div>
                        <div className="absolute bottom-[-10%] left-[-20%] w-[100%] h-[100%] bg-[#cae5ff] rounded-full blur-[40px] opacity-80"></div>
                        <div className="absolute top-[40%] right-[-20%] w-[80%] h-[80%] bg-[#dbebff] rounded-full blur-[50px] opacity-50"></div>
                    </div>

                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="w-10 h-10 flex items-center justify-center">
                            <Mic size={32} className="text-gray-900" strokeWidth={2} />
                        </div>
                        <div className="mb-2">
                            <span className="text-2xl font-bold text-gray-900 leading-none">Talk with<br/>Mikey</span>
                        </div>
                    </div>
                </Card>

                {/* Generate video */}
                <Card 
                    onClick={onStartVideoGen}
                    className="bg-[#f3e8ff] flex-1 min-h-[7rem] sm:min-h-0 flex flex-col justify-between border border-purple-50"
                >
                    <div className="w-10 h-10 flex items-center justify-center">
                        <Video size={28} className="text-gray-900" strokeWidth={2} />
                    </div>
                    <div>
                        <span className="text-lg font-bold text-gray-900 leading-tight">Generate<br/>video</span>
                    </div>
                </Card>
            </div>

            {/* Right Column */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
                {/* Chat with bot */}
                <Card 
                    onClick={onStartChat}
                    className="bg-[#eec7f4] aspect-square flex flex-col justify-between border border-pink-100"
                >
                    <div className="w-10 h-10 flex items-center justify-center">
                        <MessageSquareText size={28} className="text-gray-900" strokeWidth={2} />
                    </div>
                    <div>
                        <span className="text-lg font-bold text-gray-900 leading-tight">Chat with<br/>Mikey</span>
                    </div>
                </Card>

                {/* Generate image */}
                <Card 
                    onClick={onStartImageGen}
                    className="bg-[#e4f5ff] aspect-square flex flex-col justify-between border border-blue-50"
                >
                    <div className="w-10 h-10 flex items-center justify-center">
                        <ImageIcon size={28} className="text-gray-900" strokeWidth={2} />
                    </div>
                    <div>
                        <span className="text-lg font-bold text-gray-900 leading-tight">Generate<br/>image</span>
                    </div>
                </Card>
            </div>
          </div>

          {/* Recent Queries */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5 pl-1">Recent Chats</h3>
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-6"
            >
                {recentChats.length === 0 ? (
                     <div className="text-gray-400 text-sm italic pl-1">No recent chats yet.</div>
                ) : (
                    recentChats.map(chat => (
                        <motion.div key={chat.id} variants={item}>
                            <RecentItem 
                                icon={
                                    chat.mode === ChatMode.IMAGE_GEN ? <ImageIcon size={18} /> : 
                                    chat.mode === ChatMode.VIDEO_GEN ? <Video size={18} /> :
                                    <MessageSquareText size={18} />
                                }
                                text={chat.title || "Untitled Chat"} 
                                timestamp={chat.timestamp}
                                onClick={() => onLoadChat(chat.id, chat.mode)}
                                color={
                                    chat.mode === ChatMode.IMAGE_GEN ? "bg-pink-100" :
                                    chat.mode === ChatMode.VIDEO_GEN ? "bg-purple-100" : "bg-blue-100"
                                }
                            />
                        </motion.div>
                    ))
                )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-0 left-0 right-0 p-6 pb-safe pointer-events-none z-40 flex justify-center">
          <button 
            onClick={onStartChat}
            className="w-full max-w-sm bg-deepBlack text-surfaceWhite h-16 rounded-full flex items-center justify-between px-2 pl-8 shadow-2xl hover:shadow-3xl hover:-translate-y-1 active:scale-95 transition-all duration-300 group pointer-events-auto"
          >
              <span className="font-bold text-base tracking-wide group-hover:tracking-wider transition-all">Start new chat</span>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <ArrowRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
          </button>
      </div>
    </Layout>
  );
};

const RecentItem = ({ icon, text, timestamp, onClick, color }: { icon: React.ReactNode, text: string, timestamp: number, onClick: () => void, color: string }) => (
    <div onClick={onClick} className="flex items-start gap-4 cursor-pointer group active:opacity-70 transition-opacity">
        <div className={`w-10 h-10 rounded-full ${color} flex-shrink-0 flex items-center justify-center text-deepBlack transition-transform duration-300 group-hover:scale-110`}>
            {icon}
        </div>
        <div className="flex flex-col pt-0.5">
            <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">{text}</p>
            <span className="text-[10px] text-gray-400 mt-1">{new Date(timestamp).toLocaleDateString()}</span>
        </div>
    </div>
);

export default HomeScreen;
