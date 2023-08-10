export class PaymentByCust {
  enteredBy: string;
  custCode: string;
  totalAmount: number;
  enteredbyName: string;

  constructor() {

    this.enteredBy = "";
    this.custCode = "";
    this.totalAmount = 0;
    this.enteredbyName = '';
  }
}