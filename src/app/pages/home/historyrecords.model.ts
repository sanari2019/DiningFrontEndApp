// recent-transaction.model.ts

export interface HistoryRecords {
    DateServed: Date;
    PaymentMainId: number;
    IsServed: number;
    SourceTable: string;
    Unit: number;
    ServedBy: number;
    FirstName: string;
    Amount: number;


}
