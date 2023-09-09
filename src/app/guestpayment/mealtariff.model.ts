
import { Menu } from "./menu.model";

export class MealTariff {
    id: number;
    menuid: number;
    menu: Menu;
    tariff: number;
    datechanged: Date;
    active: boolean;


    constructor() {
        this.id = 0;
        this.menuid = 0;
        this.menu = new Menu;
        this.tariff = 0;
        this.datechanged = new Date();
        this.active = false;

    }
}
