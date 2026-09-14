'use client';

import { useState } from 'react';
import { Smile } from 'lucide-react';
import { chatApi } from '../api';
import { useQueryClient } from '@tanstack/react-query';
import { chatKeys } from '../query-keys';

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

export function ReactionPicker({ 
  messageId, 
  conversationId,
  currentUserId
}: { 
  messageId: string;
  conversationId: string;
  currentUserId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleToggle = async (emoji: string) => {
    setIsOpen(false);
    
    // Optimistic update
    queryClient.setQueryData<{ pages: { data: import('../types').ChatMessage[] }[] }>(chatKeys.messages(conversationId), (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          data: page.data.map((msg) => {
            if (msg.id === messageId) {
              const hasReacted = msg.reactions.some((r: { emoji: string; employeeId: string }) => r.emoji === emoji && r.employeeId === currentUserId);
              let newReactions = [...msg.reactions];
              if (hasReacted) {
                newReactions = newReactions.filter(r => !(r.emoji === emoji && r.employeeId === currentUserId));
              } else {
                newReactions.push({ emoji, employeeId: currentUserId } as import('../types').ChatReaction);
              }
              return { ...msg, reactions: newReactions };
            }
            return msg;
          })
        }))
      };
    });

    try {
      await chatApi.toggleReaction(messageId, emoji);
    } catch {
      // Revert on error by invalidating
    } finally {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversationId) });
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors"
      >
        <Smile size={14} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white border border-slate-200 shadow-lg rounded-full px-2 py-1 flex items-center gap-1 z-50">
            {QUICK_REACTIONS.map(emoji => (
              <button 
                key={emoji}
                onClick={() => handleToggle(emoji)}
                className="hover:bg-slate-100 p-1.5 rounded-full text-lg transition-transform hover:scale-125"
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
