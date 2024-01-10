import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelaunchComponent } from './relaunch.component';

describe('RelaunchComponent', () => {
  let component: RelaunchComponent;
  let fixture: ComponentFixture<RelaunchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RelaunchComponent]
    });
    fixture = TestBed.createComponent(RelaunchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
