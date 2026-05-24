import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-gestion-eleves',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './gestion-eleves.html',
  styleUrls: ['./gestion-eleves.css']
})
export class GestionElevesComponent {
  nouvelEleve = {
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'ETUDIANT'
  };

  enChargement: boolean = false;
  messageSucces: string = '';
  messageErreur: string = '';

  constructor(private http: HttpClient) {}

  creerEleve() {
    console.log('--- DÉBUT DE LA CRÉATION ---');
    console.log('1. Données du formulaire :', this.nouvelEleve);
    
    this.enChargement = true;
    this.messageSucces = '';
    this.messageErreur = '';

    const token = localStorage.getItem('access_token');
    console.log('2. Token récupéré :', token ? 'Oui, le token est là' : 'NON ! LE TOKEN EST VIDE');

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    console.log('3. Envoi de la requête au backend...');
    
    this.http.post('http://localhost:8000/api/utilisateurs/', this.nouvelEleve, { headers }).subscribe({
      next: (reponse: any) => {
        console.log('4. SUCCÈS ! Réponse du backend :', reponse);
        this.enChargement = false;
        this.messageSucces = 'Le compte de l\'élève a été créé avec succès !';
        this.nouvelEleve = { first_name: '', last_name: '', email: '', password: '', role: 'ETUDIANT' };
      },
      error: (erreur: any) => {
        console.error('4. ERREUR CRITIQUE reçue :', erreur);
        this.enChargement = false;
        if (erreur.status === 400) {
          this.messageErreur = 'Erreur : Vérifiez les champs (l\'email existe peut-être déjà).';
        } else {
          this.messageErreur = 'Erreur serveur. Regardez la console.';
        }
      }
    });
  }
}