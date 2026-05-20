import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RapportsComponent } from './rapports';

describe('Rapports', () => {
  let component: RapportsComponent;
  let fixture: ComponentFixture<RapportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RapportsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RapportsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
