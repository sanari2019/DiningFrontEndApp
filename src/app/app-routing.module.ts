import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './pages/about/about.component';
import { HelpComponent } from './pages/help/help.component';
import { HomeComponent } from './pages/home/home.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { RegistrationDetailComponent } from './registration-detail/registration-detail.component';
import { RegistrationListComponent } from './registration-list/registration-list.component';
import { RegistrationEditComponent } from './registration-edit/registration-edit.component';
import { AuthGuard } from './auth/auth.guard';
import { PaymentComponent } from './payment/payment.component';
import { VoucherComponent } from './voucher/voucher.component';
import { StaffpaymentComponent } from './staffpayment/staffpayment.component';
import { PaymentDetailComponent } from './payment-detail/payment-detail.component';
import { VoucherNewComponent } from './voucher-new/voucher-new.component';
import { OutsourcedpaymentComponent } from './outsourcedpayment/outsourcedpayment.component';
import { GuestpaymentComponent } from './guestpayment/guestpayment.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { UsersPaymentInfoComponent } from './users-payment-info/users-payment-info.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { AdministrationComponent } from './pages/Administration/administration.component';
import { ReportComponent } from './report/report.component';
import { TransferAndReportsComponent } from './transfer-and-reports/transfer-and-reports.component';




const routes: Routes = [
  {
    path: '', component: HomeComponent, canActivate: [AuthGuard],
    //   // pathMatch: 'full',
    // redirectTo: 'payment'
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  {
    path: 'registrations',
    component: RegistrationListComponent,
  },
  { path: 'home', component: HomeComponent },
  { path: 'users-payment-info', component: UsersPaymentInfoComponent },
  {
    path: 'payment',
    component: PaymentComponent,
  },
  {
    path: 'voucher',
    component: VoucherComponent,
  },
  {
    path: 'voucherdetails',
    component: PaymentDetailComponent,
  },
  {
    path: 'voucheredit',
    component: VoucherNewComponent,
  },
  {
    path: 'registrations/:id',
    component: RegistrationEditComponent,
  },
  {
    path: 'registration',
    component: RegistrationComponent,
  },

  {
    path: 'staffpayment',
    component: StaffpaymentComponent,
  },
  {
    path: 'outsourcedpayment',
    component: OutsourcedpaymentComponent,
  },
  {
    path: 'guestpayment',
    component: GuestpaymentComponent,
  },

  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'profile',
    component: ProfileComponent,
  },
  {
    path: 'administration',
    component: AdministrationComponent,
  },
  {
    path: 'about',
    component: AboutComponent,
  },
  {
    path: 'transfer',
    component: TransferAndReportsComponent,
  },
  {
    path: 'help',
    component: HelpComponent,
  },
  {
    path: 'report',
    component: ReportComponent,
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
  { path: 'welcome', component: WelcomeComponent },
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },
  { path: '**', redirectTo: '/welcome' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
