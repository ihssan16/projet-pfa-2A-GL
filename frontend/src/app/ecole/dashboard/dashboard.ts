import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; 
import { HttpClient, HttpClientModule } from '@angular/common/http'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, HttpClientModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  
  constructor(
    private router: Router, 
    private http: HttpClient,
    private cdr: ChangeDetectorRef // Pour forcer la mise à jour de l'écran
  ) {}

  // 1. On initialise avec un état de chargement
  ecole: any = {
    nom: 'Chargement des données...',
    ville: '...',
    niveaux: '...'
  };

  // 2. Vos statistiques (on va mettre à jour la première dynamiquement)
  stats = [
    { label: 'Capacité (Élèves)', value: 0, icon: 'people', color: 'primary', change: 'Live' },
    { label: 'Enseignants', value: 42, icon: 'person-badge', color: 'success', change: '+3' },
    { label: 'Documents uploadés', value: 156, icon: 'file-earmark-text', color: 'info', change: '+23' },
    { label: 'Notifications', value: 8, icon: 'bell', color: 'warning', change: '+2' }
  ];

  // (Gardez vos tableaux documents, notifications et actionsRapides intacts ici)
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

  // 3. Appel de l'API au démarrage
  ngOnInit() {
    this.chargerDonneesCloud();
  }

  chargerDonneesCloud() {
    // Appel direct vers votre base de données Neon.tech via Django
    this.http.get('http://localhost:8000/api/ecoles/').subscribe({
      next: (data: any) => {
        // Si Django nous renvoie bien des écoles
        if (data && data.length > 0) {
          const ecoleKaggle = data[0]; // On sélectionne la toute première école du dataset
          
          // Mise à jour de l'en-tête HTML
          this.ecole = {
            nom: ecoleKaggle.nom,
            ville: ecoleKaggle.ville,
            niveaux: ecoleKaggle.niveaux || 'Non spécifié'
          };

          // Mise à jour de la carte KPI (Élèves)
          this.stats[0].value = ecoleKaggle.capacite_eleves;

          // Forcer Angular à rafraîchir le HTML
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error("Erreur de connexion à l'API Django", err);
        this.ecole.nom = "Erreur de connexion serveur";
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
    this.router.navigate(['/login']);
  }
}