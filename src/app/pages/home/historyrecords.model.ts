// recent-transaction.model.ts

export class HistoryRecords {
    DateServed: Date;
    PaymentMainId: number;
    IsServed: number;
    SourceTable: string;
    Unit: number;
    ServedBy: number;
    FirstName: string;
    Amount: number;

    constructor() {
        this.DateServed = new Date();
        this.PaymentMainId = 0;
        this.IsServed = 0;
        this.SourceTable = '';
        this.Unit = 0;
        this.ServedBy = 0;
        this.FirstName = '';
        this.Amount = 0

    }
}
