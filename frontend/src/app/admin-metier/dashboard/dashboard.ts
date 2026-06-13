import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  chargement = true;

  stats = [
    { id: 'ecoles',    label: 'Total établissements', value: '...', color: 'info',    icon: 'building'   },
    { id: 'etudiants', label: 'Total étudiants',       value: '...', color: 'primary', icon: 'people'     },
    { id: 'math',      label: 'Moy. Mathématiques',    value: '...', color: 'success', icon: 'calculator' },
    { id: 'lecture',   label: 'Moy. Lecture',          value: '...', color: 'warning', icon: 'book'       },
  ];

  parVille:        any[] = [];
  parNiveaux:      any[] = [];
  dernieresEcoles: any[] = [];
  moyennes = { math: 0, lecture: 0, ecriture: 0 };

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.chargerStats();
    } else {
      this.chargement = false;
    }
  }

  chargerStats() {
    this.http.get<any>(
      'http://localhost:8000/api/stats-admin-metier/',
      this.authService['getHeaders']()
    ).subscribe({
      next: (data) => {
        this.mettreAJourStat('ecoles',    String(data.total_ecoles));
        this.mettreAJourStat('etudiants', String(data.total_etudiants));
        this.mettreAJourStat('math',      String(data.moyennes.math));
        this.mettreAJourStat('lecture',   String(data.moyennes.lecture));
        this.parVille        = data.par_ville;
        this.parNiveaux      = data.par_niveaux;
        this.dernieresEcoles = data.dernieres_ecoles;
        this.moyennes        = data.moyennes;
        this.chargement = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur stats admin métier', err);
        if (err.status === 401) this.logout();
        this.chargement = false;
        this.cdr.detectChanges();
      }
    });
  }

  mettreAJourStat(id: string, valeur: string) {
    const i = this.stats.findIndex(s => s.id === id);
    if (i !== -1) {
      this.stats[i].value = valeur;
      this.cdr.detectChanges();
    }
  }

  getMaxVille(): number {
    return Math.max(...this.parVille.map((v: any) => v.count), 1);
  }

  getMaxNiveaux(): number {
    return Math.max(...this.parNiveaux.map((n: any) => n.count), 1);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}