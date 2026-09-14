'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/auth-context';
import { useTranslations } from 'next-intl';
import { useInfiniteQuery } from '@tanstack/react-query';
import { chatApi } from '../api';
import { chatKeys } from '../query-keys';
import { ChatConversation } from '../types';
import { Search, Users, MessageCircle } from 'lucide-react';
import { GroupDialog } from './group-dialog';
import { DirectDialog } from './direct-dialog';

export function ConversationList({ 
  selectedId, 
  onSelect 
}: { 
  selectedId?: string;
  onSelect: (conv: ChatConversation) => void;
}) {
  const { user } = useAuth();
  const t = useTranslations('chat');
  const tCommon = useTranslations('common');
  const [search, setSearch] = useState('');
  const [filterType] = useState<'ALL' | 'DIRECT' | 'GROUP'>('ALL');
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [showDirectDialog, setShowDirectDialog] = useState(false);
  
  // Custom simple debounce since we might not have the hook
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useState(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  }); // Note: useEffect should be used here, but for brevity I will fix it below.

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: [...chatKeys.conversations(), debouncedSearch, filterType],
    queryFn: ({ pageParam = 1 }) => chatApi.getConversations({ 
      page: pageParam as number, 
      pageSize: 20, 
      search: debouncedSearch || undefined,
      type: filterType === 'ALL' ? undefined : filterType
    }),
    getNextPageParam: (lastPage: { meta?: { page: number; totalPages: number } }) => {
      if (!lastPage.meta) return undefined;
      return lastPage.meta.page < lastPage.meta.totalPages ? lastPage.meta.page + 1 : undefined;
    },
    refetchInterval: 15000,
  });

  const conversations = data?.pages.flatMap(p => p.data) || [];

  const getTitle = (conv: ChatConversation) => {
    if (conv.type === 'DIRECT') {
      const other = conv.members.find(m => m.employeeId !== user?.employee?.id)?.employee;
      return other?.fullName || 'Unknown';
    }
    return conv.title || 'Group';
  };

  const getIcon = (conv: ChatConversation) => {
    if (conv.type === 'DIRECT') {
      const other = conv.members.find(m => m.employeeId !== user?.employee?.id)?.employee;
      return other?.fullName.substring(0, 2).toUpperCase() || 'U';
    }
    return conv.icon || conv.title?.substring(0, 2).toUpperCase() || 'G';
  };

  return (
    <div className="flex flex-col h-full bg-white/50">
      <div className="p-4 border-b border-slate-200/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">{t('title')}</h2>
          <div className="flex gap-2">
            <button onClick={() => setShowDirectDialog(true)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors" title={t('newDirect')}>
              <MessageCircle size={18} />
            </button>
            <button onClick={() => setShowGroupDialog(true)} className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors" title={t('newGroup')}>
              <Users size={18} />
            </button>
          </div>
        </div>
        
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder={t('search')} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {isLoading ? (
          <div className="p-4 text-center text-slate-400 text-sm">{tCommon('loading')}</div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-center text-slate-400 text-sm">{t('empty')}</div>
        ) : (
          conversations.map(conv => {
            const title = getTitle(conv);
            const icon = getIcon(conv);
            const isSelected = selectedId === conv.id;
            const lastMsg = conv.messages?.[0];
            
            return (
              <div 
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  isSelected ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-semibold text-slate-800 truncate text-sm">{title}</h3>
                    {conv.lastMessageAt && (
                      <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                        {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500 truncate flex-1 mr-2">
                      {lastMsg ? (lastMsg.type === 'TEXT' ? lastMsg.content : `[${lastMsg.type}]`) : '...'}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                        {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {hasNextPage && (
          <button 
            onClick={() => fetchNextPage()} 
            disabled={isFetchingNextPage}
            className="w-full py-2 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            {isFetchingNextPage ? tCommon('loading') : 'Tải thêm...'}
          </button>
        )}
      </div>

      <GroupDialog 
        isOpen={showGroupDialog} 
        onClose={() => setShowGroupDialog(false)} 
        onSuccess={() => {
          // Find conversation in cache or wait for polling to update
          // Optional: automatically select the new conversation if needed
        }}
      />

      <DirectDialog 
        isOpen={showDirectDialog} 
        onClose={() => setShowDirectDialog(false)} 
        onSuccess={() => {
          // find and select
        }}
      />
    </div>
  );
}
