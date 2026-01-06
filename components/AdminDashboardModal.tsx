import React, { useEffect, useState } from 'react';
import { leadService, Lead } from '../services/leadService';

interface AdminDashboardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ isOpen, onClose }) => {
    const [leads, setLeads] = useState<Lead[]>([]);

    useEffect(() => {
        if (isOpen) {
            setLeads(leadService.getAllLeads().reverse());
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in">
            <div className="w-full max-w-5xl bg-zinc-900 border border-white/10 shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-zinc-950">
                    <div>
                        <h2 className="text-xl font-serif italic text-white flex gap-3 items-center">
                            Atelier Admin
                            <span className="text-xs font-sans not-italic text-zinc-500 bg-zinc-900 px-2 py-1 rounded border border-white/5">v2.0</span>
                        </h2>
                        <p className="text-[10px] uppercase tracking-widest text-[#8ca67a]">Central Intelligence • {leads.length} Records</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={() => leadService.downloadLeads()}
                            className="flex items-center gap-2 text-[9px] uppercase tracking-widest bg-white text-black px-4 py-2 hover:bg-zinc-200 transition-colors"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Export CSV
                        </button>
                        <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">Close</button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {leads.length === 0 ? (
                        <p className="text-center text-zinc-500 italic py-12">No data collected yet.</p>
                    ) : (
                        <table className="w-full text-left text-xs">
                            <thead className="text-[9px] uppercase tracking-widest text-zinc-500 border-b border-white/10">
                                <tr>
                                    <th className="pb-4 pl-2">Type</th>
                                    <th className="pb-4">Timestamp</th>
                                    <th className="pb-4">Data Payload</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {leads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-white/5 transition-colors font-mono text-[10px] text-zinc-400">
                                        <td className="py-4 pl-2">
                                            <span className={`px-2 py-1 rounded border ${lead.type === 'waitlist' ? 'border-blue-900 text-blue-400 bg-blue-900/20' :
                                                    lead.type === 'newsletter' ? 'border-green-900 text-green-400 bg-green-900/20' :
                                                        lead.type === 'referral' ? 'border-purple-900 text-purple-400 bg-purple-900/20' :
                                                            'border-zinc-700 text-zinc-300'
                                                }`}>
                                                {lead.type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="py-4">{new Date(lead.timestamp).toLocaleString()}</td>
                                        <td className="py-4">
                                            <div className="max-w-xl truncate opacity-80" title={JSON.stringify(lead.data)}>
                                                {JSON.stringify(lead.data).replace(/"/g, '').replace(/{/g, '').replace(/}/g, '')}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="p-4 border-t border-white/10 bg-zinc-950 text-right">
                    <button
                        onClick={() => leadService.clearLeads()}
                        className="text-[9px] uppercase tracking-widest text-red-500 hover:text-red-400"
                    >
                        Purge Database
                    </button>
                </div>
            </div>
        </div>
    );
};
