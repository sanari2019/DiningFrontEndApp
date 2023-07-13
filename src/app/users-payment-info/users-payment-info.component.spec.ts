import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersPaymentInfoComponent } from './users-payment-info.component';

describe('UsersPaymentInfoComponent', () => {
  let component: UsersPaymentInfoComponent;
  let fixture: ComponentFixture<UsersPaymentInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsersPaymentInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersPaymentInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
