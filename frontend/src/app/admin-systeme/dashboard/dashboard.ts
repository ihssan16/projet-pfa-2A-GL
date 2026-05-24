import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent {
  constructor(private router: Router) {}

  // Statistiques globales
  stats = [
    { label: 'Utilisateurs actifs', value: '1,247', color: 'primary', icon: 'people', change: '+12.5%', trend: 'up' },
    { label: 'Établissements', value: '156', color: 'success', icon: 'building', change: '+8.3%', trend: 'up' },
    { label: 'Logs aujourd\'hui', value: '8,342', color: 'info', icon: 'file-text', change: '+23.1%', trend: 'up' },
    { label: 'Incidents sécurité', value: '3', color: 'danger', icon: 'exclamation-triangle', change: '+2', trend: 'down' }
  ];

  // Liste des utilisateurs
  utilisateurs = [
    { nom: 'École Al Andalous', statut: 'Actif', email: 'contact@alandalous.ma', role: 'École', activite: 'Il y a 5 min' },
    { nom: 'Mohammed Alami', statut: 'Actif', email: 'm.alami@ministere.gov', role: 'Ministère', activite: 'Il y a 12 min' },
    { nom: 'Fatima Zahra', statut: 'Actif', email: 'f.zahra@admin.ma', role: 'Admin Métier', activite: 'Il y a 1h' },
    { nom: 'École La Renaissance', statut: 'Inactif', email: 'info@renaissance.ma', role: 'École', activite: 'Il y a 3 jours' },
    { nom: 'Lycée Excellence', statut: 'Actif', email: 'contact@excellence.ma', role: 'École', activite: 'Il y a 2h' }
  ];

  // Activités en temps réel
  activites = [
    { action: 'Création compte', detail: 'École Al Madina', heure: '14:32', icon: 'person-plus', color: 'primary' },
    { action: 'Tentative connexion échouée', detail: 'admin@ecole.ma', heure: '14:15', icon: 'shield-exclamation', color: 'warning' },
    { action: 'Mise à jour permissions', detail: 'Admin Métier', heure: '13:58', icon: 'key', color: 'info' },
    { action: 'Export données', detail: 'Ministère', heure: '13:42', icon: 'download', color: 'success' },
    { action: 'Suppression compte', detail: 'École Test', heure: '13:20', icon: 'person-x', color: 'danger' }
  ];

  // Alertes sécurité
  alertes = [
    { niveau: 'Haute', message: 'Tentative d\'accès non autorisé', source: 'IP 192.168.1.45', date: 'Aujourd\'hui' },
    { niveau: 'Moyenne', message: 'Mot de passe expiré', source: '5 utilisateurs', date: 'Aujourd\'hui' },
    { niveau: 'Basse', message: 'Session anormale', source: 'Compte école', date: 'Hier' }
  ];

  getStatutBadgeClass(statut: string): string {
    return statut === 'Actif' ? 'bg-success' : 'bg-secondary';
  }

  getNiveauBadgeClass(niveau: string): string {
    switch(niveau) {
      case 'Haute': return 'bg-danger';
      case 'Moyenne': return 'bg-warning';
      default: return 'bg-info';
    }
  }

  logout() {
    this.router.navigate(['/login']);
  }
}