'use client';

import { useState } from 'react';
import { useForm as useHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendMessageSchema, SendMessageInput } from '../schemas';
import { chatApi } from '../api';
import { useTranslations } from 'next-intl';
import { Send, Paperclip, X, Image as ImageIcon, FileText } from 'lucide-react';
import { toast } from 'sonner';

export function MessageComposer({
  conversationId,
  replyTo,
  onCancelReply,
  onSuccess
}: {
  conversationId: string;
  replyTo: { id: string; content: string; senderName: string } | null;
  onCancelReply: () => void;
  onSuccess: () => void;
}) {
  const t = useTranslations('chat');
  const tCommon = useTranslations('common');
  const [showAttachment, setShowAttachment] = useState(false);

  const { register, handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = useHookForm<SendMessageInput>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      type: 'TEXT',
      content: '',
      attachmentUrl: '',
      attachmentName: '',
    }
  });

  const type = watch('type');
  const content = watch('content');
  const attachmentUrl = watch('attachmentUrl');

  const onSubmit = async (data: SendMessageInput) => {
    try {
      const payload = { ...data };
      if (!payload.attachmentUrl) delete payload.attachmentUrl;
      if (!payload.attachmentName) delete payload.attachmentName;
      if (!payload.content) delete payload.content;
      if (replyTo) payload.replyToId = replyTo.id;
      
      await chatApi.sendMessage(conversationId, payload);
      reset({ type: 'TEXT', content: '', attachmentUrl: '', attachmentName: '' });
      setShowAttachment(false);
      onSuccess();
    } catch {
      toast.error(tCommon('error'));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  return (
    <div className="bg-white p-3 border-t border-slate-200/50 z-10 relative shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.05)]">
      {replyTo && (
        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-t-xl border-x border-t border-slate-200 -mt-3 mb-2 mx-1">
          <div className="text-xs">
            <span className="font-bold text-slate-700">Replying to {replyTo.senderName}: </span>
            <span className="text-slate-500 truncate max-w-[200px] inline-block align-bottom">{replyTo.content}</span>
          </div>
          <button onClick={onCancelReply} className="text-slate-400 hover:text-rose-500">
            <X size={14} />
          </button>
        </div>
      )}

      {showAttachment && (
        <div className="absolute bottom-full left-4 mb-2 bg-white border border-slate-200 rounded-xl p-3 shadow-xl w-72 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-bold text-slate-800">Gửi đính kèm (URL)</h4>
            <button onClick={() => { setShowAttachment(false); setValue('type', 'TEXT'); setValue('attachmentUrl', ''); }} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setValue('type', 'IMAGE')}
                className={`flex-1 py-1.5 text-xs rounded-lg border flex items-center justify-center gap-1 ${type === 'IMAGE' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                <ImageIcon size={14} /> Image
              </button>
              <button 
                type="button"
                onClick={() => setValue('type', 'FILE')}
                className={`flex-1 py-1.5 text-xs rounded-lg border flex items-center justify-center gap-1 ${type === 'FILE' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                <FileText size={14} /> File
              </button>
            </div>
            {type !== 'TEXT' && (
              <>
                <input 
                  type="url" 
                  {...register('attachmentUrl')} 
                  placeholder="https://..." 
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                />
                {type === 'FILE' && (
                  <input 
                    type="text" 
                    {...register('attachmentName')} 
                    placeholder="File Name (Optional)" 
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                )}
                <div className="text-[10px] text-slate-500 italic">Nhập URL trực tiếp của file hoặc ảnh vì hệ thống chưa hỗ trợ upload.</div>
              </>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 focus-within:border-indigo-300 focus-within:ring-1 focus-within:ring-indigo-300 transition-all">
        <button 
          type="button"
          onClick={() => setShowAttachment(!showAttachment)}
          className={`p-2.5 rounded-xl transition-colors flex-shrink-0 ${showAttachment || type !== 'TEXT' ? 'bg-indigo-100 text-indigo-600' : 'text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}
        >
          <Paperclip size={18} />
        </button>

        <textarea
          {...register('content')}
          placeholder={type === 'TEXT' ? t('message.placeholder') : `Thêm mô tả cho ${type === 'IMAGE' ? 'ảnh' : 'file'} (tùy chọn)...`}
          className="flex-1 bg-transparent border-none focus:outline-none resize-none py-2.5 px-2 text-sm text-slate-700 custom-scrollbar max-h-32 min-h-[40px]"
          rows={1}
          onKeyDown={handleKeyDown}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = Math.min(target.scrollHeight, 128) + 'px';
          }}
        />

        <button 
          type="submit" 
          disabled={isSubmitting || (type === 'TEXT' && (!content || !content.trim())) || (type !== 'TEXT' && !attachmentUrl)}
          className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-100 transition-colors flex-shrink-0"
        >
          <Send size={18} className={isSubmitting ? 'animate-pulse' : ''} />
        </button>
      </form>
    </div>
  );
}
