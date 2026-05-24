import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionElevesComponent } from './gestion-eleves';

describe('GestionEleves', () => {
  let component: GestionElevesComponent;
  let fixture: ComponentFixture<GestionElevesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionElevesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionElevesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
