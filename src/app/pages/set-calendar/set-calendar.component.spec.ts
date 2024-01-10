import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SetCalendarComponent } from './set-calendar.component';

describe('SetCalendarComponent', () => {
  let component: SetCalendarComponent;
  let fixture: ComponentFixture<SetCalendarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetCalendarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
