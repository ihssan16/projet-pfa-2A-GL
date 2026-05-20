import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DossiersComponent } from './dossiers';

describe('Dossiers', () => {
  let component: DossiersComponent;
  let fixture: ComponentFixture<DossiersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DossiersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DossiersComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
