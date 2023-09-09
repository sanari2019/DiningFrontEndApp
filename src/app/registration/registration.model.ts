export class Registration {
  id: number;
  custTypeId: number;
  custId: string;
  firstName: string;
  lastName: string;
  userName: string;
  password: string;
  freeze: boolean;

  constructor() {
    this.id = 0;
    this.custTypeId = 0;
    this.custId = "";
    this.firstName = "";
    this.lastName = "";
    this.userName = "";
    this.password = "";
    this.freeze = false;
  }
}
