import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent {
  constructor(private router: Router) {}

  // Données des cartes KPI
  stats = [
    { label: 'Dossiers en attente', value: 23, color: 'warning', icon: 'hourglass-split', change: '+5' },
    { label: 'Dossiers validés', value: 142, color: 'success', icon: 'check-circle', change: '+12' },
    { label: 'Dossiers refusés', value: 8, color: 'danger', icon: 'x-circle', change: '-2' },
    { label: 'Total établissements', value: 173, color: 'info', icon: 'building', change: '+8' }
  ];

  // Données du tableau
  dossiers = [
    { ref: 'DOS-2025-001', etablissement: 'Groupe Scolaire Al Wifaq', ville: 'Casablanca', type: 'Inscription', date: '12/05/2025', documents: 12, statut: 'En attente' },
    { ref: 'DOS-2025-002', etablissement: 'École Privée Les Étoiles', ville: 'Rabat', type: 'Renouvellement', date: '11/05/2025', documents: 8, statut: 'En attente' },
    { ref: 'DOS-2025-003', etablissement: 'Lycée Excellence', ville: 'Marrakech', type: 'Modification', date: '10/05/2025', documents: 15, statut: 'Validé' },
    { ref: 'DOS-2025-004', etablissement: 'Collège Modern School', ville: 'Fès', type: 'Inscription', date: '09/05/2025', documents: 6, statut: 'Refusé' },
    { ref: 'DOS-2025-005', etablissement: 'École Al Andalous', ville: 'Casablanca', type: 'Renouvellement', date: '08/05/2025', documents: 9, statut: 'En attente' }
  ];

  // Données des régions
  regions = [
    { name: 'Casablanca-Settat', value: 42 },
    { name: 'Rabat-Salé-Kénitra', value: 38 },
    { name: 'Fès-Meknès', value: 31 },
    { name: 'Marrakech-Safi', value: 27 }
  ];

  // Données des types d'enseignement
  enseignements = [
    { type: 'Primaire', count: 65, percentage: 38 },
    { type: 'Collège', count: 48, percentage: 28 },
    { type: 'Lycée', count: 42, percentage: 24 },
    { type: 'Technique', count: 18, percentage: 10 }
  ];

  // Activité récente
  activites = [
    { action: 'Dossier validé', etablissement: 'École Al Wifaq', heure: '14:25', icon: 'check-circle', color: 'success' },
    { action: 'Nouveau dossier', etablissement: 'École Les Étoiles', heure: '13:45', icon: 'file-plus', color: 'info' },
    { action: 'Dossier refusé', etablissement: 'Collège Modern', heure: '12:30', icon: 'x-circle', color: 'danger' }
  ];

  getStatusBadgeClass(statut: string): string {
    switch(statut) {
      case 'Validé': return 'bg-success';
      case 'Refusé': return 'bg-danger';
      default: return 'bg-warning';
    }
  }

  voirDetails(ref: string) {
    console.log('Voir détails du dossier:', ref);
    // Rediriger vers la page de détails
    this.router.navigate(['/admin-metier/dossiers', ref]);
  }

  logout() {
    this.router.navigate(['/login']);
  }
}