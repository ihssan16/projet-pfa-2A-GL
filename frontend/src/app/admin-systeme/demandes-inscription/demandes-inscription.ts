import { Component, afterNextRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-demandes-inscription',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './demandes-inscription.html',
  styleUrls: ['./demandes-inscription.css']
})
export class DemandesInscriptionComponent {
  
  demandes: any[] = [];
  chargement = true;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {
    afterNextRender(() => {
      this.chargerDemandes();
    });
  }

  chargerDemandes() {
    this.chargement = true;
    this.http.get<any[]>(
      'http://localhost:8000/api/ecoles-inscription/',
      this.authService['getHeaders']()
    ).subscribe({
      next: (data) => {
        this.demandes = data;
        this.chargement = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Erreur chargement demandes', err);
        this.chargement = false;
        this.cdr.detectChanges();
      }
    });
  }

  voirDetails(demande: any) {
    alert(`
📋 Détails de la demande
🏫 École: ${demande.nom}
📍 Ville: ${demande.ville}
📚 Niveaux: ${demande.niveaux}
👨‍👩‍👧‍👦 Capacité: ${demande.capacite_eleves} élèves
📧 Email: ${demande.email_contact || 'Non renseigné'}
📞 Téléphone: ${demande.telephone || 'Non renseigné'}
🌐 Site web: ${demande.site_web || 'Non renseigné'}
📅 Demandé le: ${demande.date_demande}
    `);
  }

  creerEcole(demande: any) {
    const email = prompt('Email de connexion pour l\'école:', demande.email_contact || '');
    if (email === null) return;
    
    const password = prompt('Mot de passe pour l\'école (min 6 caractères):', 'ecole123456');
    if (password === null || password.length < 6) {
      alert('Le mot de passe doit faire au moins 6 caractères');
      return;
    }

    const contactNom = prompt('Nom du responsable:') || '';
    const contactPrenom = prompt('Prénom du responsable:') || '';

    if (confirm(`Créer l'école "${demande.nom}" avec l'email ${email} ?`)) {
      const ecoleId = demande.id;
      console.log('Création école ID (UUID):', ecoleId);
      
      this.http.patch(
        `http://localhost:8000/api/ecoles-inscription/${ecoleId}/`,
        {
          action: 'creer',
          email: email,
          password: password,
          contact_nom: contactNom,
          contact_prenom: contactPrenom
        },
        this.authService['getHeaders']()
      ).subscribe({
        next: (response: any) => {
          alert(`${response.message}`);
          this.chargerDemandes(); 
        },
        error: (err) => {
          console.error('Erreur détaillée création:', err);
          alert(`Erreur: ${err.error?.error || err.message || 'Veuillez réessayer'}`);
        }
      });
    }
  }
}