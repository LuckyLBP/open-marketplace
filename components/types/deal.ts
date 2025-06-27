export interface Deal {
    id: string;
    title: string;
    companyId: string;
    companyName: string;
    expiresAt: Date;
    status?: 'pending' | 'approved' | 'rejected'; 
    [key: string]: any;
}
