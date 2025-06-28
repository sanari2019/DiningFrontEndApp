import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SquadPaymentDialogComponent } from './squad-payment-dialog.component';

describe('SquadPaymentDialogComponent', () => {
  let component: SquadPaymentDialogComponent;
  let fixture: ComponentFixture<SquadPaymentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SquadPaymentDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SquadPaymentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
