import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionEleves } from './gestion-eleves';

describe('GestionEleves', () => {
  let component: GestionEleves;
  let fixture: ComponentFixture<GestionEleves>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionEleves],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionEleves);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
