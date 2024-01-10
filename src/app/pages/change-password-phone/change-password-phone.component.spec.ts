import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePasswordPhoneComponent } from './change-password-phone.component';

describe('ChangePasswordPhoneComponent', () => {
  let component: ChangePasswordPhoneComponent;
  let fixture: ComponentFixture<ChangePasswordPhoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangePasswordPhoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePasswordPhoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
