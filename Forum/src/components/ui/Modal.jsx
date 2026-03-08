import React from 'react';
import { X } from 'lucide-react';
import useModalStore from '../hooks/useModalStore';
import { cn } from '@/lib/utils';

const Modal = ({ type, title, children, className }) => {
  const { isOpen, type: activeType, onClose } = useModalStore();
  
  const isModalOpen = isOpen && activeType === type;

  if (!isModalOpen) return null;

  return (
    <div className="relative z-50">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={onClose} />

        {/* Modal Panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className={cn("relative bg-white rounded-2xl shadow-xl w-full max-w-lg transform transition-all p-6 flex flex-col max-h-[95vh]", className)}>
                 <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    <h3 className="text-lg font-bold text-slate-900">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-500 transition-colors p-1 rounded-full hover:bg-slate-100 focus:outline-none"
                    >
                        <X className="w-5 h-5" />
                    </button>
                 </div>
                 <div className="overflow-y-auto pr-2 custom-scrollbar">
                    {children}
                 </div>
            </div>
        </div>
    </div>
  );
};

export default Modal;
