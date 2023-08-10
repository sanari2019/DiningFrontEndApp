export class Payment {
  id: number;
  dateEntered: Date;
  enteredBy: string;
  custCode: string;
  voucherId: number;
  unit: number;
  amount: number;
  paymentmodeid: number;
  servedby: string;
  opaymentid: number;
  paid: boolean;
  timepaid: Date;
  PaymentType: number;
  custtypeid: number;
  VoucherDescription: string;
  constructor() {
    this.id = 0;
    this.dateEntered = new Date();
    this.enteredBy = "";
    this.custCode = "";
    this.voucherId = 0;
    this.unit = 0;
    this.amount = 0;
    this.paymentmodeid = 0;
    this.servedby = "";
    this.opaymentid = 0;
    this.paid = false;
    this.timepaid = new Date();
    this.PaymentType = 0;
    this.custtypeid = 0;
    this.VoucherDescription = '';
  }
}
