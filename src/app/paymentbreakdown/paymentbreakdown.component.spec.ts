import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentbreakdownComponent } from './paymentbreakdown.component';

describe('PaymentbreakdownComponent', () => {
  let component: PaymentbreakdownComponent;
  let fixture: ComponentFixture<PaymentbreakdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentbreakdownComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentbreakdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
