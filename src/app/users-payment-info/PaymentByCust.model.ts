export class PaymentByCust {
  enteredBy: string;
  custCode: string;
  totalAmount: number;
  remainingAmountUnserved: number
  enteredbyName: string;
  freeze: boolean;

  constructor() {

    this.enteredBy = "";
    this.custCode = "";
    this.totalAmount = 0;
    this.enteredbyName = '';
    this.remainingAmountUnserved = 0;
    this.freeze = false;
  }
}