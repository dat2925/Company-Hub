'use client';


import { useAuth } from '@/features/auth/auth-context';
import { useTranslations } from 'next-intl';
import { ChatConversation, ChatTheme } from '../types';
import { chatApi } from '../api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatKeys } from '../query-keys';
import { X, Palette, BellOff, Bell, UserPlus, LogOut, Trash2, ShieldAlert, Key } from 'lucide-react';
import { toast } from 'sonner';

const THEMES: { id: ChatTheme, label: string, color: string }[] = [
  { id: 'DEFAULT', label: 'Default', color: 'bg-indigo-500' },
  { id: 'OCEAN', label: 'Ocean', color: 'bg-blue-500' },
  { id: 'FOREST', label: 'Forest', color: 'bg-emerald-500' },
  { id: 'SUNSET', label: 'Sunset', color: 'bg-orange-500' },
  { id: 'LAVENDER', label: 'Lavender', color: 'bg-purple-500' },
  { id: 'MIDNIGHT', label: 'Midnight', color: 'bg-slate-800' },
];

export function ConversationDetails({
  conversation,
  onClose
}: {
  conversation: ChatConversation;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const t = useTranslations('chat');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();
  
  const currentMember = conversation.members.find(m => m.employeeId === user?.employee?.id);
  const isOwner = currentMember?.role === 'OWNER';
  const isAdmin = currentMember?.role === 'ADMIN';
  const canUpdateTheme = conversation.type === 'DIRECT' || isOwner || isAdmin;
  const isMuted = currentMember && currentMember.mutedUntil && new Date(currentMember.mutedUntil) > new Date();

  const updateMutation = useMutation({
    mutationFn: (data: { theme?: ChatTheme; title?: string; icon?: string }) => chatApi.updateConversation(conversation.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }),
    onError: () => toast.error(tCommon('error'))
  });

  const muteMutation = useMutation({
    mutationFn: (minutes: number) => chatApi.muteConversation(conversation.id, { minutes }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }),
    onError: () => toast.error(tCommon('error'))
  });

  const memberMutation = useMutation({
    mutationFn: ({ action, employeeId, role }: { action: 'remove' | 'role' | 'transfer' | 'leave' | 'delete', employeeId?: string, role?: string }) => {
      if (action === 'remove') return chatApi.removeMember(conversation.id, employeeId);
      if (action === 'role') return chatApi.updateMemberRole(conversation.id, employeeId, role);
      if (action === 'transfer') return chatApi.transferOwnership(conversation.id, employeeId);
      if (action === 'leave') return chatApi.leaveConversation(conversation.id);
      if (action === 'delete') return chatApi.deleteConversation(conversation.id);
      return Promise.reject();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chatKeys.all }),
    onError: () => toast.error(tCommon('error'))
  });

  return (
    <div className="flex flex-col h-full bg-white/50 backdrop-blur-md">
      <div className="p-4 border-b border-slate-200/50 flex justify-between items-center bg-white/40">
        <h3 className="font-bold text-slate-800">{t('details.title')}</h3>
        <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
        {/* Theme Settings */}
        {canUpdateTheme && (
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Palette size={14} /> {t('details.theme')}
            </h4>
            <div className="flex flex-wrap gap-2">
              {THEMES.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => updateMutation.mutate({ theme: theme.id })}
                  className={`w-8 h-8 rounded-full ${theme.color} border-2 transition-transform hover:scale-110 shadow-sm ${
                    conversation.theme === theme.id ? 'border-slate-800 scale-110 ring-2 ring-white/50' : 'border-white'
                  }`}
                  title={theme.label}
                />
              ))}
            </div>
          </div>
        )}

        {/* Notifications */}
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Bell size={14} /> Thông báo
          </h4>
          {isMuted ? (
            <button 
              onClick={() => muteMutation.mutate(0)}
              className="w-full flex items-center gap-2 p-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium text-sm border border-slate-200/60"
            >
              <Bell size={16} /> {t('details.unmute')}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => muteMutation.mutate(60)} className="py-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 border border-slate-200/60 text-xs font-medium transition-colors">
                {t('details.muteOptions.1h')}
              </button>
              <button onClick={() => muteMutation.mutate(8 * 60)} className="py-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 border border-slate-200/60 text-xs font-medium transition-colors">
                {t('details.muteOptions.8h')}
              </button>
              <button onClick={() => muteMutation.mutate(24 * 7 * 60)} className="py-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 border border-slate-200/60 text-xs font-medium transition-colors">
                {t('details.muteOptions.1w')}
              </button>
              <button onClick={() => muteMutation.mutate(500000)} className="py-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 border border-slate-200/60 text-xs font-medium transition-colors flex items-center justify-center gap-1">
                <BellOff size={12} /> {t('details.muteOptions.forever')}
              </button>
            </div>
          )}
        </div>

        {/* Group Members */}
        {conversation.type === 'GROUP' && (
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><UserPlus size={14} /> {t('group.members')} ({conversation.members.length})</span>
            </h4>
            
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {conversation.members.map(member => {
                const canManage = isOwner || (isAdmin && member.role !== 'OWNER' && member.role !== 'ADMIN');
                const isMe = member.employeeId === user?.employee?.id;
                
                return (
                  <div key={member.id} className="flex items-center justify-between p-2 rounded-xl bg-white/60 border border-slate-100 shadow-xs hover:border-slate-200 transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {member.employee.fullName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {member.employee.fullName} {isMe && '(You)'}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium">{t(`group.roles.${member.role}`)}</p>
                      </div>
                    </div>

                    {!isMe && canManage && (
                      <div className="flex gap-1 flex-shrink-0">
                        {isOwner && member.role !== 'ADMIN' && (
                          <button onClick={() => memberMutation.mutate({ action: 'role', employeeId: member.employeeId, role: 'ADMIN' })} className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors" title="Make Admin">
                            <ShieldAlert size={14} />
                          </button>
                        )}
                        {isOwner && member.role === 'ADMIN' && (
                          <button onClick={() => memberMutation.mutate({ action: 'role', employeeId: member.employeeId, role: 'MEMBER' })} className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors" title="Remove Admin">
                            <ShieldAlert size={14} className="opacity-50" />
                          </button>
                        )}
                        {isOwner && (
                          <button onClick={() => { if(confirm('Chuyển quyền chủ nhóm?')) memberMutation.mutate({ action: 'transfer', employeeId: member.employeeId }) }} className="p-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors" title={t('group.transfer')}>
                            <Key size={14} />
                          </button>
                        )}
                        <button onClick={() => { if(confirm(tCommon('deleteConfirm'))) memberMutation.mutate({ action: 'remove', employeeId: member.employeeId }) }} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors" title={t('group.removeMember')}>
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      {conversation.type === 'GROUP' && (
        <div className="p-4 border-t border-slate-200/50 bg-slate-50/50 space-y-2">
          {!isOwner && (
            <button 
              onClick={() => { if(confirm('Xác nhận rời nhóm?')) memberMutation.mutate({ action: 'leave' }) }}
              className="w-full py-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-100 font-bold text-sm flex items-center justify-center gap-2 border border-amber-200/50 transition-colors"
            >
              <LogOut size={16} /> {t('group.leave')}
            </button>
          )}
          {isOwner && (
            <button 
              onClick={() => { if(confirm(tCommon('deleteConfirm'))) memberMutation.mutate({ action: 'delete' }) }}
              className="w-full py-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 font-bold text-sm flex items-center justify-center gap-2 border border-rose-200/50 transition-colors"
            >
              <Trash2 size={16} /> {t('group.delete')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
