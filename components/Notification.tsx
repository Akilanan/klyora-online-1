
import React, { useEffect } from 'react';

interface NotificationProps {
  message: string;
  type?: 'success' | 'info';
  onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] animate-bounce-in">
      <div className={`px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border border-white/10 flex items-center gap-3 ${type === 'success' ? 'bg-[#8ca67a]/90 text-black' : 'bg-white/90 text-black'}`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-xs font-bold uppercase tracking-widest">{message}</span>
      </div>
    </div>
  );
};
