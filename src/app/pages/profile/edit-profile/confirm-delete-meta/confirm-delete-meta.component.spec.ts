import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDeleteMetaComponent } from './confirm-delete-meta.component';

describe('ConfirmDeleteMetaComponent', () => {
  let component: ConfirmDeleteMetaComponent;
  let fixture: ComponentFixture<ConfirmDeleteMetaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmDeleteMetaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmDeleteMetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
