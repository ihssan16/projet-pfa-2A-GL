import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmploiTemps } from './emploi-temps';

describe('EmploiTemps', () => {
  let component: EmploiTemps;
  let fixture: ComponentFixture<EmploiTemps>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmploiTemps],
    }).compileComponents();

    fixture = TestBed.createComponent(EmploiTemps);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
