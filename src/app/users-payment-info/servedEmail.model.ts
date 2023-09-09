export class ServedEmail {
    amount: number;
    serversName: string;
    customerName: string;
    customerFirstName: string;
    dateServed: Date;
    customerUserName: string;

    constructor() {
        this.amount = 0;
        this.dateServed = new Date();
        this.serversName = '';
        this.customerName = '';
        this.customerFirstName = '';
        this.customerUserName = '';
    }

}