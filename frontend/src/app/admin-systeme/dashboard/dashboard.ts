import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';
import { HttpClient, HttpClientModule } from '@angular/common/http'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, HttpClientModule], 
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  
  utilisateurs: any[] = [];
  chargement = true;

  stats = [
    { id: 'users', label: 'Utilisateurs actifs', value: '...', color: 'primary', icon: 'people', change: 'Mise à jour...', trend: 'up' },
    { id: 'ecoles', label: 'Établissements', value: '...', color: 'success', icon: 'building', change: 'Mise à jour...', trend: 'up' },
    { id: 'logs', label: 'Logs aujourd\'hui', value: '8,342', color: 'info', icon: 'file-text', change: 'Enregistrement actif', trend: 'up' },
    { id: 'incidents', label: 'Incidents sécurité', value: '0', color: 'danger', icon: 'shield-check', change: 'Aucun incident', trend: 'down' }
  ];

  constructor(
    private router: Router, 
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.chargerPreviewUtilisateurs();
    this.chargerStatistiques(); 
  }

  // --- Calcul des statistiques ---
  chargerStatistiques() {
    this.authService.listerUtilisateurs().subscribe({
      next: (data: any) => {
        const totalUsers = data.count !== undefined ? data.count : (data.results ? data.results.length : data.length);
        this.mettreAJourStat('users', totalUsers.toString(), '+ Récent');
      },
      error: (err) => console.error("Erreur de comptage des utilisateurs", err)
    });

    this.http.get('http://localhost:8000/api/ecoles/').subscribe({
      next: (data: any) => {
        const totalEcoles = data.count !== undefined ? data.count : (data.results ? data.results.length : data.length);
        this.mettreAJourStat('ecoles', totalEcoles.toString(), '+ Récent');
      },
      error: (err) => console.error("Erreur de comptage des écoles", err)
    });
  }

  mettreAJourStat(id: string, nouvelleValeur: string, nouveauChange: string) {
    const statIndex = this.stats.findIndex(s => s.id === id);
    if (statIndex !== -1) {
      this.stats[statIndex].value = nouvelleValeur;
      this.stats[statIndex].change = nouveauChange;
      this.cdr.detectChanges(); 
    }
  }

  // --- ANCIENNES FONCTIONS (Aperçu tableau et utilitaires) ---
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

  // Données statiques restantes
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
}