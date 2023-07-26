import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { FormBuilder, FormControl, FormControlName, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fromEvent, merge } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { EncrDecrService } from '../shared/EncrDecrService.service';
import { GenericValidator } from '../shared/generic-validator';
import { Payment } from '../staffpayment/payment.model';
import { PaymentService } from '../staffpayment/payment.service';
import { Menu } from './menu.model';
import { MenuService } from './menu.service';
import { OrderedMeal } from './orderedmeal.model';
import { OrderedMealService } from './orderedmeal.service';
import { Registration } from '../registration/registration.model';

import { MatDialog } from '@angular/material/dialog';
import { MenuDialogComponent } from '../menu-dialog/menu-dialog.component';
import { DialogContentComponent } from '../dialog-content/dialog-content.component';
import { PaymentDetailService } from '../payment-detail/paymentdetail.service';
import { PaymentDetail } from '../payment-detail/paymentdetail.model';
@Component({
  selector: 'app-guestpayment',
  templateUrl: './guestpayment.component.html',
  styleUrls: ['./guestpayment.component.scss']
})
export class GuestpaymentComponent implements OnInit {

  amountValue: number = 0;
  @ViewChildren(FormControlName, { read: ElementRef })
  formInputElements: ElementRef[] = [];
  pageTitle = "New Guest/Staff ticket"
  staffid = 3;
  errorMessage = '';
  loggedInUser: any;
  public registration: Registration | undefined;
  orderedMealForm!: FormGroup;
  // voucherForm!:FormGroup;
  menus!: Menu[];
  menu!: Menu;
  payment!: Payment;
  ordMeal!: OrderedMeal;
  private sub!: Subscription;
  private validationMessages!: { [key: string]: { [key: string]: string } };
  private genericValidator!: GenericValidator;

  selectedMenus: Menu[] = [];
  orderedMeals: OrderedMeal[] = []; // Add the orderedMeals property
  paymentDetails: PaymentDetail[] = [];
  ordmeal: OrderedMeal = new OrderedMeal();


  constructor(private dialog: MatDialog, private ordmealfb: FormBuilder, private router: Router, private menuservice: MenuService, private ordmealservice: OrderedMealService, private paymentservice: PaymentService, private paymentdetailService: PaymentDetailService, private encdecservice: EncrDecrService) {

  }
  openMenuDialog(): void {
    const dialogRef = this.dialog.open(MenuDialogComponent, {
      width: '500px',
      // data: { menus: this.menus }
    });
    dialogRef.componentInstance.menuSelected.subscribe((selectedMenus: Menu[]) => {
      // Update selectedMenus array with the selected menu items from the dialog
      this.selectedMenus = selectedMenus;
      this.updateChooseMealInput(); // Update the "Choose Meal" input with the count of selected items
    });


    dialogRef.afterClosed().subscribe((selectedMenus: Menu[]) => {
      // if (selectedMenus && selectedMenus.length > 0) {
      //   // Update selectedMenus array with the selected menu items from the dialog
      //   this.selectedMenus = selectedMenus;
      //   // Set the value of "Choose Meal" input to display the count of selected menu items
      //   this.orderedMealForm.get('mealid')?.setValue(`${selectedMenus.length} items`);
      // }
    });
  }
  private updateChooseMealInput() {
    this.orderedMealForm.get('mealid')?.setValue(`${this.selectedMenus.length} items`);
  }
  // Method to get the count of selected menu items
  getSelectedMenuCount(): number {
    return this.selectedMenus.length;
  }
  openDialog(): void {
    const dialogRef = this.dialog.open(DialogContentComponent, {
      width: '500px',
      data: { orderedMeals: this.orderedMeals },
    });

    dialogRef.afterClosed().subscribe(() => {
      console.log('The dialog was closed');
      this.ngOnInit();
    });
  }


  formatWithCommas(value: number | null): string {
    if (value === null) {
      return '';
    }

    const formatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return formatter.format(value);
  }


  ngOnInit(): void {
    // const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    // const customerId = loggedInUser?.firstName;
    // Retrieve the custId value from local storage
    this.loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    this.orderedMealForm = this.ordmealfb.group({
      guest: [this.loggedInUser?.custId, [Validators.required, Validators.minLength(3)]],
      // Amount: ['', Validators.required,Validators.minLength(3)]
      mealid: ['', Validators.required],
      amount: [{ value: '', disabled: true }, Validators.required],
      paymentTypeId: [2],
      custTypeId: [2],

    });
    // this.voucherForm=this.fb2.group({
    //   'id':[null]
    // })
    const user = localStorage.getItem('user');
    this.registration = user ? JSON.parse(user) : undefined;
    this.getMenus();
    this.getOrderedMealsByCust(); // Fetch ordered meals for the current user
  }
  getOrderedMealsByCust() {
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    const customerId = loggedInUser?.id;

    this.ordmealservice.getOrderedMealsByCust(customerId).subscribe(
      (orderedMeals) => {
        this.orderedMeals = orderedMeals;
      },
      (error) => {
        console.error('Error fetching ordered meals:', error);
      }
    );
  }


  rmvItem(ordMeal: OrderedMeal) {

    if (confirm(`Are you sure you want to remove the meal: ${ordMeal.menu.name}?`)) {
      // Remove the item from the table in the UI
      const index = this.orderedMeals.indexOf(ordMeal);
      if (index !== -1) {
        this.orderedMeals.splice(index, 1);
      }
      this.ordmeal.amount = ordMeal.amount;
      this.ordmeal.dateEntered = ordMeal.dateEntered;
      this.ordmeal.id = ordMeal.id;
      this.ordmeal.enteredBy = ordMeal.enteredBy;
      this.ordmeal.guest = ordMeal.guest;
      this.ordmeal.mealid = ordMeal.mealid;
      this.ordmeal.menu = ordMeal.menu;
      this.ordmealservice.deleteOrder(this.ordmeal).subscribe(
        () => {
          // Removal from the backend was successful
          console.log('Item removed from the backend.');
        },
        error => {
          // Handle error if necessary
          console.error('Failed to remove item from the backend:', error);
        }
      );
    }

  }


  saveOrderedMeal(): void {

    var loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    // this.registration = loggedInUser !== null ? JSON.parse(loggedInUser) : new Registration();
    const enteredBy = loggedInUser?.id.toString();
    // const amount = this.orderedMealForm.get('amount')?.value;
    const paymentTypeId = this.orderedMealForm.get('paymentTypeId')?.value;
    const custtype = loggedInUser?.custTypeId;
    const guestValue = this.loggedInUser.custId;



    if (this.orderedMealForm.valid && this.selectedMenus.length > 0) {
      if (this.orderedMealForm.dirty) {
        // Add all selected menu items from the closed menu-dialog to the orderedMeals array
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
          this.orderedMeals.push(orderedMeal);
          // Call createOrder() for each selected menu item
          // if (confirm(`You are about to generate a ticket for Staff: ${guestValue}?`)) {
          this.ordmealservice.createOrder(orderedMeal).subscribe(
            () => {
              // Order creation successful
              console.log('Order created successfully for menu:', menu.name);
              this.orderedMealForm.reset();
            },
            (error) => {
              // Handle error if necessary
              console.error('Failed to create order for menu:', menu.name, error);
            }
          );
          // }
        });

        // Clear the selectedMenus item from local storage
        localStorage.removeItem('selectedMenus');

      }
      else {
        this.onSaveComplete();
      }
    }
    else {
      this.errorMessage = 'Please correct the validation errors.';
    }
  }
  // getMenus() {
  //   this.menuservice.getMenus().subscribe(res => this.menus = res, error => this.errorMessage = <any>error);
  // }
  getMenus() {
    this.menuservice.getMenus().subscribe(
      (res) => {
        this.menus = res;
      },
      (error) => {
        this.errorMessage = error;
      }
    );
  }

  onSaveComplete(): void {
    this.orderedMealForm.reset();
    // this.router.navigate(['/voucherdetails']);
  }
  onChange(value: any) {
    this.menuservice.getMenu(value.value).subscribe(res => {
      this.menu = res;
      if (this.menu !== undefined) {
        this.orderedMealForm.controls.amount.setValue(this.menu.amount);
      }
    }
    );

  }

}

