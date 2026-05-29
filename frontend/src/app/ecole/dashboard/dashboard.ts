import { HttpClient, HttpHeaders } from '@angular/common/http'; 
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})

export class DashboardComponentEcole implements OnInit {
  
  constructor(
    private router: Router, 
    private http: HttpClient,
    private cdr: ChangeDetectorRef 
  ) {}

  ecole: any = {
    nom: 'Chargement des données...',
    ville: '...',
    niveaux: '...'
  };

  stats = [
    { label: 'Capacité (Élèves)', value: 0, icon: 'people', color: 'primary', change: 'Live' },
    { label: 'Enseignants', value: 42, icon: 'person-badge', color: 'success', change: '+3' },
    { label: 'Documents uploadés', value: 156, icon: 'file-earmark-text', color: 'info', change: '+23' },
    { label: 'Notifications', value: 8, icon: 'bell', color: 'warning', change: '+2' }
  ];

  documents = [
    { nom: 'Autorisation d\'ouverture', type: 'PDF', taille: '2.4 MB', date: '10/05/2025', statut: 'Validé' },
    { nom: 'Liste des enseignants', type: 'Excel', taille: '1.2 MB', date: '08/05/2025', statut: 'Validé' }
  ];
  
  notifications = [
    { message: 'Votre dossier d\'inscription a été validé', temps: 'il y a 2h', type: 'success', icon: 'check-circle' }
  ];
  
  actionsRapides = [
    { label: 'Mettre à jour les informations', icon: 'pencil-square', route: '/ecole/informations' },
    { label: 'Gérer les élèves', icon: 'people', route: '/ecole/eleves' }
  ];

  ngOnInit() {
    this.chargerDonneesCloud();
  }

  chargerDonneesCloud() {

    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    this.http.get('http://localhost:8000/api/profil/', { headers: headers }).subscribe({
      next: (profil: any) => {
        this.ecole = {
          nom: profil.ecole_nom || profil.last_name || 'École sans nom',
          ville: profil.ecole_ville || 'Ville non renseignée',
          niveaux: profil.ecole_niveaux || 'Niveaux non spécifiés'
        };

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur de connexion au profil Django", err);
        this.ecole.nom = "Erreur de chargement";
        if (err.status === 401) {
          this.logout(); 
        }
        this.cdr.detectChanges();
      }
    });
  }

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

  uploadDocument() { alert('Fonction d\'upload à implémenter'); }
  voirTousDocuments() { this.router.navigate(['/ecole/documents']); }
  voirToutesNotifications() { console.log('Voir toutes les notifications'); }
  
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/login']);
  }
}