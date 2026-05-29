import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
  activites: any[] = []; 
  chargement = true;

  stats = [
    { id: 'users', label: 'Utilisateurs actifs', value: '...', color: 'primary', icon: 'people', change: 'Mise à jour...', trend: 'up' },
    { id: 'ecoles', label: 'Établissements', value: '...', color: 'success', icon: 'building', change: 'Mise à jour...', trend: 'up' },
    { id: 'logs', label: 'Logs aujourd\'hui', value: '8,342', color: 'info', icon: 'file-text', change: 'Enregistrement actif', trend: 'up' },
    { id: 'incidents', label: 'Incidents sécurité', value: '0', color: 'danger', icon: 'shield-check', change: 'Aucun incident', trend: 'down' }
  ];

  alertes = [
    { niveau: 'Haute', message: 'Tentative d\'accès non autorisé', source: 'IP 192.168.1.45', date: 'Aujourd\'hui' },
    { niveau: 'Moyenne', message: 'Mot de passe expiré', source: '5 utilisateurs', date: 'Aujourd\'hui' },
    { niveau: 'Basse', message: 'Session anormale', source: 'Compte école', date: 'Hier' }
  ];

  constructor(
    private router: Router, 
    private authService: AuthService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.chargerPreviewUtilisateurs();
      this.chargerStatistiques(); 
    } else {
      this.chargement = false;
    }
  }

  chargerStatistiques() {
    this.authService.listerUtilisateurs().subscribe({
      next: (data: any) => {
        const totalUsers = data.count !== undefined ? data.count : (data.results ? data.results.length : data.length);
        this.mettreAJourStat('users', totalUsers.toString(), '');
      },
      error: (err) => {
        console.error("Erreur de comptage des utilisateurs", err);
        if (err.status === 401) this.logout(); 
      }
    });

    this.http.get('http://localhost:8000/api/ecoles/').subscribe({
      next: (data: any) => {
        const totalEcoles = data.count !== undefined ? data.count : (data.results ? data.results.length : data.length);
        this.mettreAJourStat('ecoles', totalEcoles.toString(), '');
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

  chargerPreviewUtilisateurs() {
    this.chargement = true;
    this.authService.listerUtilisateurs().subscribe({
      next: (data: any) => {
        const tousLesUsers = data.results ? data.results : (Array.isArray(data) ? data : []);
        
        this.utilisateurs = tousLesUsers.slice(0, 5);

        this.activites = this.utilisateurs.slice(0, 4).map(user => {
          return {
            action: 'Création compte ' + this.getRoleLabel(user.role),
            detail: user.ecole_nom ? user.ecole_nom : user.email,
            heure: 'Nouveau',
            icon: 'person-plus',
            color: 'primary'
          };
        });

        this.activites.push({
            action: 'Sauvegarde système',
            detail: 'Base de données Neon.tech',
            heure: 'Aujourd\'hui',
            icon: 'cloud-check',
            color: 'success'
        });

        this.chargement = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur de chargement du preview", err);
        if (err.status === 401) this.logout(); 
        this.chargement = false;
        this.cdr.detectChanges();
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
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}