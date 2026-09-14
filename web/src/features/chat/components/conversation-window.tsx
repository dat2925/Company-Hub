'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { ChatConversation } from '../types';
import { MessageList } from './message-list';
import { MessageComposer } from './message-composer';
import { ConversationDetails } from './conversation-details';
import { ChevronLeft, Info, BellOff } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { chatKeys } from '../query-keys';

const themeMap = {
  DEFAULT: 'bg-indigo-50 border-indigo-200 text-indigo-900',
  OCEAN: 'bg-blue-50 border-blue-200 text-blue-900',
  FOREST: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  SUNSET: 'bg-orange-50 border-orange-200 text-orange-900',
  LAVENDER: 'bg-purple-50 border-purple-200 text-purple-900',
  MIDNIGHT: 'bg-slate-800 border-slate-700 text-slate-100',
};

export function ConversationWindow({ 
  conversation, 
  onBack 
}: { 
  conversation: ChatConversation;
  onBack: () => void;
}) {
  const { user } = useAuth();
  const [showDetails, setShowDetails] = useState(false);
  const queryClient = useQueryClient();
  const [replyTo, setReplyTo] = useState<{ id: string; content: string; senderName: string } | null>(null);

  const getTitle = () => {
    if (conversation.type === 'DIRECT') {
      const other = conversation.members.find(m => m.employeeId !== user?.employee?.id)?.employee;
      return other?.fullName || 'Unknown';
    }
    return conversation.title || 'Group';
  };

  const getIcon = () => {
    if (conversation.type === 'DIRECT') {
      const other = conversation.members.find(m => m.employeeId !== user?.employee?.id)?.employee;
      return other?.fullName.substring(0, 2).toUpperCase() || 'U';
    }
    return conversation.icon || conversation.title?.substring(0, 2).toUpperCase() || 'G';
  };

  const themeClass = themeMap[conversation.theme] || themeMap.DEFAULT;
  
  const currentMember = conversation.members.find(m => m.employeeId === user?.employee?.id);
  const isMuted = currentMember && currentMember.mutedUntil && new Date(currentMember.mutedUntil) > new Date();

  return (
    <div className="flex flex-1 overflow-hidden relative">
      <div className={`flex flex-col flex-1 min-w-0 ${showDetails ? 'hidden lg:flex' : 'flex'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-3 border-b border-slate-200/50 backdrop-blur-sm z-10 ${themeClass}`}>
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-white/30 backdrop-blur-md flex items-center justify-center font-bold text-lg shadow-sm border border-white/20">
              {getIcon()}
            </div>
            <div>
              <h2 className="font-bold text-sm md:text-base tracking-tight flex items-center gap-2">
                {getTitle()}
                {isMuted && <BellOff size={14} className="opacity-70" />}
              </h2>
              {conversation.type === 'GROUP' && (
                <p className="text-xs opacity-80">{conversation.members.length} members</p>
              )}
            </div>
          </div>
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors shadow-sm"
          >
            <Info size={20} />
          </button>
        </div>

        {/* Timeline */}
        <MessageList 
          conversation={conversation} 
          onReply={(msg) => setReplyTo({
            id: msg.id,
            content: msg.content || 'Attachment',
            senderName: msg.sender?.fullName || 'Unknown'
          })}
        />

        {/* Composer */}
        <MessageComposer 
          conversationId={conversation.id} 
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversation.id) });
            queryClient.invalidateQueries({ queryKey: chatKeys.conversations() });
            setReplyTo(null);
          }}
        />
      </div>

      {/* Details Drawer */}
      {showDetails && (
        <div className="w-full lg:w-80 h-full border-l border-slate-200/50 bg-slate-50/80 backdrop-blur-md flex-shrink-0 absolute lg:relative z-20 top-0 right-0 animate-in slide-in-from-right-10 duration-300">
          <ConversationDetails 
            conversation={conversation}
            onClose={() => setShowDetails(false)}
          />
        </div>
      )}
    </div>
  );
}
