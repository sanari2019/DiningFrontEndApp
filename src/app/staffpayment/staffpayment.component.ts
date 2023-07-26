import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { PaystackOptions } from 'angular4-paystack';
import { FormBuilder, FormControl, FormControlName, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { fromEvent, merge } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { Subscription } from 'rxjs/internal/Subscription';
import { EncrDecrService } from '../shared/EncrDecrService.service';
import { GenericValidator } from '../shared/generic-validator';
import { Payment } from './payment.model';
import { PaymentService } from './payment.service';
import { Voucher } from '../voucher/voucher.model';
import { VoucherService } from '../voucher/voucher.service';
import { PaymentModeService } from '../shared/paymentmode.service';
import { PaymentMode } from '../shared/PaymentMode.Model';
import { Registration } from '../registration/registration.model';
import { CartService } from '../shared/cart.service';
import { PaymentDetailService } from '../payment-detail/paymentdetail.service';
import { PaymentDetail } from '../payment-detail/paymentdetail.model';
import { OnlinePayment } from '../shared/onlinepayment.model';
import { OnlinePaymentService } from '../shared/onlinepayment.service';
import { Console, log } from 'console';
import { HttpClient } from '@angular/common/http';
import { EmailService } from '../shared/email.service';
import { EmailModel } from '../shared/email.model';
// import { DecimalPipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';


import { Menu } from '../guestpayment/menu.model';
import { MenuService } from '../guestpayment/menu.service';
import { OrderedMeal } from '../guestpayment/orderedmeal.model';
import { OrderedMealService } from '../guestpayment/orderedmeal.service';
import { GuestpaymentComponent } from '../guestpayment/guestpayment.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogContentComponent } from '../dialog-content/dialog-content.component';


interface CartItem {
  id: number;
  name: string;
  unit: number;
  // amount: number;
  paymentMode: string;
}

@Component({
  selector: 'app-staffpayment',
  templateUrl: './staffpayment.component.html',
  styleUrls: ['./staffpayment.component.scss']
})
export class StaffpaymentComponent implements OnInit {

  amountValue: number = 0;
  // @ViewChildren(FormControlName, { read: ElementRef })
  // formInputElements: ElementRef[] = [];
  // pageTitle = "New Guest/Staff ticket"
  // staffid = 3;
  // errorMessage = '';
  orderedMealForm!: FormGroup;
  // voucherForm!:FormGroup;
  menus!: Menu[];
  menu!: Menu;
  // payment!: Payment;
  ordMeal!: OrderedMeal;
  // private sub!: Subscription;
  // private validationMessages!: { [key: string]: { [key: string]: string } };
  // private genericValidator!: GenericValidator;


  @ViewChildren(FormControlName, { read: ElementRef })
  formInputElements: ElementRef[] = [];
  pageTitle = "New Staff Ticket"
  message = '';
  staffid = 1;
  errorMessage = '';
  loggedInUser: any;
  paymentForm!: FormGroup;
  private formSubmitAttempt!: boolean;
  vouchers!: Voucher[];
  paymentmodes!: PaymentMode[];
  payment: Payment = new Payment();
  public registration: Registration | undefined;
  private sub!: Subscription;
  private validationMessages!: { [key: string]: { [key: string]: string } };
  private genericValidator!: GenericValidator;
  public dataFields: Object = { text: 'Value', value: 'Id' };
  Units: any = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  private loginSubscription: Subscription | undefined;

  paymentDetails: PaymentDetail[] = [];
  Id: number = 0;
  reference = '';

  orderedMeals: OrderedMeal[] = [];
  ordmeal: OrderedMeal = new OrderedMeal();
  payments: Payment[] = [];


  options: PaystackOptions = {
    amount: 0, // Prepopulate with the total amount from selected checkboxes
    email: 'newemail', // Prepopulate with the user's email
    ref: `${Math.ceil(Math.random() * 10000000000000)}`
  };



  constructor(private snackBar: MatSnackBar, private dialog: MatDialog, private menuservice: MenuService, private ordmealservice: OrderedMealService, private httpClient: HttpClient, private fbstaff: FormBuilder, private router: Router, private paymentmodeservice: PaymentModeService, private voucherservice: VoucherService, private paymentservice: PaymentService, private encdecservice: EncrDecrService, private paymentdetailService: PaymentDetailService, private cartService: CartService, private onlinePaymentService: OnlinePaymentService, private emailService: EmailService) {
    // this.validationMessages = {
    //   employeeNo: {
    //     required: 'Employee No is required.',
    //     minlength: 'Employee No must be at least three characters.'
    //   },
    // };

    this.genericValidator = new GenericValidator(this.validationMessages);

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


  validatePaymentFields(): boolean {
    // Check if any of the required fields (amount, email, key, ref) is empty
    if (!this.options.amount) {
      this.errorMessage = 'Amount cannot be empty.';
      return false;
    }

    if (!this.options.email) {
      this.errorMessage = 'Email cannot be empty.';
      return false;
    }

    if (!this.options.key) {
      this.errorMessage = 'Key cannot be empty.';
      return false;
    }

    if (!this.options.ref) {
      this.errorMessage = 'Ref cannot be empty.';
      return false;
    }

    return true;
  }
  makePayment() {
    // Retrieve selectedPaymentItems from local storage
    const selectedPaymentItems: Payment[] = JSON.parse(localStorage.getItem('selectedPaymentItems') || '[]');

    // Check if selectedPaymentItems is empty
    if (selectedPaymentItems.length === 0) {
      // Display an error message since no items are selected for payment
      this.errorMessage = 'Please select at least one item for payment.';
      return;
    }

    // If selectedPaymentItems is not empty, proceed with the payment
    // Your existing payment processing logic goes here...
    // For example, you can call the paymentDone() function here if needed.

    // Clear the error message in case it was previously set
    this.errorMessage = '';
  }




  paymentInit() {
    console.log('Payment initialized');
  }

  paymentDone(ref: any) {
    // localStorage.removeItem('selectedPaymentItems');
    // Validate payment fields before processing payment
    if (!this.validatePaymentFields()) {
      return;
    }

    // Retrieve selectedPaymentItems from local storage
    const selectedPaymentItems: Payment[] = JSON.parse(localStorage.getItem('selectedPaymentItems') || '[]');
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');

    const payment: OnlinePayment = {
      id: 0, // Update with the appropriate ID
      TransRefNo: this.options.ref.toString(),
      TransDate: new Date(),
      Paidby: this.loggedInUser.id,
      AmountPaid: this.options.amount / 100
    };

    this.onlinePaymentService.postOnlinePayment(payment).subscribe(
      (result: any) => {
        // Handle success, e.g., show a success message or navigate to a success page
        console.log("Successful");

        this.ngOnInit();


        // Call the updatePayment method for each selected payment item
        for (const paymentItem of selectedPaymentItems) {
          paymentItem.opaymentid = result.id; // Use the ID returned from the onlinePaymentService
          paymentItem.timepaid = new Date();
          paymentItem.paid = true;



          // Call the updatePayment method in your service to update the payment item
          this.paymentservice.updatePayment(paymentItem).subscribe(
            (updatedPaymentItem: Payment) => {
              // Handle successful update if needed
              console.log("Update")
            },
            (error: any) => {
              // Handle error if necessary
              console.log("failed")
            }
          );
        }

        // Optionally, update the selectedPaymentitems array in local storage if needed
        // localStorage.setItem('selectedPaymentitems', JSON.stringify(selectedPaymentItems));
        this.ngOnInit();
      },


      error => {
        console.log("Not successful");
      }
    );


  }

  paymentCancel() {
    if (!this.validatePaymentFields()) {
      return;
    }
    this.calculateTotalAmount();
    this.options.ref = `${Math.random() * 10000000000000}`;
    console.log('payment failed');
    // this.options.ref = ref;
    console.log('Payment cancelled');
  }
  setRandomPaymentRef() {
    this.reference = `${Math.random() * 10000000000000}`;
    this.options.ref = this.reference;
  }



  ngOnInit(): void {
    this.setRandomPaymentRef()
    localStorage.removeItem('selectedPaymentItems');
    // Fetch user payment details from the API (assuming it populates the `paymentDetails` array)
    // const userId = this.Id; // Replace 'userid' with the actual user ID
    // this.paymentdetailService.getPaymentDetailsByUserId(userId).subscribe(
    //   (pymtdetails: PaymentDetail[]) => {
    //     this.paymentDetails = pymtdetails;
    //     // this.filteredPaymentDetails = this.paymentDetails;
    //   });

    // Initialize other data (e.g., user's email)
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    this.options.email = loggedInUser?.userName;
    this.setRandomPaymentRef();



    // Retrieve the custId value from local storage
    this.loggedInUser = loggedInUser
    this.paymentForm = this.fbstaff.group({
      custCode: [this.loggedInUser?.custId, [Validators.required, Validators.minLength(3)]],
      voucherId: ['', [Validators.required, Validators.minLength(1)]],
      paymentmodeid: [3],
      unit: ['', Validators.required],
      paymentTypeId: [1],
    });
    // this.voucherForm=this.fb2.group({
    //   'id':[null]
    // })
    // Access the locally stored user information
    const user = localStorage.getItem('user');
    this.registration = user ? JSON.parse(user) : undefined;
    this.getVouchers();
    this.getpaymentmodes();
    // Fetch user payment details from the API
    // const userId = 'userid'; // Replace 'userid' with the actual user ID
    // Initialize other data (vouchers, units, payment modes, etc.)
    this.vouchers = []; // Initialize with the available vouchers
    // this.Units = []; // Initialize with the available units
    this.calculateTotalAmount();; // Initialize with the default amount
    this.paymentmodes = []; // Initialize with the available payment modes

    // var loggeinuser = localStorage.getItem('user');
    // this.registration = loggeinuser !== null ? JSON.parse(loggeinuser) : new Registration();


    // Example 2: Checking if the value is defined
    if (this.registration !== undefined) {
      // Assign the value to the property
      this.Id = this.registration?.id;
      // const registrationId: number = this.registration.id;
    }

    // this.paymentdetailService.getPaymentDetailsByUserId(this.Id).subscribe(
    //   (pymtdetails: PaymentDetail[]) => {
    //     for (let i = 0; i < pymtdetails.length; i++) {
    //       this.paymentDetails.push(pymtdetails[i]);
    //     }
    //     // for (const item of pymtdetails) {
    //     //   if (item.PaymentType == 1) {
    //     //     this.paymentDetails.push(item);
    //     //   }
    //     // }
    //     // this.filteredPaymentDetails = this.paymentDetails;
    //   }
    // );

    this.paymentdetailService.getPaymentDetailsByUserId(this.Id).subscribe(
      (pymtdetails: PaymentDetail[]) => {
        this.paymentDetails = pymtdetails;
        // this.filteredPaymentDetails = this.paymentDetails;
      });

    //  // Check local storage for saved payment items
    // const savedItems = localStorage.getItem('selectedPaymentItems');
    // if (savedItems) {
    //   this.paymentDetails = JSON.parse(savedItems);
    // }
    // Retrieve the custId value from local storage
    // this.loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    this.orderedMealForm = this.fbstaff.group({
      guest: [this.loggedInUser?.custId, [Validators.required, Validators.minLength(3)]],
      // Amount: ['', Validators.required,Validators.minLength(3)]
      mealid: ['', Validators.required],
      amount: [{ value: '', disabled: true }, Validators.required],
      paymentTypeId: [2],
      // custTypeId: [1],

    });
    // this.voucherForm=this.fb2.group({
    //   'id':[null]
    // })
    this.getMenus();
    this.getOrderedMealsByCust(this.loggedInUser?.id);
    // this.paymentservice.getPayment().subscribe(
    //   (payments: Payment[]) => {
    //     this.payments = payments;
    //   },
    //   (error: any) => {
    //     console.error(error);
    //   }
    // );
  }
  getOrderedMealsByCust(userId: number): void {
    this.ordmealservice.getOrderedMealsByCust(userId)
      .subscribe(
        orderedMeals => this.orderedMeals = orderedMeals,
        error => this.errorMessage = error
      );
  }


  saveOrderedMeal(): void {



    var loggedInUser = localStorage.getItem('user') || '{}';
    this.registration = loggedInUser !== null ? JSON.parse(loggedInUser) : new Registration();
    const enteredBy = this.registration?.id.toString();
    const amount = this.orderedMealForm.get('amount')?.value;
    const paymentTypeId = this.orderedMealForm.get('paymentTypeId')?.value;
    const custtype = this.orderedMealForm.get('custTypeId')?.value;


    if (this.orderedMealForm.valid) {
      if (this.orderedMealForm.dirty) {
        const p = { ...this.ordMeal, ...this.orderedMealForm.value };
        if (p.mealid !== 0) {
          p.dateEntered = new Date();
          p.enteredBy = enteredBy;
          p.amount = amount;
          p.PaymentType = paymentTypeId;
          p.custtypeid = custtype;

          if (confirm(`You are about to generate a ticket for Staff: ${p.enteredBy}?`)) {
            this.ordmealservice.createOrder(p)
              .subscribe({
                next: () => this.onSaveComplete(),
                error: err => this.errorMessage = err
              });
          }
        } else {
          this.ordmealservice.updateOrder(p)
            .subscribe({
              next: () => this.onSaveComplete(),
              error: err => this.errorMessage = err
            });
        }
      }
      else {
        this.onSaveComplete();
      }
    }
    else {
      this.errorMessage = 'Please correct the validation errors.';
    }
  }
  getMenus() {
    this.menuservice.getMenus().subscribe(res => this.menus = res, error => this.errorMessage = <any>error);
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


  //   updateLocalStorage(pymtdetails: PaymentDetail) {
  //   if (pymtdetails.selected) {
  //     // Add the item to local storage
  //     if (!this.paymentDetails.some(item => item.id === pymtdetails.id)) {
  //       this.paymentDetails.push(pymtdetails);
  //     }
  //   } else {
  //     // Remove the item from local storage
  //     this.paymentDetails = this.paymentDetails.filter(item => item.id !== pymtdetails.id);
  //   }

  //   // Update the local storage with the updated payment items
  //   localStorage.setItem('selectedPaymentItems', JSON.stringify(this.paymentDetails));
  // }



  removeItem(pymtdetails: PaymentDetail): void {
    // Remove the item from the `paymentDetails` array
    const index = this.paymentDetails.indexOf(pymtdetails);
    if (index > -1) {
      this.paymentDetails.splice(index, 1);
    }
    this.calculateTotalAmount(); // Update the total amount when an item is removed
    this.payment.amount = pymtdetails.amount;
    this.payment.custCode = pymtdetails.custCode;
    this.payment.dateEntered = pymtdetails.dateEntered;
    this.payment.enteredBy = pymtdetails.enteredBy;
    this.payment.id = pymtdetails.id;
    this.payment.paymentmodeid = pymtdetails.paymentmodeid;
    this.payment.unit = pymtdetails.unit;
    this.payment.voucherId = pymtdetails.voucherid;
    this.payment.servedby = "";
    this.paymentdetailService.removePymtdetails(this.payment)
      .subscribe({
        next: () => this.onSaveComplete(),
        error: err => this.errorMessage = err
      });
  }

  // isAnyCheckboxSelected(): boolean {
  //   const selectedItems = this.paymentDetails.filter(pymtdetails => pymtdetails.selected);
  //   const totalAmount = selectedItems.reduce((sum, pymtdetails) => sum + pymtdetails.unit * pymtdetails.amount * 100, 0);
  //   this.options.amount = totalAmount;
  //   return selectedItems.length > 0;
  // }

  // selectAllItems(): void {
  //   for (const pymtdetails of this.paymentDetails) {
  //     pymtdetails.selected = this.selectAll;
  //   }
  //   this.updateTotalAmount(); // Update the total amount when selection changes
  // }


  // updateTotalAmount(): void {
  //   const selectedItems = this.paymentDetails.filter(pymtdetails => pymtdetails.selected);
  //   const totalAmount = selectedItems.reduce((sum, pymtdetails) => sum + pymtdetails.unit * pymtdetails.amount *100 , 0);
  //   this.options.amount = totalAmount;
  // }

  checkout() {
    // Function called when the Checkout button is clicked
    // Implement your payment gateway logic here
  }

  calculateTotalAmount(): void {
    const selectedItems = this.paymentDetails.filter(pymtdetails => pymtdetails.selected);
    const totalAmount = selectedItems.reduce((sum, pymtdetails) => sum + pymtdetails.unit * pymtdetails.amount, 0);
    this.options.amount = totalAmount * 100; // Multiply by 100 to convert to kobo (Paystack's currency unit)
  }


  selectAll: boolean = false;
  // isButtonDisabled = true;

  toggleSelectAll() {
    if (this.selectAll) {
      // Add all items to local storage
      this.paymentDetails.forEach(item => {
        if (!item.selected) {
          item.selected = true;
          this.addToLocalStorage(item);
        }
      });
    } else {
      // Remove all items from local storage
      this.paymentDetails.forEach(item => {
        if (item.selected) {
          item.selected = false;
          this.removeFromLocalStorage(item);
        }
      });
    }
    // // Check if at least one item is selected
    // const atLeastOneSelected = this.paymentDetails.some(item => item.selected);
    // this.isButtonDisabled = !atLeastOneSelected;
    this.calculateTotalAmount(); // Calculate and update the total amount
  }


  updateLocalStorage(item: PaymentDetail) {
    if (item.selected) {
      this.addToLocalStorage(item);
    } else {
      this.removeFromLocalStorage(item);
    }
    this.calculateTotalAmount(); // Calculate and update the total amount
  }

  addToLocalStorage(item: PaymentDetail) {
    const selectedItems = JSON.parse(localStorage.getItem('selectedPaymentItems') || '[]');
    selectedItems.push(item);
    localStorage.setItem('selectedPaymentItems', JSON.stringify(selectedItems));
  }

  removeFromLocalStorage(item: PaymentDetail) {
    let selectedItems = JSON.parse(localStorage.getItem('selectedPaymentItems') || '[]');
    selectedItems = selectedItems.filter((selectedItem: PaymentDetail) => selectedItem.id !== item.id);
    localStorage.setItem('selectedPaymentItems', JSON.stringify(selectedItems));
  }




  isFieldInvalid(field: string) {
    return (
      (!this.paymentForm.get(field)?.valid && this.paymentForm.get(field)?.touched) ||
      (this.paymentForm.get(field)?.untouched && this.formSubmitAttempt)
    );
  }
  savePayment(): void {
    // console.log(this.registrationForm);
    // console.log('Saved: ' + JSON.stringify(this.registrationForm.value));
    if (this.paymentForm.valid) {
      const voucherId = this.paymentForm.get('voucherId')?.value;
      const unit = this.paymentForm.get('unit')?.value;
      const paymentTypeId = this.paymentForm.get('paymentTypeId')?.value;

      const voucherDescription = this.vouchers.find(voucher => voucher.id === voucherId)?.description;
      const cartItem = { content: `${voucherDescription} - Units: ${unit}`, selected: false }; // Create the cart item object

      if (this.paymentForm.dirty) {
        const p = { ...this.payment, ...this.paymentForm.value };
        if (p.custCode !== '') {
          p.dateEntered = new Date();
          var loggeinuser = localStorage.getItem('user');
          this.registration = loggeinuser !== null ? JSON.parse(loggeinuser) : new Registration();
          p.enteredBy = this.registration?.id.toString();
          p.custtypeid = 1;
          p.servedby = "";
          p.PaymentType = paymentTypeId
          if (confirm(`You are about to generate a ticket for Staff: ${p.custCode}?`)) {
            this.paymentservice.createPayment(p)
              .subscribe({
                next: () => this.onSaveComplete(),
                error: err => this.errorMessage = err
              });
          }
        } else if (p.custCode === '') {
          this.pageTitle = "Enter Employee Code";
          //  this.paymentservice.updatePayment(p)
          //  .subscribe({
          //    next: () => this.onSaveComplete(),
          //     error: err => this.errorMessage = err
          //    });
        }
      }
      // else
      // {
      //  this.onSaveComplete();
      // }
    }
    else {
      this.errorMessage = 'Please correct the validation errors.';
    }
    this.onSaveComplete();
  }
  getVouchers() {
    this.voucherservice.getVoucher(this.staffid).subscribe(res => this.vouchers = res, error => this.errorMessage = <any>error);
  }

  getpaymentmodes() {
    this.paymentmodeservice.getPaymentModes().subscribe(res => this.paymentmodes = res, error => this.errorMessage = <any>error);
  }

  onSaveComplete(): void {
    this.ngOnInit();
  }

  onChange(mealid: any) {
    this.menuservice.getMenu(mealid.value).subscribe(res => {
      this.menu = res;
      if (this.menu !== undefined) {
        this.orderedMealForm.controls.amount.setValue(this.menu.amount);
      }
    }
    );

  }
}

