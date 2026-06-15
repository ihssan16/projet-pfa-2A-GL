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
  
  nouvelEleve = { first_name: '', last_name: '', email: '', password: '', role: 'ETUDIANT', etudiant_niveau: '' };
  enChargement: boolean = false;
  messageSucces: string = '';
  messageErreur: string = '';
  
  elevesInscrits: any[] = []; 

  modeEdition: boolean = false;
  idEleveEnEdition: string | null = null;

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

    if (this.modeEdition && this.idEleveEnEdition) {
      
      let dataAEnvoyer: any = { ...this.nouvelEleve };
      if (!dataAEnvoyer.password) {
        delete dataAEnvoyer.password;
      }

      this.http.patch(`http://localhost:8000/api/utilisateurs/${this.idEleveEnEdition}/`, dataAEnvoyer, { headers }).subscribe({
        next: (reponse: any) => {
          this.enChargement = false;
          this.messageSucces = 'Les informations de l\'élève ont été mises à jour !';
          
          const index = this.elevesInscrits.findIndex(e => e.id === this.idEleveEnEdition);
          if (index !== -1) {
            this.elevesInscrits[index] = reponse;
          }
          
          this.annulerEdition(); 
          this.cdr.detectChanges();
        },
        error: (erreur: any) => this.gererErreur(erreur)
      });

    } 
    else {
      this.http.post('http://localhost:8000/api/utilisateurs/', this.nouvelEleve, { headers }).subscribe({
        next: (reponse: any) => {
          this.enChargement = false;
          this.messageSucces = 'Le compte de l\'élève a été créé avec succès !';
          
          this.elevesInscrits = [reponse, ...this.elevesInscrits];
          this.annulerEdition(); 
          this.cdr.detectChanges();
        },
        error: (erreur: any) => this.gererErreur(erreur)
      });
    }
  }

  gererErreur(erreur: any) {
    this.enChargement = false;
    if (erreur.error && typeof erreur.error === 'object') {
       this.messageErreur = 'Erreur : ' + JSON.stringify(erreur.error);
    } else {
       this.messageErreur = 'Erreur serveur.';
    }
    this.cdr.detectChanges();
  }

  supprimerEleve(id: string, nom: string, prenom: string) {
    const confirmation = confirm(`Êtes-vous sûr de vouloir supprimer le compte de ${prenom} ${nom} ? Cette action est irréversible.`);
    
    if (confirmation) {
      const token = localStorage.getItem('access') || localStorage.getItem('access_token');
      if (!token) return;
      const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

      this.http.delete(`http://localhost:8000/api/utilisateurs/${id}/`, { headers }).subscribe({
        next: () => {
          this.elevesInscrits = this.elevesInscrits.filter(eleve => eleve.id !== id);
          this.cdr.detectChanges(); 
        },
        error: (err) => {
          console.error("Erreur lors de la suppression :", err);
          alert("Une erreur est survenue lors de la suppression.");
        }
      });
    }
  }

  editerEleve(eleve: any) {
    this.modeEdition = true;
    this.idEleveEnEdition = eleve.id;

    this.nouvelEleve = {
      first_name: eleve.first_name,
      last_name: eleve.last_name,
      email: eleve.email,
      password: '', 
      role: 'ETUDIANT',
      etudiant_niveau: eleve.profil_etudiant?.niveau || '' 
    };
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  annulerEdition() {
    this.modeEdition = false;
    this.idEleveEnEdition = null;
    this.nouvelEleve = { first_name: '', last_name: '', email: '', password: '', role: 'ETUDIANT', etudiant_niveau: '' };
  }
  
}