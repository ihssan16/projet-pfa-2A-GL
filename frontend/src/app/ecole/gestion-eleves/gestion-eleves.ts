import { Component, afterNextRender, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-gestion-eleves',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HttpClientModule],
  templateUrl: './gestion-eleves.html',
  styleUrls: ['./gestion-eleves.css']
})
export class GestionElevesComponent {
  
  nouvelEleve = { first_name: '', last_name: '', email: '', password: '', role: 'ETUDIANT' };
  enChargement: boolean = false;
  messageSucces: string = '';
  messageErreur: string = '';
  
  elevesInscrits: any[] = []; 

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
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error("Erreur chargement élèves :", err)
    });
  }

  creerEleve() {
    const token = localStorage.getItem('access') || localStorage.getItem('access_token');
    if (!token) return;

    this.enChargement = true;
    this.messageSucces = '';
    this.messageErreur = '';

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.post('http://localhost:8000/api/utilisateurs/', this.nouvelEleve, { headers }).subscribe({
      next: (reponse: any) => {
        this.enChargement = false;
        this.messageSucces = 'Le compte de l\'élève a été créé avec succès !';
        
        this.elevesInscrits = [reponse, ...this.elevesInscrits];
        this.nouvelEleve = { first_name: '', last_name: '', email: '', password: '', role: 'ETUDIANT' };
        
        this.cdr.detectChanges();
      },
      error: (erreur: any) => {
        this.enChargement = false;
        if (erreur.error && typeof erreur.error === 'object') {
           this.messageErreur = 'Erreur : ' + JSON.stringify(erreur.error);
        } else {
           this.messageErreur = 'Erreur serveur.';
        }
        this.cdr.detectChanges();
      }
    });
  }
}