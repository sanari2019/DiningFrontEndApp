export class Transfer {
    id: number;
    voucherId: number;
    quantity: number;
    transferredBy: string;
    enteredBy: number;
    snRead: boolean;
    byCustCode: string;
    s_pymtmainid: number;
    transferredTo: string;
    receivedBy: number;
    toCustCode: string;
    rnRead: boolean;
    r_pymtmainid: number;
    dateTransferred: Date;
    transferType: string;
    success: boolean;

    constructor() {
        this.id = 0;
        this.voucherId = 0;
        this.quantity = 0;
        this.transferredBy = '';
        this.enteredBy = 0;
        this.snRead = false;
        this.byCustCode = '';
        this.s_pymtmainid = 0;
        this.transferredTo = '';
        this.receivedBy = 0;
        this.toCustCode = '';
        this.rnRead = false;
        this.r_pymtmainid = 0;
        this.dateTransferred = new Date();
        this.transferType = '';
        this.success = false;
    }
}
