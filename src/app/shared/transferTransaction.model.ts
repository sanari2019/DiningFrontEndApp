import { Payment } from "../staffpayment/payment.model";
import { Transfer } from "./transfer.model"

export class TransferTransaction {
    updatedPaymentMainData: Payment;
    paymentMainData: Payment;
    transferData: Transfer;

    constructor() {
        this.updatedPaymentMainData = new Payment();
        this.paymentMainData = new Payment();
        this.transferData = new Transfer();
    }
}