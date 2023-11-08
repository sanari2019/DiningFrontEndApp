import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatemealdialogComponent } from './createmealdialog.component';

describe('CreatemealdialogComponent', () => {
  let component: CreatemealdialogComponent;
  let fixture: ComponentFixture<CreatemealdialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreatemealdialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatemealdialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
