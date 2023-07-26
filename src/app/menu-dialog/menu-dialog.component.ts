import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Menu } from '../guestpayment/menu.model';
import { MenuService } from '../guestpayment/menu.service';

@Component({
  selector: 'app-menu-dialog',
  templateUrl: './menu-dialog.component.html',
  styleUrls: ['./menu-dialog.component.scss']
})
export class MenuDialogComponent implements OnInit {
  menuList: Menu[] = [];
  filteredMenuList: Menu[] = [];
  searchText = '';
  selectedMenus: Menu[] = []; // Add selectedMenus array property
  @Output() menuSelected: EventEmitter<Menu[]> = new EventEmitter<Menu[]>(); // Emit selectedMenus when the dialog is closed
  @Output() menuCount: EventEmitter<number> = new EventEmitter<number>();


  constructor(
    private menuService: MenuService,
    private dialogRef: MatDialogRef<MenuDialogComponent>
  ) { }

  ngOnInit() {
    this.getMenuList();
    // this.selectedMenus = this.data.menus.filter(menu => menu.selected); // Restore selected menus from the data object
  }

  getMenuList() {
    this.menuService.getMenus().subscribe(
      (menus) => {
        this.menuList = menus;
        this.filteredMenuList = menus;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  filterMenuList() {
    this.filteredMenuList = this.menuList.filter((menu) =>
      menu.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  calculateTotalAmount(): number {
    return this.filteredMenuList.reduce(
      (total, menu) => (total += menu.amount),
      0
    );
  }

  calculateTotalDiscountedAmount(): number {
    return this.filteredMenuList.reduce(
      (total, menu) => (total += menu.amount * 0.6),
      0
    );
  }

  // Method to update selectedMenus array when checkbox state changes
  updateSelectedMenus(menu: Menu) {
    if (menu.selected) {
      this.selectedMenus.push(menu);
    } else {
      this.selectedMenus = this.selectedMenus.filter((item) => item.id !== menu.id);
    }
    // Save the updated selectedMenus array to local storage
    localStorage.setItem('selectedMenus', JSON.stringify(this.selectedMenus));
    // Emit the updated selectedMenus array and its count
    this.menuSelected.emit(this.selectedMenus);
    this.menuCount.emit(this.selectedMenus.length);
  }


  closeDialog() {
    this.menuSelected.emit(this.selectedMenus);
    this.dialogRef.close();
  }
}
