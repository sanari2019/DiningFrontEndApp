import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Menu } from '../guestpayment/menu.model';
import { MenuService } from '../guestpayment/menu.service';
import { OrderedMealService } from '../guestpayment/orderedmeal.service';
import { OrderedMeal } from '../guestpayment/orderedmeal.model';
import { MealTariff } from '../guestpayment/mealtariff.model';
import { MealTariffService } from '../guestpayment/mealtariff.service';
import { MenuandTariff } from '../guestpayment/menuandtariff.model';


@Component({
  selector: 'app-menu-dialog',
  templateUrl: './menu-dialog.component.html',
  styleUrls: ['./menu-dialog.component.scss']
})
export class MenuDialogComponent implements OnInit {
  menuList: MenuandTariff[] = [];
  menu!: Menu;
  tariff!: MealTariff;
  filteredMenuList: MenuandTariff[] = [];
  searchText = '';
  selectedMenus: Menu[] = []; // Add selectedMenus array property
  @Output() menuSelected: EventEmitter<Menu[]> = new EventEmitter<Menu[]>(); // Emit selectedMenus when the dialog is closed
  @Output() menuCount: EventEmitter<number> = new EventEmitter<number>();
  NoMenuSelected = false;


  constructor(
    private menuService: MenuService,
    private dialogRef: MatDialogRef<MenuDialogComponent>,
    private orderedMealService: OrderedMealService,
    private mealtariffService: MealTariffService
  ) { }

  ngOnInit() {
    this.getMenuList();
    // this.selectedMenus = this.data.menus.filter(menu => menu.selected); // Restore selected menus from the data object
  }

  getMenuList() {
    this.mealtariffService.getMenuandTariff().subscribe(
      (menus) => {
        this.menuList = menus;
        this.filteredMenuList = menus;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  getAmountForMenu(menuId: number): number {
    let amount = 0;
    this.mealtariffService.getMenutarriffByMaximumID(menuId).subscribe((mealTariff) => {
      // Check if the returned mealTariff is not null and has a tariff value
      if (mealTariff && mealTariff.tariff) {
        amount = mealTariff.tariff; // Set the amount to the tariff value
      }
    },
      (error) => {
        console.error('Error fetching meal tariff:', error);
      }
    );

    return amount;
  }

  filterMenuList() {
    this.filteredMenuList = this.menuList.filter((menu) =>
      menu.menuname.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  calculateTotalAmount(): number {
    return this.filteredMenuList.reduce(
      (total, menu) => (total += menu.tariff),
      0
    );
  }

  calculateTotalDiscountedAmount(): number {
    return this.filteredMenuList.reduce(
      (total, menu) => (total += menu.tariff * 0.6),
      0
    );
  }

  // Method to update selectedMenus array when checkbox state changes
  // updateSelectedMenus(menu: Menu) {
  //   if (menu.selected) {
  //     this.selectedMenus.push(menu);
  //   } else {
  //     this.selectedMenus = this.selectedMenus.filter((item) => item.id !== menu.id);
  //   }
  //   // Save the updated selectedMenus array to local storage
  //   localStorage.setItem('selectedMenus', JSON.stringify(this.selectedMenus));
  //   // Emit the updated selectedMenus array and its count
  //   this.menuSelected.emit(this.selectedMenus);
  //   this.menuCount.emit(this.selectedMenus.length);
  // }


  closeDialog() {
    // this.menuSelected.emit(this.selectedMenus);
    this.dialogRef.close();
  }

  addToCart(): void {
    // Check if any menus are selected
    if (this.selectedMenus.length === 0) {
      this.NoMenuSelected = true;
      console.log('No menus selected.');
      return;
    }

    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    const guestValue = loggedInUser?.custId;
    const enteredBy = loggedInUser?.id.toString();

    // Create an OrderedMeal object for each selected menu item and save it to the database
    this.selectedMenus.forEach((menu) => {
      const orderedMeal: OrderedMeal = {
        id: 0,
        guest: guestValue,
        mealid: menu.id,
        enteredBy: enteredBy,
        amount: menu.amount,
        dateEntered: new Date(),
        menu: menu,
        Submitted: false,
        paymentMainId: 0,
      };

      this.orderedMealService.createOrder(orderedMeal).subscribe(
        () => {
          // Order creation successful
          console.log('Order created successfully for menu:', menu.name);
        },
        (error) => {
          // Handle error if necessary
          console.error('Failed to create order for menu:', menu.name, error);
        }
      );
    });

    // Emit the updated selectedMenus array and its count
    this.menuSelected.emit(this.selectedMenus);
    this.menuCount.emit(this.selectedMenus.length);

    // Clear the selectedMenus item from local storage
    localStorage.removeItem('selectedMenus');

    // Close the dialog
    this.dialogRef.close();
  }
}
