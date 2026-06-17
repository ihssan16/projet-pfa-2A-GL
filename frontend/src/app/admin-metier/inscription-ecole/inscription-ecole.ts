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
    // ⚡ NOUVEAU : 1. Vérification des champs textes
    if (!this.nouvelleEcole.nom || !this.nouvelleEcole.ville || !this.nouvelleEcole.niveaux || !this.nouvelleEcole.email_contact) {
      this.message = 'Veuillez remplir tous les champs obligatoires (*)';
      this.messageType = 'danger';
      return;
    }

    // ⚡ NOUVEAU : 2. Vérification stricte de la présence des 3 fichiers
    if (!this.fichiers.autorisation || !this.fichiers.identite || !this.fichiers.justificatif) {
      this.message = 'Veuillez importer tous les documents requis (Autorisation, Identité et Justificatif de domicile).';
      this.messageType = 'danger';
      return;
    }

    this.chargement = true;
    this.message = '';

    const formData = new FormData();
    formData.append('nom', this.nouvelleEcole.nom);
    formData.append('ville', this.nouvelleEcole.ville);
    formData.append('niveaux', this.nouvelleEcole.niveaux);
    formData.append('capacite_eleves', String(this.nouvelleEcole.capacite_eleves || 0));
    formData.append('email_contact', this.nouvelleEcole.email_contact);
    formData.append('telephone', this.nouvelleEcole.telephone || '');
    formData.append('site_web', this.nouvelleEcole.site_web || '');

    // Puisque les fichiers sont obligatoires, plus besoin des "if", on les ajoute directement
    formData.append('document_autorisation', this.fichiers.autorisation);
    formData.append('document_identite', this.fichiers.identite);
    formData.append('document_justificatif', this.fichiers.justificatif);

    const headers = this.authService['getHeaders']();
    
    this.http.post(
      'http://localhost:8000/api/ecoles-inscription/',
      formData,
      headers
    ).subscribe({
      next: (response: any) => {
        this.chargement = false;
        this.messageType = 'success';
        this.message = `✅ ${response.message}`;
        this.resetFormulaire();
        setTimeout(() => {
          this.router.navigate(['/admin-metier']);
        }, 3000);
      },
      error: (err) => {
        this.chargement = false;
        this.messageType = 'danger';
        console.error('Erreur détaillée:', err);
        if (err.status === 0) {
          this.message = '❌ Erreur de connexion au serveur. Vérifiez que Django est lancé.';
        } else if (err.error?.error) {
          this.message = `❌ ${err.error.error}`;
        } else {
          this.message = `❌ Erreur: ${err.message || 'Veuillez réessayer'}`;
        }
      }
    });
  }
}