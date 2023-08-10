// recent-transaction.model.ts

export interface RecentTransaction {
    id: number;
    dateEntered: Date;
    type: string;
    enteredBy: string;
    // ... other properties from the RecentTransaction class
}
