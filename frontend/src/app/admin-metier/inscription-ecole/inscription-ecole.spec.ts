import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InscriptionEcoleComponent } from './inscription-ecole';

describe('InscriptionEcoleComponent', () => {
  let component: InscriptionEcoleComponent;
  let fixture: ComponentFixture<InscriptionEcoleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InscriptionEcoleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InscriptionEcoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});