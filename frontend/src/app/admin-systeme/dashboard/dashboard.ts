import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  utilisateurs: any[] = [];
  chargement = true;

  constructor(
    private router: Router, 
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.chargerPreviewUtilisateurs();
  }

  chargerPreviewUtilisateurs() {
    this.chargement = true;
    this.authService.listerUtilisateurs().subscribe({
      next: (data: any) => {
        const tousLesUsers = data.results ? data.results : (Array.isArray(data) ? data : []);
        
        this.utilisateurs = tousLesUsers.slice(0, 5);
        this.chargement = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur de chargement du preview", err);
        this.chargement = false;
      }
    });
  }

  getRoleLabel(role: string): string {
    const map: any = {
      'ADMIN_SYS':       'Admin Système',
      'ADMIN_METIER':    'Admin Métier',
      'ECOLE':           'École Privée',
      'MINISTERE':       'Ministère',
      'ETUDIANT':        'Parent / Étudiant',
    };
    return map[role] || role;
  }

  // - Le reste de vos données statiques (pour l'instant) -

  stats = [
    { label: 'Utilisateurs actifs', value: '1,247', color: 'primary', icon: 'people', change: '+12.5%', trend: 'up' },
    { label: 'Établissements', value: '156', color: 'success', icon: 'building', change: '+8.3%', trend: 'up' },
    { label: 'Logs aujourd\'hui', value: '8,342', color: 'info', icon: 'file-text', change: '+23.1%', trend: 'up' },
    { label: 'Incidents sécurité', value: '3', color: 'danger', icon: 'exclamation-triangle', change: '+2', trend: 'down' }
  ];

  activites = [
    { action: 'Création compte', detail: 'École Al Madina', heure: '14:32', icon: 'person-plus', color: 'primary' },
    { action: 'Tentative connexion échouée', detail: 'admin@ecole.ma', heure: '14:15', icon: 'shield-exclamation', color: 'warning' },
    { action: 'Mise à jour permissions', detail: 'Admin Métier', heure: '13:58', icon: 'key', color: 'info' },
    { action: 'Export données', detail: 'Ministère', heure: '13:42', icon: 'download', color: 'success' },
    { action: 'Suppression compte', detail: 'École Test', heure: '13:20', icon: 'person-x', color: 'danger' }
  ];

  alertes = [
    { niveau: 'Haute', message: 'Tentative d\'accès non autorisé', source: 'IP 192.168.1.45', date: 'Aujourd\'hui' },
    { niveau: 'Moyenne', message: 'Mot de passe expiré', source: '5 utilisateurs', date: 'Aujourd\'hui' },
    { niveau: 'Basse', message: 'Session anormale', source: 'Compte école', date: 'Hier' }
  ];

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