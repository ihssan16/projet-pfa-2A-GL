import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; 
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ [CommonModule, RouterLink]],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent {
  constructor(private router: Router) {}

  // Informations de l'école
  ecole = {
    nom: 'École Privée Al Andalous',
    ville: 'Casablanca',
    niveaux: 'Enseignement Primaire et Collège'
  };

  // Cartes statistiques
  stats = [
    { label: 'Élèves inscrits', value: 487, icon: 'people', color: 'primary', change: '+12' },
    { label: 'Enseignants', value: 42, icon: 'person-badge', color: 'success', change: '+3' },
    { label: 'Documents uploadés', value: 156, icon: 'file-earmark-text', color: 'info', change: '+23' },
    { label: 'Notifications', value: 8, icon: 'bell', color: 'warning', change: '+2' }
  ];

  // Documents
  documents = [
    { nom: 'Autorisation d\'ouverture', type: 'PDF', taille: '2.4 MB', date: '10/05/2025', statut: 'Validé' },
    { nom: 'Liste des enseignants', type: 'Excel', taille: '1.2 MB', date: '08/05/2025', statut: 'Validé' },
    { nom: 'Plan d\'évacuation', type: 'PDF', taille: '3.8 MB', date: '05/05/2025', statut: 'Validé' },
    { nom: 'Assurance scolaire', type: 'PDF', taille: '1.8 MB', date: '03/05/2025', statut: 'Refusé' }
  ];

  // Notifications
  notifications = [
    { message: 'Votre dossier d\'inscription a été validé', temps: 'il y a 2h', type: 'success', icon: 'check-circle' },
    { message: 'Document "Assurance" à renouveler', temps: 'il y a 1 jour', type: 'warning', icon: 'exclamation-triangle' },
    { message: 'Nouveau message du ministère', temps: 'il y a 2 jours', type: 'info', icon: 'envelope' }
  ];

  // Actions rapides
  actionsRapides = [
    { label: 'Mettre à jour les informations', icon: 'pencil-square', route: '/ecole/informations' },
    { label: 'Gérer les élèves', icon: 'people', route: '/ecole/eleves' },
    { label: 'Voir les statistiques', icon: 'graph-up', route: '/ecole/statistiques' },
    { label: 'Contacter le ministère', icon: 'chat', route: '/ecole/contact' }
  ];

  getStatutBadgeClass(statut: string): string {
    return statut === 'Validé' ? 'bg-success' : 'bg-danger';
  }

  getNotificationClass(type: string): string {
    switch(type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      default: return 'info';
    }
  }

  uploadDocument() {
    alert('Fonction d\'upload de document à implémenter');
  }

  voirTousDocuments() {
    this.router.navigate(['/ecole/documents']);
  }

  voirToutesNotifications() {
    console.log('Voir toutes les notifications');
  }

  logout() {
    this.router.navigate(['/login']);
  }
}