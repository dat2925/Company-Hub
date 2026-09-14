'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { useTranslations } from 'next-intl';
import { ConversationList } from './components/conversation-list';
import { ConversationWindow } from './components/conversation-window';
import { ChatConversation } from './types';
import { AlertCircle } from 'lucide-react';

export function ChatPage() {
  const { user } = useAuth();
  const t = useTranslations('chat');
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);

  if (!user?.employee) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full p-8 text-center bg-white/50 backdrop-blur-sm rounded-2xl">
        <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mb-4 shadow-sm">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">{t('noAccess')}</h2>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] overflow-hidden bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm relative">
      <div 
        className={`w-full md:w-[320px] lg:w-[380px] h-full flex-shrink-0 border-r border-slate-200/50 transition-transform duration-300 ${
          selectedConversation ? 'hidden md:flex md:flex-col' : 'flex flex-col'
        }`}
      >
        <ConversationList 
          selectedId={selectedConversation?.id} 
          onSelect={setSelectedConversation} 
        />
      </div>

      <div 
        className={`flex-1 h-full min-w-0 transition-transform duration-300 ${
          selectedConversation ? 'flex flex-col' : 'hidden md:flex md:flex-col'
        }`}
      >
        {selectedConversation ? (
          <ConversationWindow 
            conversation={selectedConversation} 
            onBack={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center h-full text-center bg-slate-50/50">
            <div className="w-20 h-20 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-700">{t('title')}</h2>
            <p className="text-slate-500 mt-2">{t('empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
