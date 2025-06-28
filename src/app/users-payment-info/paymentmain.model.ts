export class PaymentMain {
    id: number;
    dateEntered: Date;
    enteredBy: string;
    custTypeId: number;
    custCode: string;
    voucherId: number;
    unit: number;
    amount: number;
    served: boolean;
    dateServed: Date;
    paid: boolean;
    timePaid: Date;
    opaymentId: number;
    paymentType: number;

    constructor() {
        this.id = 0;
        this.dateEntered = new Date();
        this.enteredBy = '';
        this.custTypeId = 0;
        this.custCode = '';
        this.voucherId = 0;
        this.unit = 0;
        this.amount = 0;
        this.served = false;
        this.dateServed = new Date();
        this.paid = false;
        this.timePaid = new Date();
        this.opaymentId = 0;
        this.paymentType = 0;
    }
}
