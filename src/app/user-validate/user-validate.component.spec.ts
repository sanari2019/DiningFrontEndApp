import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserValidateComponent } from './user-validate.component';

describe('UserValidateComponent', () => {
  let component: UserValidateComponent;
  let fixture: ComponentFixture<UserValidateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserValidateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserValidateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
