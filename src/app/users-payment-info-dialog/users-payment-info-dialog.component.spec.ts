import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersPaymentInfoDialogComponent } from './users-payment-info-dialog.component';

describe('UsersPaymentInfoDialogComponent', () => {
  let component: UsersPaymentInfoDialogComponent;
  let fixture: ComponentFixture<UsersPaymentInfoDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsersPaymentInfoDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersPaymentInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
