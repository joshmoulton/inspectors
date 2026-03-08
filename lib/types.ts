export const ORDER_STATUSES = [
    'Unassigned',
    'Open',
    'Cancelled',
    'Completed Pending Approval',
    'Completed Approved',
    'Completed Rejected',
    'Submitted to Client',
    'Paid',
    'Cancelled Unpaid',
    'Follow-Up Needed',
    'Follow-Up Completed',
    'Historical',
    'Reassigned',
] as const;

export type OrderStatus = typeof ORDER_STATUSES[number];

export const INSPECTION_TYPES = [
    'Standard',
    'Interior',
    'Contact',
    'Set Appointment',
    'Contact/Interior',
    'Realtor',
    'PHAN',
    'PSP2',
    'HUD BWI',
    'HUD/REO QC',
    'PCR',
    'FannieMae',
    'FreddieMac',
    'Ext Commercial',
    'FEMA',
    'Residential',
    'Photos Only',
] as const;

export type InspectionType = typeof INSPECTION_TYPES[number];

export const ORDER_TAGS = [
    'Vacant Lot',
    'Vacant',
    'Not Vacant',
    'Violation',
    'Photo Mismatch',
    'Solar Panels',
    'FTV',
    'VTO',
    'Damaged',
    'Bad Address',
    'Gained Interior Access',
    'Access Denied',
    'Out of Area',
    'Rush',
] as const;

export const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    'DC', 'PR', 'VI', 'GU', 'AS', 'MP',
] as const;

export const STATUS_COLORS: Record<string, string> = {
    'Unassigned': '#6b7280',
    'Open': '#3b82f6',
    'Cancelled': '#ef4444',
    'Completed Pending Approval': '#f59e0b',
    'Completed Approved': '#10b981',
    'Completed Rejected': '#ef4444',
    'Submitted to Client': '#8b5cf6',
    'Paid': '#059669',
    'Cancelled Unpaid': '#dc2626',
    'Follow-Up Needed': '#f97316',
    'Follow-Up Completed': '#14b8a6',
    'Historical': '#9ca3af',
    'Reassigned': '#6366f1',
};
