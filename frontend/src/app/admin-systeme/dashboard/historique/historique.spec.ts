import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoriqueComponent } from './historique'; 
import { AuthService } from '../../../auth.service';
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('HistoriqueComponent', () => {
  let component: HistoriqueComponent;
  let fixture: ComponentFixture<HistoriqueComponent>;
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = {
      listerUtilisateurs: () => of({ results: [] })
    };

    await TestBed.configureTestingModule({
      imports: [HistoriqueComponent], 
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([]) 
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoriqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});