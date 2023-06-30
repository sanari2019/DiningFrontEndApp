import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChildren } from '@angular/core';
import { PaystackOptions } from 'angular4-paystack';
import { UntypedFormBuilder, UntypedFormControl, FormControlName, UntypedFormGroup, Validators } from '@angular/forms';
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
import { Console } from 'console';

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

  @ViewChildren(FormControlName, { read: ElementRef })
  formInputElements: ElementRef[] = [];
  pageTitle="New Staff Ticket"
  message='';
  staffid=1;
  errorMessage= '';
  loggedInUser: any;
  paymentForm!: UntypedFormGroup;
  private formSubmitAttempt!: boolean;
  vouchers!: Voucher[];
  paymentmodes!:PaymentMode[];
  payment: Payment=new Payment();
  public registration: Registration | undefined;
  private sub!: Subscription;
  private validationMessages!: { [key: string]: { [key: string]: string } };
  private genericValidator!: GenericValidator;
  public dataFields:Object={text:'Value',value:'Id'};
  Units: any = [1,2,3,4,5,6,7,8,9,10];

  paymentDetails: PaymentDetail[] = [];
  Id: number = 0;
  reference='';


  selectAll: boolean = false;


  options: PaystackOptions = {
    amount: 0, // Prepopulate with the total amount from selected checkboxes
    email: 'newemail', // Prepopulate with the user's email
    ref: `${Math.ceil(Math.random() * 10e10)}`
  };
  

  
  constructor(private fbstaff: UntypedFormBuilder, private router: Router,private paymentmodeservice:PaymentModeService,private voucherservice:VoucherService, private paymentservice: PaymentService, private encdecservice:EncrDecrService, private paymentdetailService: PaymentDetailService, private cartService: CartService, private onlinepaymentService: OnlinePaymentService) {
      // this.validationMessages = {
      //   employeeNo: {
      //     required: 'Employee No is required.',
      //     minlength: 'Employee No must be at least three characters.'
      //   },
      // };

      this.genericValidator = new GenericValidator(this.validationMessages);


     }

     paymentInit() {
      console.log('Payment initialized');
    }

    paymentDone(ref: any) {
      const payment: OnlinePayment = {
        id: 0, // Update with the appropriate ID
        TransRefNo: ref,
        TransDate: Date.now(), // Update with the appropriate date
        Paidby: 0, // Update with the appropriate user ID or payment source
        AmountPaid: this.options.amount.toString() // Update with the appropriate amount
      };
    
      this.onlinepaymentService.postOnlinePayment(payment).subscribe(
        () => {
          // Handle success, e.g., show a success message or navigate to a success page
          console.log("Successful");
          
        },
        error => {
          console.log("Not successful");
        }
      );
    }
    

    paymentCancel() {
      this.options.amount = 0;
      this.options.ref = `${Math.random() * 10000000000000}`;
      console.log('payment failed');
    }
    setRandomPaymentRef() {
      this.reference = `${Math.random() * 10000000000000}`;
    }


    // onClose(){
    //   this.options.amount = 0;
    //   this.options.ref = '';
    // }



     ngOnInit(): void {
      // Fetch user payment details from the API (assuming it populates the `paymentDetails` array)
      const userId = this.Id; // Replace 'userid' with the actual user ID
      this.paymentdetailService.getPaymentDetailsByUserId(userId).subscribe(
        (pymtdetails: PaymentDetail[]) => {
          this.paymentDetails = pymtdetails;
          // this.filteredPaymentDetails = this.paymentDetails;
        });

        // Initialize other data (e.g., user's email)
    const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
    this.options.email = loggedInUser?.userName;
    this.setRandomPaymentRef();
  
   

      // Retrieve the custId value from local storage
      this.loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
      this.paymentForm = this.fbstaff.group({
        custCode: new UntypedFormControl(this.loggedInUser?.custId, [Validators.required,Validators.minLength(3)]),
        voucherId: new UntypedFormControl('',[Validators.required,Validators.min(1)]),
        paymentmodeid: new UntypedFormControl('',[Validators.required,Validators.min(1)]),
        unit: new UntypedFormControl('', Validators.required)

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
    // this.amount = ''; // Initialize with the default amount
    this.paymentmodes = []; // Initialize with the available payment modes

    var loggeinuser = localStorage.getItem('user');
    this.registration = loggeinuser !== null ? JSON.parse(loggeinuser) : new Registration();


    // Example 2: Checking if the value is defined
    if (this.registration !== undefined) {
      // Assign the value to the property
      this.Id = this.registration?.id;
      // const registrationId: number = this.registration.id;
    }


    this.paymentdetailService.getPaymentDetailsByUserId(this.Id).subscribe(
      (pymtdetails: PaymentDetail[]) => {
        this.paymentDetails = pymtdetails;
        // this.filteredPaymentDetails = this.paymentDetails;
      });


    }

    selectAllItems(): void {
      for (const pymtdetails of this.paymentDetails) {
        pymtdetails.selected = this.selectAll;
      }
      this.updateTotalAmount(); // Update the total amount when selection changes
    }


    updateTotalAmount(): void {
      const selectedItems = this.paymentDetails.filter(pymtdetails => pymtdetails.selected);
      const totalAmount = selectedItems.reduce((sum, pymtdetails) => sum + pymtdetails.unit * pymtdetails.amount *100 , 0);
      this.options.amount = totalAmount;
    }
  
    removeItem(pymtdetails: PaymentDetail): void {
          // Remove the item from the `paymentDetails` array
      const index = this.paymentDetails.indexOf(pymtdetails);
      if (index > -1) {
        this.paymentDetails.splice(index, 1);
      }
      this.updateTotalAmount(); // Update the total amount when an item is removed
      this.payment.Amount=pymtdetails.amount;
      this.payment.custCode=pymtdetails.custCode;
      this.payment.dateEntered=pymtdetails.dateEntered;
      this.payment.enteredBy=pymtdetails.enteredBy;
      this.payment.id=pymtdetails.id;
      this.payment.paymentmodeid=pymtdetails.paymentmodeid;
      this.payment.unit=pymtdetails.unit;
      this.payment.voucherId=pymtdetails.voucherid;
      this.payment.servedby = "";
      this.paymentdetailService.removePymtdetails(this.payment)
            .subscribe({
              next: () => this.onSaveComplete(),
              error: err => this.errorMessage = err
            });
    }

    isAnyCheckboxSelected(): boolean {
      const selectedItems = this.paymentDetails.filter(pymtdetails => pymtdetails.selected);
      const totalAmount = selectedItems.reduce((sum, pymtdetails) => sum + pymtdetails.unit * pymtdetails.amount * 100, 0);
      this.options.amount = totalAmount;
      return selectedItems.length > 0;
    }
    
  
    checkout() {
      // Function called when the Checkout button is clicked
      // Implement your payment gateway logic here
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

        const voucherDescription = this.vouchers.find(voucher => voucher.id === voucherId)?.description;
        const cartItem = { content: `${voucherDescription} - Units: ${unit}`, selected: false }; // Create the cart item object

       if (this.paymentForm.dirty)
       {
          const p = { ...this.payment, ...this.paymentForm.value };
           if (p.custCode !== '') {
            p.dateEntered=new Date();
            var loggeinuser = localStorage.getItem('user');
            this.registration=loggeinuser !== null? JSON.parse(loggeinuser): new Registration();
            p.enteredBy=this.registration?.id.toString();
            p.custtypeid=1;
            p.servedby="";
            if (confirm(`You are about to generate a ticket for Staff: ${p.custCode}?`))
            {
            this.paymentservice.createPayment(p)
             .subscribe({
               next: () => this.onSaveComplete(),
              error: err => this.errorMessage = err
            });
            }
          } else if (p.custCode === '') {
            this.pageTitle="Enter Employee Code";
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
}

