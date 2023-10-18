export interface ServedReportModel {
    [key: string]: any;
    id: number;
    DateServed: Date;
    ServedBy: string;
    DateEntered: Date;
    CustomerType: string;
    CustCode: string;
    VoucherDescription: string;
    Amount: number;
}
