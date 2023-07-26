import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealNameDialogComponent } from './meal-name-dialog.component';

describe('MealNameDialogComponent', () => {
  let component: MealNameDialogComponent;
  let fixture: ComponentFixture<MealNameDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MealNameDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MealNameDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
