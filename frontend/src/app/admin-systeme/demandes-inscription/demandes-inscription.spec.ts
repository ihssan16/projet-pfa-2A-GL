import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandesInscription } from './demandes-inscription';

describe('DemandesInscription', () => {
  let component: DemandesInscription;
  let fixture: ComponentFixture<DemandesInscription>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandesInscription],
    }).compileComponents();

    fixture = TestBed.createComponent(DemandesInscription);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
