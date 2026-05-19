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

  // Statistiques nationales
  stats = [
    { label: 'Établissements supervisés', value: 173, color: 'primary', icon: 'building', change: '+12%' },
    { label: 'Élèves total', value: '42,847', color: 'success', icon: 'people', change: '+8%' },
    { label: 'Rapports générés', value: 45, color: 'info', icon: 'file-text', change: '+3' },
    { label: 'Taux de conformité', value: '94%', color: 'warning', icon: 'check-circle', change: '+2%' }
  ];

  // Données par région
  regions = [
    { nom: 'Casablanca-Settat', etablissements: 42, eleves: 11234, conformite: 96 },
    { nom: 'Rabat-Salé-Kénitra', etablissements: 38, eleves: 9876, conformite: 95 },
    { nom: 'Fès-Meknès', etablissements: 31, eleves: 8432, conformite: 92 },
    { nom: 'Marrakech-Safi', etablissements: 27, eleves: 7123, conformite: 91 },
    { nom: 'Tanger-Tétouan-Al Hoceïma', etablissements: 23, eleves: 5892, conformite: 93 },
    { nom: 'Autres régions', etablissements: 12, eleves: 3290, conformite: 88 }
  ];

  // Rapports récents
  rapports = [
    { nom: 'Rapport annuel 2024-2025', type: 'Annuel', pages: 124, date: '12/05/2025', icon: 'file-text' },
    { nom: 'Analyse régionale Casablanca', type: 'Régional', pages: 45, date: '10/05/2025', icon: 'pie-chart' },
    { nom: 'Conformité établissements', type: 'Conformité', pages: 67, date: '08/05/2025', icon: 'check-circle' },
    { nom: 'Statistiques trimestrielles Q2', type: 'Trimestriel', pages: 38, date: '05/05/2025', icon: 'graph-up' }
  ];

  // Alertes
  alertes = [
    { type: 'warning', message: 'Documents expirés', detail: '5 établissements', icon: 'exclamation-triangle' },
    { type: 'info', message: 'Nouveaux dossiers', detail: '12 cette semaine', icon: 'file-plus' }
  ];

  getConformiteClass(conformite: number): string {
    if (conformite >= 95) return 'bg-success';
    if (conformite >= 90) return 'bg-warning';
    return 'bg-danger';
  }

  voirDetailsRegion(region: string) {
    console.log('Voir détails région:', region);
    this.router.navigate(['/ministere/region', region]);
  }

  genererRapport() {
    alert('Fonction de génération de rapport à implémenter');
  }

  voirDossiers() {
    this.router.navigate(['/ministere/validation']);
  }

  logout() {
    this.router.navigate(['/login']);
  }
}