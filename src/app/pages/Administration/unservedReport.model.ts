export interface UnservedReportModel {
    [key: string]: any;
    PaymentMainId: number;
    TotalUnits: number;
    EnteredByUsername: string;
    DateEntered: Date;
    VoucherDescription: string;
    ServedUnits: number;
    RemainingUnits: number;
}
