import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthentificationComponent } from './authentification';

describe('Authentification', () => {
  let component: AuthentificationComponent;
  let fixture: ComponentFixture<AuthentificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthentificationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthentificationComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
