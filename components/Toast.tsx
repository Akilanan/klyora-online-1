import React, { useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible, onClose }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isVisible) {
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
                setTimeout(onClose, 300); // Wait for exit animation
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible && !show) return null;

    return (
        <div
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[2000] transition-all duration-500 ease-out transform pointer-events-none
                ${show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
            `}
        >
            <div className="bg-black/90 backdrop-blur-md text-white px-8 py-4 rounded-none shadow-2xl border border-white/10 flex items-center gap-4 min-w-[300px] justify-center">
                <span className="w-2 h-2 bg-[#8ca67a] rounded-full animate-pulse"></span>
                <p className="text-xs uppercase tracking-[0.2em] font-medium">{message}</p>
            </div>
        </div>
    );
};
