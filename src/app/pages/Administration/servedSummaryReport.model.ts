// models/served-summary-report.model.ts

export interface ServedSummaryReportModel {
    [key: string]: any;
    month: string;
    day: number;
    voucherDescription: string;
    TotalServedIDs: number;
}
