import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
                    <p className="text-[10px] uppercase tracking-[0.5em] text-[#8ca67a] mb-6">Maison Klyora</p>
                    <h1 className="text-3xl md:text-5xl font-serif italic mb-6">The Atelier is undergoing curation.</h1>
                    <p className="text-sm text-zinc-500 mb-8">We apologize for the interruption.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-white text-black text-[10px] uppercase tracking-widest font-bold hover:bg-zinc-200 transition-colors"
                    >
                        Refresh
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
