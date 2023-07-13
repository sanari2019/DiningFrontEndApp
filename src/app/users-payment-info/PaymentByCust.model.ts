export class PaymentByCust {
    enteredBy: string;
    custCode: string;
    totalAmount: number;
  
    constructor() {
    
      this.enteredBy = "";
      this.custCode = "";
      this.totalAmount=0;
    }
  }