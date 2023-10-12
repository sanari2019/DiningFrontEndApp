import { NgModule } from '@angular/core';
import { Angular4PaystackModule } from 'angular4-paystack';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AdministrationComponent } from './pages/Administration/administration.component';
import { AboutComponent } from './pages/about/about.component';
import { HelpComponent } from './pages/help/help.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RegistrationEditComponent } from './registration-edit/registration-edit.component';
import { RegistrationDetailComponent } from './registration-detail/registration-detail.component';
import { RegistrationListComponent } from './registration-list/registration-list.component';
import { EncrDecrService } from '../app/shared/EncrDecrService.service';
import { AuthService } from './auth/auth.service';
import { AppMaterialModule } from './app-material/app-material.module';
import { AuthGuard } from './auth/auth.guard';
import { PaymentComponent } from './payment/payment.component';
import { VoucherComponent } from './voucher/voucher.component';
import { MatTabsModule } from '@angular/material/tabs'; // Import the MatTabsModule
import { StaffpaymentComponent } from './staffpayment/staffpayment.component';
import { PaymentDetailComponent } from './payment-detail/payment-detail.component';
import { VoucherNewComponent } from './voucher-new/voucher-new.component';
import { OutsourcedpaymentComponent } from './outsourcedpayment/outsourcedpayment.component';
import { GuestpaymentComponent } from './guestpayment/guestpayment.component';
import { AppMenuComponent } from './appmenu.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { OnlinepaymentComponent } from './onlinepayment/onlinepayment.component';
import { CommonModule } from '@angular/common';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { EmailComponent } from './email/email.component';
import { UsersPaymentInfoComponent } from './users-payment-info/users-payment-info.component';
import { WelcomeComponent } from './welcome/welcome.component';
//import { ReactiveFormEmailValidationComponent } from "./components/reactive-form-email-validation/reactive-form-email-validation.component";
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UsersPaymentInfoDialogComponent } from './users-payment-info-dialog/users-payment-info-dialog.component';
import { MenuDialogComponent } from './menu-dialog/menu-dialog.component';
import { DialogContentComponent } from './dialog-content/dialog-content.component';
import { RegistrationDialogComponent } from './registration-dialog/registration-dialog.component';
import { MealNameDialogComponent } from './meal-name-dialog/meal-name-dialog.component';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FooterComponent } from './footer/footer.component';
import { LoaderComponent } from './loader/loader.component';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoaderInterceptor } from './loader/loader.interceptor';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PaymentbreakdownComponent } from './paymentbreakdown/paymentbreakdown.component';
import { APP_INITIALIZER } from '@angular/core';
import { Router } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { CdkTableModule } from '@angular/cdk/table';
import { MatSortModule } from '@angular/material/sort';
import { MatTableExporterModule } from 'mat-table-exporter';
import { ExportService } from './shared/services/export.service';
import { NgChartsModule } from 'ng2-charts';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { LayoutModule } from '@angular/cdk/layout';
import { ReportComponent } from './report/report.component';





export function appInitializer(authService: AuthService, router: Router) {
  return () => {
    // Check if the user is authenticated
    if (authService.isLoggedIn) {
      // If authenticated, navigate to the home page
      router.navigate(['']);
    }
  };
}




@NgModule({
  declarations: [FooterComponent, AppComponent, AppMenuComponent, HomeComponent, ForgotPasswordComponent, ProfileComponent, AdministrationComponent, AboutComponent, HelpComponent, NotFoundComponent, LoginComponent, RegistrationComponent, RegistrationEditComponent, RegistrationDetailComponent, RegistrationListComponent, PaymentComponent, VoucherComponent, StaffpaymentComponent, PaymentDetailComponent, VoucherNewComponent, OutsourcedpaymentComponent, GuestpaymentComponent, OnlinepaymentComponent, EmailComponent, UsersPaymentInfoComponent, WelcomeComponent, UsersPaymentInfoDialogComponent, MenuDialogComponent, DialogContentComponent, RegistrationDialogComponent, MealNameDialogComponent, FooterComponent, LoaderComponent, PaymentbreakdownComponent, ReportComponent],
  imports: [
    Angular4PaystackModule.forRoot('pk_test_eb1ec536ffda8c468b1cab7846a0ff1c27e7bb91'),
    MatProgressBarModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatTableExporterModule,
    MatPaginatorModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    NgChartsModule,
    MatDividerModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    AppMaterialModule,
    MatTabsModule, // Add MatTabsModule to the imports
    MatButtonModule,
    MatDialogModule,
    CommonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    CdkTableModule,
    MatSortModule,
    FlexLayoutModule,
    CarouselModule.forRoot(),
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    LayoutModule,


  ],
  providers: [ExportService, { provide: LocationStrategy, useClass: HashLocationStrategy }, { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true }, EncrDecrService, AuthService, {
    provide: APP_INITIALIZER,
    useFactory: appInitializer,
    multi: true,
    deps: [AuthService, Router],
  }, AuthGuard],
  bootstrap: [AppComponent],
  // entryComponents: [LoaderComponent],
})
export class AppModule { }
