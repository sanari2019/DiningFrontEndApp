import { Menu } from "./menu.model";

export class MenuandTariff {

    menuid: number;
    menu: Menu
    menuname: string;
    tariff: number;
    selected: boolean;

    constructor() {
        this.menuid = 0;
        this.menuname = '';
        this.tariff = 0;
        this.selected = false;
        this.menu = new Menu;

    }
}
