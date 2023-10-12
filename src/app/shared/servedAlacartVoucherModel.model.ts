export interface ServedAlacarteVoucherModel {
    id: number;
    dateEntered: Date;
    custTypeName: string;
    menuName: string;
    maxTarriff: number;
    dateServed: Date | null; // Use Date or null to match nullable Date


}
