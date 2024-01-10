import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMetaComponent } from './add-meta.component';

describe('AddMetaComponent', () => {
  let component: AddMetaComponent;
  let fixture: ComponentFixture<AddMetaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddMetaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
