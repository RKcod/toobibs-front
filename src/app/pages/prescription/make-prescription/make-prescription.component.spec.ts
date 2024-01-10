import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MakePrescriptionComponent } from './make-prescription.component';

describe('MakePrescriptionComponent', () => {
  let component: MakePrescriptionComponent;
  let fixture: ComponentFixture<MakePrescriptionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MakePrescriptionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MakePrescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
