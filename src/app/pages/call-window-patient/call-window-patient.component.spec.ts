import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallWindowPatientComponent } from './call-window-patient.component';

describe('CallWindowPatientComponent', () => {
  let component: CallWindowPatientComponent;
  let fixture: ComponentFixture<CallWindowPatientComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallWindowPatientComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallWindowPatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
