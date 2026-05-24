import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-gestion-eleves',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  messageSucces: string = '';
  messageErreur: string = '';
  enChargement: boolean = false;

  constructor(private http: HttpClient) {}

  creerEleve() {
    this.enChargement = true;
    this.messageSucces = '';
    this.messageErreur = '';

    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post('http://localhost:8000/api/utilisateurs/', this.nouvelEleve, { headers }).subscribe({
      next: (reponse) => {
        this.enChargement = false;
        this.messageSucces = 'Le compte de l\'élève a été créé avec succès !';
        this.nouvelEleve = { first_name: '', last_name: '', email: '', password: '', role: 'ETUDIANT' };
      },
      error: (erreur) => {
        this.enChargement = false;
        this.messageErreur = 'Erreur lors de la création du compte.';
        console.error(erreur);
      }
    });
  }
}