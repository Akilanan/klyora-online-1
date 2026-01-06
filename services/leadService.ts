export interface Lead {
    id: string;
    type: 'newsletter' | 'waitlist' | 'press' | 'referral';
    data: any;
    timestamp: string;
}

const STORAGE_KEY = 'klyora_leads';

const getLeads = (): Lead[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const leadService = {
    saveLead: (type: Lead['type'], data: any) => {
        const leads = getLeads();
        const newLead: Lead = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            data,
            timestamp: new Date().toISOString()
        };
        leads.push(newLead);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
        console.log(`[LeadService] Saved ${type} lead`, newLead);
    },

    getAllLeads: () => getLeads(),

    getLeadsByType: (type: Lead['type']) => getLeads().filter(l => l.type === type),

    downloadLeads: () => {
        const leads = getLeads();
        if (leads.length === 0) {
            alert("No leads collected yet.");
            return;
        }

        const csvContent = "data:text/csv;charset=utf-8,"
            + "ID,Type,Timestamp,Data\n"
            + leads.map(l => `${l.id},${l.type},${l.timestamp},${JSON.stringify(l.data).replace(/,/g, ';')}`).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `klyora_leads_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    clearLeads: () => {
        if (confirm("Are you sure you want to delete all local leads? This cannot be undone.")) {
            localStorage.removeItem(STORAGE_KEY);
            window.location.reload();
        }
    }
};
