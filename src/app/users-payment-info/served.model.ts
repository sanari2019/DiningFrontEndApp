import { Payment } from "../staffpayment/payment.model";

export class Served {
  id: number;
  dateserved: Date;
  ServedBy: number;
  isServed: boolean;
  paymentMain: Payment;
  paymentMainid: number;
  active: boolean;

  constructor() {
    this.id = 0;
    this.dateserved = new Date();
    this.ServedBy = 0;
    this.isServed = false;
    this.paymentMain = new Payment()
    this.paymentMainid = 0;
    this.active = false;
  }

}