import { Component, afterNextRender, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-gestion-eleves',
  standalone: true,
  imports: [CommonModule, RouterLink, HttpClientModule],
  templateUrl: './gestion-eleves.html',
  styleUrls: ['./gestion-eleves.css']
})
export class GestionElevesComponent {
  
  elevesInscrits: any[] = []; 

  pageActuelle: number = 1;
  elevesParPage: number = 20;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {
    afterNextRender(() => {
      this.chargerEleves();
    });
  }

  chargerEleves() {
    const token = localStorage.getItem('access') || localStorage.getItem('access_token');
    if (!token) return;

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get('http://localhost:8000/api/mes-eleves/', { headers }).subscribe({
      next: (data: any) => {
        this.elevesInscrits = data;
        this.pageActuelle = 1; 
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error("Erreur chargement élèves :", err)
    });
  }

  get elevesAffiches() {
    const indexDebut = (this.pageActuelle - 1) * this.elevesParPage;
    const indexFin = indexDebut + this.elevesParPage;
    return this.elevesInscrits.slice(indexDebut, indexFin);
  }

  get totalPages() {
    return Math.ceil(this.elevesInscrits.length / this.elevesParPage);
  }

  get pages() {
    return Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }

  changerPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.pageActuelle = page;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}