export class PaymentByCust {
  enteredBy: string;
  custCode: string;
  totalAmount: number;
  enteredbyName: string;
  freeze: boolean;

  constructor() {

    this.enteredBy = "";
    this.custCode = "";
    this.totalAmount = 0;
    this.enteredbyName = '';
    this.freeze = false;
  }
}