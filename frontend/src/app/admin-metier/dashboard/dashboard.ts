import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { HttpClient } from '@angular/common/http';

interface Demande {
  id: string;
  reference: string;
  etablissement: string;
  ville: string;
  type: string;
  date_depot: string;
  nb_fichiers: number;
  statut: string;
  commentaire?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
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
  chargementDemandes = true;

  statsDemandes = {
    en_attente: 0,
    en_cours: 0,
    valides: 0,
    refuses: 0
  };

  demandes: Demande[] = [];
  parVille: any[] = [];
  dernieresEcoles: any[] = [];

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.chargerToutesLesDonnees();
    } else {
      this.chargement = false;
      this.chargementDemandes = false;
    }
  }

  chargerToutesLesDonnees() {
    this.chargerStatistiques();
    this.chargerStatsEcoles();
    this.chargerDemandes();
  }

  chargerStatistiques() {
    this.http.get<any>(
      'http://localhost:8000/api/stats-demandes/',
      this.authService['getHeaders']()
    ).subscribe({
      next: (data) => {
        this.statsDemandes = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement statistiques', err);
        if (err.status === 401) this.logout();
      }
    });
  }

  chargerStatsEcoles() {
    this.http.get<any>(
      'http://localhost:8000/api/stats-admin-metier/',
      this.authService['getHeaders']()
    ).subscribe({
      next: (data) => {
        this.parVille = data.par_ville || [];
        this.dernieresEcoles = data.dernieres_ecoles || [];
        this.chargement = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement stats écoles', err);
        this.chargement = false;
      }
    });
  }

  chargerDemandes() {
    this.chargementDemandes = true;
    
    this.http.get<any[]>(
      'http://localhost:8000/api/demandes/',
      this.authService['getHeaders']()
    ).subscribe({
      next: (data) => {
        this.demandes = data;
        this.chargementDemandes = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement demandes', err);
        this.demandes = [];
        this.chargementDemandes = false;
        this.cdr.detectChanges();
      }
    });
  }

  getMaxVille(): number {
    return Math.max(...this.parVille.map((v: any) => v.count), 1);
  }

  validerDemande(demande: Demande) {
    if (confirm(`Valider le dossier ${demande.reference} de ${demande.etablissement} ?\nIl sera transmis au Ministère pour validation finale.`)) {
      this.http.patch(
        `http://localhost:8000/api/demandes/${demande.id}/`,
        { action: 'valider' },
        this.authService['getHeaders']()
      ).subscribe({
        next: (response: any) => {
          demande.statut = 'Validé par Admin Métier';
          this.chargerStatistiques();
          alert(`✅ ${response.message}`);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erreur validation', err);
          alert('Erreur lors de la validation du dossier');
        }
      });
    }
  }

  refuserDemande(demande: Demande) {
    const motif = prompt(`Motif du refus pour ${demande.reference} :`);
    if (motif !== null) {
      this.http.patch(
        `http://localhost:8000/api/demandes/${demande.id}/`,
        { action: 'refuser', commentaire: motif },
        this.authService['getHeaders']()
      ).subscribe({
        next: (response: any) => {
          demande.statut = 'Refusé';
          this.chargerStatistiques();
          alert(`❌ ${response.message}`);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erreur refus', err);
          alert('Erreur lors du refus du dossier');
        }
      });
    }
  }

  voirDetails(demande: Demande) {
    alert(`📋 Dossier: ${demande.reference}\n🏫 Établissement: ${demande.etablissement}\n📍 Ville: ${demande.ville}\n📝 Type: ${demande.type}\n📅 Date: ${demande.date_depot}\n✅ Statut: ${demande.statut}`);
  }

  voirDocuments(demande: Demande) {
    alert(`📎 Documents du dossier ${demande.reference}: ${demande.nb_fichiers} fichier(s) attaché(s)`);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  telechargerDocument(demande: Demande) {
  if (!demande.nb_fichiers || demande.nb_fichiers === 0) {
    alert('Aucun document disponible pour cette demande');
    return;
  }
  
  this.http.get(
    `http://localhost:8000/api/demandes/${demande.id}/documents/`,
    this.authService['getHeaders']()
  ).subscribe({
    next: (response: any) => {
      if (response.documents && response.documents.length > 0) {
        response.documents.forEach((doc: any) => {
          const link = document.createElement('a');
          link.href = `http://localhost:8000/api/demandes/${demande.id}/download/${encodeURIComponent(doc.name)}`;
          link.download = doc.name;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      } else {
        alert('Aucun document disponible');
      }
    },
    error: (err) => {
      console.error('Erreur téléchargement', err);
      alert('Erreur lors du téléchargement');
    }
  });
}
}