import React from 'react';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: React.ReactNode;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, title, content }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative bg-[#0f0f0f] border border-white/10 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl transform transition-transform animate-modal-slide-up">
                {/* Header */}
                <div className="sticky top-0 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-white/5 p-6 flex justify-between items-center z-10">
                    <h2 className="text-xl font-serif italic text-white tracking-wider">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-zinc-500 hover:text-white transition-colors p-2"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 md:p-12 text-zinc-300 font-light leading-relaxed">
                    {content}
                </div>
            </div>
        </div>
    );
};
