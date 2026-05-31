import { Component, ChangeDetectorRef, OnInit } from '@angular/core'; 
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
export class GestionElevesComponent implements OnInit {
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

  elevesInscrits: any[] = [];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}


  ngOnInit() {
    this.chargerEleves();
  }

  chargerEleves() {
    const token = localStorage.getItem('access') || localStorage.getItem('access_token');
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
    console.log('--- DÉBUT DE LA CRÉATION ---');
    console.log('1. Données du formulaire :', this.nouvelEleve);
    
    this.enChargement = true;
    this.messageSucces = '';
    this.messageErreur = '';

    const token = localStorage.getItem('access') || localStorage.getItem('access_token');
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
        
        this.chargerEleves();
        
        this.cdr.detectChanges(); 
      },
      error: (erreur: any) => {
        console.error('4. ERREUR reçue :', erreur);
        this.enChargement = false;
        
        if (erreur.error && typeof erreur.error === 'object') {
           this.messageErreur = 'Erreur Django : ' + JSON.stringify(erreur.error);
        } else if (erreur.status === 403) {
           this.messageErreur = "Erreur 403 : L'école n'a pas la permission de créer un élève (à vérifier dans Django).";
        } else {
           this.messageErreur = 'Erreur serveur. Regardez la console F12.';
        }
        
        this.cdr.detectChanges(); 
      }
    });
  }
}