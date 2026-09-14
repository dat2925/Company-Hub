'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../api';
import { chatKeys } from '../query-keys';
import { ChatConversation, ChatMessage } from '../types';
import { useTranslations } from 'next-intl';
import { ReactionPicker } from './reaction-picker';
import { Reply, Edit2, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';

export function MessageList({ 
  conversation,
  onReply
}: { 
  conversation: ChatConversation;
  onReply: (msg: ChatMessage) => void;
}) {
  const { user } = useAuth();
  const t = useTranslations('chat');
  const tCommon = useTranslations('common');
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: chatKeys.messages(conversation.id),
    queryFn: ({ pageParam = 1 }) => chatApi.getMessages(conversation.id, { 
      page: pageParam as number, 
      pageSize: 30 
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: { meta?: { page: number; totalPages: number } }) => {
      if (!lastPage.meta) return undefined;
      return lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined;
    },
    refetchInterval: 3000, // Poll every 3s
  });

  // Extract and reverse messages to show oldest at top, newest at bottom
  const messages = data?.pages.flatMap(p => p.data).reverse() || [];

  const latestMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;

  // Mark as read
  useEffect(() => {
    if (latestMessageId) {
      chatApi.readMessages(conversation.id, latestMessageId).catch(() => {});
    }
  }, [latestMessageId, conversation.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current && !isFetchingNextPage) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, isFetchingNextPage]);

  const editMutation = useMutation({
    mutationFn: (data: { id: string, content: string }) => chatApi.updateMessage(data.id, { content: data.content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversation.id) });
      setEditingId(null);
      setEditContent('');
    },
    onError: () => toast.error(tCommon('error'))
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => chatApi.deleteMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversation.id) });
    },
    onError: () => toast.error(tCommon('error'))
  });

  const handleEditSubmit = (msg: ChatMessage) => {
    if (!editContent.trim() || editContent === msg.content) {
      setEditingId(null);
      return;
    }
    editMutation.mutate({ id: msg.id, content: editContent });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50/50" ref={scrollRef}>
      {hasNextPage && (
        <div className="text-center mb-4">
          <button 
            onClick={() => fetchNextPage()} 
            disabled={isFetchingNextPage}
            className="text-xs bg-white px-3 py-1.5 rounded-full shadow-sm text-indigo-600 font-medium hover:bg-indigo-50 transition-colors"
          >
            {isFetchingNextPage ? tCommon('loading') : 'Tải tin nhắn cũ hơn'}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {messages.map((msg, index) => {
          const isMine = msg.senderEmployeeId === user?.employee?.id;
          const showAvatar = !isMine && (index === 0 || messages[index - 1].senderEmployeeId !== msg.senderEmployeeId);
          
          if (msg.type === 'SYSTEM') {
            return (
              <div key={msg.id} className="flex justify-center my-4">
                <span className="text-[11px] font-medium text-slate-500 bg-slate-200/50 px-3 py-1 rounded-full">
                  {msg.content}
                </span>
              </div>
            );
          }

          return (
            <div key={msg.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} group`}>
              {showAvatar && (
                <span className="text-[10px] text-slate-500 mb-1 ml-10">
                  {msg.sender.fullName}
                </span>
              )}
              
              <div className="flex items-end gap-2 max-w-[85%] md:max-w-[70%]">
                {!isMine && showAvatar ? (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {msg.sender.fullName.substring(0, 2).toUpperCase()}
                  </div>
                ) : !isMine ? (
                  <div className="w-8 flex-shrink-0"></div>
                ) : null}

                <div className="flex flex-col relative">
                  {/* Actions Menu */}
                  <div className={`absolute top-0 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white border border-slate-200 shadow-sm rounded-lg p-1 z-10 ${isMine ? 'right-full mr-2' : 'left-full ml-2'}`}>
                    <ReactionPicker 
                      messageId={msg.id} 
                      conversationId={conversation.id}
                      currentUserId={user?.employee?.id || ''}
                    />
                    <button onClick={() => onReply(msg)} className="p-1 hover:bg-slate-100 rounded text-slate-500" title={t('message.reply')}>
                      <Reply size={14} />
                    </button>
                    {isMine && !msg.deletedAt && msg.type === 'TEXT' && (
                      <button onClick={() => { setEditingId(msg.id); setEditContent(msg.content || ''); }} className="p-1 hover:bg-slate-100 rounded text-slate-500" title={t('message.edit')}>
                        <Edit2 size={14} />
                      </button>
                    )}
                    {(isMine || conversation.members.find(m => m.employeeId === user?.employee?.id)?.role !== 'MEMBER') && !msg.deletedAt && (
                      <button onClick={() => deleteMutation.mutate(msg.id)} className="p-1 hover:bg-rose-50 rounded text-rose-500" title={t('message.delete')}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  {/* Reply Context */}
                  {msg.replyTo && (
                    <div className={`text-[11px] p-2 rounded-t-xl mb-[-4px] opacity-75 border-l-2 ${isMine ? 'bg-indigo-50 border-indigo-300 text-indigo-800' : 'bg-slate-100 border-slate-300 text-slate-600'}`}>
                      <div className="font-bold">{msg.replyTo.sender.fullName}</div>
                      <div className="truncate max-w-[200px]">
                        {msg.replyTo.deletedAt ? t('message.deleted') : msg.replyTo.content || 'Attachment'}
                      </div>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`relative px-4 py-2 shadow-sm ${
                    msg.deletedAt 
                      ? 'bg-slate-100 text-slate-400 italic border border-slate-200 rounded-2xl'
                      : isMine 
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl rounded-tr-sm' 
                        : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm'
                  }`}>
                    {msg.deletedAt ? (
                      <span className="text-sm">{t('message.deleted')}</span>
                    ) : (
                      <>
                        {editingId === msg.id ? (
                          <div className="flex flex-col gap-2 min-w-[200px]">
                            <input 
                              type="text" 
                              value={editContent} 
                              onChange={(e) => setEditContent(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleEditSubmit(msg);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              className="w-full bg-white/20 text-white placeholder-white/50 border border-white/30 rounded px-2 py-1 text-sm outline-none"
                              autoFocus
                            />
                            <div className="flex justify-end gap-1 text-[10px]">
                              <button onClick={() => setEditingId(null)} className="hover:underline">Cancel</button>
                              <button onClick={() => handleEditSubmit(msg)} className="font-bold hover:underline">Save</button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm break-words">
                            {msg.type === 'IMAGE' && msg.attachmentUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={msg.attachmentUrl} alt="Attachment" className="max-w-[200px] rounded-lg mb-2 object-cover" />
                            )}
                            {msg.type === 'FILE' && msg.attachmentUrl && (
                              <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-black/10 rounded-lg mb-2 hover:bg-black/20 transition-colors">
                                <FileText size={16} />
                                <span className="underline truncate max-w-[150px]">{msg.attachmentName || 'Download File'}</span>
                              </a>
                            )}
                            {msg.content}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Reactions */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className={`flex flex-wrap gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                      {Object.entries(
                        msg.reactions.reduce((acc: Record<string, number>, curr: import('../types').ChatReaction) => {
                          acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([emoji, count]) => {
                        const hasReacted = msg.reactions.some(r => r.emoji === emoji && r.employeeId === user?.employee?.id);
                        return (
                          <button 
                            key={emoji}
                            onClick={() => chatApi.toggleReaction(msg.id, emoji).then(() => queryClient.invalidateQueries({ queryKey: chatKeys.messages(conversation.id) }))}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] border shadow-xs transition-colors ${
                              hasReacted ? 'bg-indigo-100 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span className="font-bold">{count as number}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Meta: time and edit state */}
                  <div className={`flex items-center gap-1 mt-1 text-[9px] text-slate-400 ${isMine ? 'justify-end' : 'justify-start'}`}>
                    {msg.editedAt && !msg.deletedAt && <span>{t('message.edited')} •</span>}
                    <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
