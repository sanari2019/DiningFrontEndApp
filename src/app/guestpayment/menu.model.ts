export class Menu {
  id: number;
  name: string;
  amount: number;
  selected: boolean;

  constructor() {
    this.id = 0;
    this.name = "";
    this.amount = 0;
    this.selected = false;
  }
}
