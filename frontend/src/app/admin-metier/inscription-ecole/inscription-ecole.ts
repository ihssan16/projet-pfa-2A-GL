import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-inscription-ecole',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './inscription-ecole.html',
  styleUrls: ['./inscription-ecole.css']
})
export class InscriptionEcoleComponent {
  
  nouvelleEcole = {
    nom: '',
    ville: '',
    niveaux: '',
    capacite_eleves: 0,
    email_contact: '',
    telephone: '',
    site_web: ''
  };

  fichiers: any = {
    autorisation: null,
    identite: null,
    justificatif: null
  };

  chargement = false;
  message = '';
  messageType = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  onFileSelected(event: any, type: string) {
    if (event.target.files.length > 0) {
      this.fichiers[type] = event.target.files[0];
    }
  }

  resetFormulaire() {
    this.nouvelleEcole = {
      nom: '',
      ville: '',
      niveaux: '',
      capacite_eleves: 0,
      email_contact: '',
      telephone: '',
      site_web: ''
    };
    this.fichiers = {
      autorisation: null,
      identite: null,
      justificatif: null
    };
    this.message = '';
  }

  soumettreInscription() {
    if (!this.nouvelleEcole.nom || !this.nouvelleEcole.ville || !this.nouvelleEcole.niveaux || !this.nouvelleEcole.email_contact) {
      this.message = 'Veuillez remplir tous les champs obligatoires (*)';
      this.messageType = 'danger';
      return;
    }

    this.chargement = true;
    this.message = '';

    const formData = new FormData();
    formData.append('nom', this.nouvelleEcole.nom);
    formData.append('ville', this.nouvelleEcole.ville);
    formData.append('niveaux', this.nouvelleEcole.niveaux);
    formData.append('capacite_eleves', String(this.nouvelleEcole.capacite_eleves));
    formData.append('email_contact', this.nouvelleEcole.email_contact);
    formData.append('telephone', this.nouvelleEcole.telephone || '');
    formData.append('site_web', this.nouvelleEcole.site_web || '');

    if (this.fichiers.autorisation) {
      formData.append('document_autorisation', this.fichiers.autorisation);
    }
    if (this.fichiers.identite) {
      formData.append('document_identite', this.fichiers.identite);
    }
    if (this.fichiers.justificatif) {
      formData.append('document_justificatif', this.fichiers.justificatif);
    }

    this.http.post(
      'http://localhost:8000/api/ecoles-inscription/',
      formData,
      this.authService['getHeaders']()
    ).subscribe({
      next: (response: any) => {
        this.chargement = false;
        this.messageType = 'success';
        this.message = `✅ ${response.message} - Réf: ${response.id}`;
        this.resetFormulaire();
        setTimeout(() => {
          this.router.navigate(['/admin-metier']);
        }, 3000);
      },
      error: (err) => {
        this.chargement = false;
        this.messageType = 'danger';
        this.message = `❌ Erreur: ${err.error?.error || err.message}`;
      }
    });
  }
}