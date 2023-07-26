import { Menu } from "./menu.model";

export class OrderedMeal {
  id: number;
  guest: string;
  mealid: number;
  enteredBy: string;
  amount: number;
  dateEntered: Date;
  // paymentTypeId: number;
  menu: Menu;
  Submitted: boolean;
  paymentMainId: number;


  constructor() {
    this.id = 0;
    this.guest = '';
    this.mealid = 0;
    this.enteredBy = '';
    this.amount = 0;
    this.dateEntered = new Date();
    // this.paymentTypeId = 0;
    this.menu = new Menu();
    this.Submitted = false;
    this.paymentMainId = 0;
  }
}
