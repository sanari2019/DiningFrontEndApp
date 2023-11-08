import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferAndReportsComponent } from './transfer-and-reports.component';

describe('TransferAndReportsComponent', () => {
  let component: TransferAndReportsComponent;
  let fixture: ComponentFixture<TransferAndReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransferAndReportsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferAndReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
