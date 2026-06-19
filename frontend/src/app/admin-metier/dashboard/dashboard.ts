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
  chargementEcoles = true;

  statsDemandes = {
    en_attente: 0,
    en_cours: 0,
    valides: 0,
    refuses: 0
  };

  demandes: Demande[] = [];
  parVille: any[] = [];
  dernieresEcoles: any[] = [];
  demandesEcoles: any[] = [];

  // --- VARIABLES MODALES ---
  dossierSelectionne: Demande | null = null;
  showDossierModal = false;
  documentsDossier: any[] = [];
  chargementDocuments = false;

  ecoleSelectionnee: any = null;
  showEcoleModal = false;

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
    this.chargerDemandesEcoles();
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

  chargerDemandesEcoles() {
    this.chargementEcoles = true;
    this.http.get<any[]>(
      'http://localhost:8000/api/ecoles-inscription/',
      this.authService['getHeaders']()
    ).subscribe({
      next: (data) => {
        this.demandesEcoles = data;
        this.chargementEcoles = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement demandes écoles', err);
        this.chargementEcoles = false;
      }
    });
  }

  getMaxVille(): number {
    return Math.max(...this.parVille.map((v: any) => v.count), 1);
  }

  // --- ACTIONS VALIDATION / REFUS ---

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
          this.fermerDossierModal();
          this.cdr.detectChanges();
        },
        error: (err) => alert('Erreur lors de la validation du dossier')
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
          this.fermerDossierModal();
          this.cdr.detectChanges();
        },
        error: (err) => alert('Erreur lors du refus du dossier')
      });
    }
  }

  validerEcole(demande: any) {
    if (confirm(`Valider la demande d'inscription de ${demande.nom} ?`)) {
      this.http.patch(
        `http://localhost:8000/api/ecoles-inscription/${demande.id}/`,
        { action: 'valider' },
        this.authService['getHeaders']()
      ).subscribe({
        next: (response: any) => {
          alert(`✅ ${response.message}`);
          this.chargerDemandesEcoles();
          this.chargerStatsEcoles();
          this.fermerEcoleModal();
        },
        error: (err) => alert(`❌ Erreur lors de la validation`)
      });
    }
  }

  refuserEcole(demande: any) {
    if (confirm(`Refuser la demande d'inscription de ${demande.nom} ?`)) {
      this.http.patch(
        `http://localhost:8000/api/ecoles-inscription/${demande.id}/`,
        { action: 'refuser' },
        this.authService['getHeaders']()
      ).subscribe({
        next: (response: any) => {
          alert(`❌ ${response.message}`);
          this.chargerDemandesEcoles();
          this.chargerStatsEcoles();
          this.fermerEcoleModal();
        },
        error: (err) => alert(`❌ Erreur lors du refus`)
      });
    }
  }

  // --- MODALE 1 : DOSSIERS CLASSIQUES ---

  voirDetails(demande: Demande) {
    this.dossierSelectionne = demande;
    this.showDossierModal = true;
    this.chargerDocumentsDossier(demande.id);
  }

  fermerDossierModal() {
    this.showDossierModal = false;
    this.dossierSelectionne = null;
    this.documentsDossier = [];
  }

  chargerDocumentsDossier(id: string) {
    this.chargementDocuments = true;
    this.http.get<any>(
      `http://localhost:8000/api/demandes/${id}/documents/`,
      this.authService['getHeaders']()
    ).subscribe({
      next: (res) => {
        this.documentsDossier = res.documents || [];
        this.chargementDocuments = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.chargementDocuments = false;
        this.cdr.detectChanges();
      }
    });
  }

  // --- MODALE 2 : INSCRIPTION ÉCOLES ---

  voirDetailsEcole(ecole: any) {
    this.ecoleSelectionnee = ecole;
    this.showEcoleModal = true;
  }

  fermerEcoleModal() {
    this.showEcoleModal = false;
    this.ecoleSelectionnee = null;
  }

  // --- GESTION DES DOCUMENTS ---

  getDocumentUrl(chemin: string): string {
    if (!chemin) return '';
    if (chemin.startsWith('http')) return chemin;
    return `http://localhost:8000${chemin}`;
  }

  telechargerFichierSecurise(cheminFichier: string) {
    if (cheminFichier) {
      const urlComplete = this.getDocumentUrl(cheminFichier);
      window.open(urlComplete, '_blank');
    }
  }

  ouvrirDocument(url: string) {
    if (url) {
      const fullUrl = url.startsWith('http') ? url : `http://localhost:8000${url}`;
      window.open(fullUrl, '_blank');
    }
  }

  telechargerDocument(demande: Demande) {
    if (!demande.nb_fichiers || demande.nb_fichiers === 0) {
      alert('Aucun document disponible pour cette demande');
      return;
    }
    this.http.get(`http://localhost:8000/api/demandes/${demande.id}/documents/`, this.authService['getHeaders']()).subscribe({
      next: (response: any) => {
        if (response.documents && response.documents.length > 0) {
          response.documents.forEach((doc: any) => {
            const fileUrl = doc.url ? (doc.url.startsWith('http') ? doc.url : 'http://localhost:8000' + doc.url) : `http://localhost:8000/media/demandes/${encodeURIComponent(doc.name)}`;
            window.open(fileUrl, '_blank');
          });
        } else {
          alert('Aucun document disponible');
        }
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}