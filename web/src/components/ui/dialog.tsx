'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Portal } from './portal';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Dialog({ isOpen, onClose, title, children }: DialogProps) {
  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
          <div className="flex justify-between items-center p-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-4 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </Portal>
  );
}
