import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorRegisteredComponent } from './doctor-registered.component';

describe('DoctorRegisteredComponent', () => {
  let component: DoctorRegisteredComponent;
  let fixture: ComponentFixture<DoctorRegisteredComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DoctorRegisteredComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorRegisteredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
