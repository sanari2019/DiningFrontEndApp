export class Transactioning {
    status: string;
    reference: string;
    amount: number;
    email: string;
    paymentDate: Date;

    constructor() {
        this.status = '';
        this.reference = '';
        this.amount = 0;
        this.email = 'email';
        this.paymentDate = new Date;
    }
}
