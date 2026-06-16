import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Demande {
  id: string;
  reference: string;
  etablissement: string;
  ville: string;
  type: string;
  date_depot: string;
  statut: string;
  nb_fichiers?: number;
  commentaire?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  stats = [
    { label: 'Établissements supervisés', value: 173, color: 'primary', icon: 'building', change: '+12%' },
    { label: 'Élèves total', value: '42,847', color: 'success', icon: 'people', change: '+8%' },
    { label: 'Rapports générés', value: 45, color: 'info', icon: 'file-text', change: '+3' },
    { label: 'Taux de conformité', value: '94%', color: 'warning', icon: 'check-circle', change: '+2%' }
  ];

  regions = [
    { nom: 'Casablanca-Settat', etablissements: 42, eleves: 11234, conformite: 96 },
    { nom: 'Rabat-Salé-Kénitra', etablissements: 38, eleves: 9876, conformite: 95 },
    { nom: 'Fès-Meknès', etablissements: 31, eleves: 8432, conformite: 92 },
    { nom: 'Marrakech-Safi', etablissements: 27, eleves: 7123, conformite: 91 },
    { nom: 'Tanger-Tétouan-Al Hoceïma', etablissements: 23, eleves: 5892, conformite: 93 },
    { nom: 'Autres régions', etablissements: 12, eleves: 3290, conformite: 88 }
  ];

  rapports = [
    { nom: 'Rapport annuel 2024-2025', type: 'Annuel', pages: 124, date: '12/05/2025', icon: 'file-text' },
    { nom: 'Analyse régionale Casablanca', type: 'Régional', pages: 45, date: '10/05/2025', icon: 'pie-chart' },
    { nom: 'Conformité établissements', type: 'Conformité', pages: 67, date: '08/05/2025', icon: 'check-circle' },
    { nom: 'Statistiques trimestrielles Q2', type: 'Trimestriel', pages: 38, date: '05/05/2025', icon: 'graph-up' }
  ];

  alertes = [
    { type: 'warning', message: 'Documents expirés', detail: '5 établissements', icon: 'exclamation-triangle' },
    { type: 'info', message: 'Nouveaux dossiers', detail: '12 cette semaine', icon: 'file-plus' }
  ];

  demandesMinistere: Demande[] = [];
  showModal = false;
  demandesEcolesMinistere: any[] = [];

  ngOnInit() {
    this.chargerDemandesMinistere();
    this.chargerDemandesEcolesMinistere();
  }

  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('access') || localStorage.getItem('access_token');
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return { headers: headers };
  }

  chargerDemandesMinistere() {
    this.http.get<any[]>(
      'http://localhost:8000/api/demandes/',
      this.getHeaders()
    ).subscribe({
      next: (data) => {
        this.demandesMinistere = data.filter(d => d.statut === 'Validé par Admin Métier');
        console.log('Demandes pour ministère:', this.demandesMinistere);
      },
      error: (err) => {
        console.error('Erreur chargement demandes', err);
        this.demandesMinistere = [];
      }
    });
  }

    chargerDemandesEcolesMinistere() {
    this.http.get<any[]>(
      'http://localhost:8000/api/ecoles-inscription/',
      this.getHeaders()
    ).subscribe({
      next: (data) => {
        this.demandesEcolesMinistere = data;
      },
      error: (err) => {
        console.error('Erreur chargement écoles', err);
      }
    });
  }

  ouvrirModal() {
    this.showModal = true;
  }

  fermerModal() {
    this.showModal = false;
  }

  validerMinistere(demande: Demande) {
    if (confirm(`Valider définitivement le dossier ${demande.reference} de ${demande.etablissement} ?`)) {
      this.http.patch(
        `http://localhost:8000/api/demandes/${demande.id}/`,
        { action: 'valider' },
        this.getHeaders()
      ).subscribe({
        next: (response: any) => {
          alert(`✅ ${response.message}`);
          this.chargerDemandesMinistere();
          this.fermerModal();
        },
        error: (err) => {
          console.error('Erreur validation', err);
          alert('Erreur lors de la validation: ' + (err.error?.error || err.message));
        }
      });
    }
  }

  refuserMinistere(demande: Demande) {
    const motif = prompt(`Motif du refus pour ${demande.reference} :`);
    if (motif !== null) {
      this.http.patch(
        `http://localhost:8000/api/demandes/${demande.id}/`,
        { action: 'refuser', commentaire: motif },
        this.getHeaders()
      ).subscribe({
        next: (response: any) => {
          alert(`❌ ${response.message}`);
          this.chargerDemandesMinistere();
          this.fermerModal();
        },
        error: (err) => {
          console.error('Erreur refus', err);
          alert('Erreur lors du refus: ' + (err.error?.error || err.message));
        }
      });
    }
  }

    validerEcoleMinistere(demande: any) {
    if (confirm(`Valider définitivement l'école ${demande.nom} ?`)) {
      this.http.patch(
        `http://localhost:8000/api/ecoles-inscription/${demande.id}/`,
        { action: 'valider' },
        this.getHeaders()
      ).subscribe({
        next: (response: any) => {
          alert(`✅ ${response.message}`);
          this.chargerDemandesEcolesMinistere();
        },
        error: (err) => {
          alert(`❌ Erreur: ${err.error?.error || err.message}`);
        }
      });
    }
  }

  refuserEcoleMinistere(demande: any) {
    if (confirm(`Refuser l'école ${demande.nom} ?`)) {
      this.http.patch(
        `http://localhost:8000/api/ecoles-inscription/${demande.id}/`,
        { action: 'refuser' },
        this.getHeaders()
      ).subscribe({
        next: (response: any) => {
          alert(`❌ ${response.message}`);
          this.chargerDemandesEcolesMinistere();
        },
        error: (err) => {
          alert(`❌ Erreur: ${err.error?.error || err.message}`);
        }
      });
    }
  }

  // NOUVELLE MÉTHODE POUR TÉLÉCHARGER LES DOCUMENTS
  telechargerDocument(demande: Demande) {
    if (!demande.nb_fichiers || demande.nb_fichiers === 0) {
      alert('Aucun document disponible pour cette demande');
      return;
    }
    
    this.http.get(
      `http://localhost:8000/api/demandes/${demande.id}/documents/`,
      this.getHeaders()
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

  getConformiteClass(conformite: number): string {
    if (conformite >= 95) return 'bg-success';
    if (conformite >= 90) return 'bg-warning';
    return 'bg-danger';
  }

  voirDetailsRegion(region: string) {
    this.router.navigate(['/ministere/region', region]);
  }

  genererRapport() {
    alert('Fonction de génération de rapport à implémenter');
  }

  voirDossiers() {
    this.router.navigate(['/ministere/validation']);
  }

  logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/login']);
  }
}