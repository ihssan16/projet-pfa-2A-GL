import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';
import { HttpClient, HttpClientModule } from '@angular/common/http'; 
import { LogService } from '../../services/log'; 

@Component({
  selector: 'app-gestion-utilisateurs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HttpClientModule],
  templateUrl: './gestion-utilisateurs.html',
  styleUrls: ['./gestion-utilisateurs.css']
})
export class GestionUtilisateursComponent implements OnInit {
  utilisateurs: any[] = [];
  chargement = false;
  erreur = '';
  succes = '';
  filtreRole = '';

  // ⚡ Variables de pagination ajoutées
  urlSuivante: string | null = null;
  urlPrecedente: string | null = null;
  totalItems: number = 0;

  roles = [
    { value: 'ADMIN_METIER', label: 'Admin Métier' },
    { value: 'ECOLE',        label: 'École Privée' },
    { value: 'MINISTERE',    label: 'Ministère' },
    { value: 'ETUDIANT',     label: 'Parent / Étudiant' },
  ];

  constructor(
    private authService: AuthService, 
    private router: Router,
    private http: HttpClient, 
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef,
    private logService: LogService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.chargerUtilisateurs();
    }
  }

  // ⚡ Méthode mise à jour pour gérer la pagination et les filtres
  chargerUtilisateurs(url?: string | null) {
    this.chargement = true;
    this.erreur = ''; 

    let requeteUrl = url || 'http://localhost:8000/api/utilisateurs/';
    if (!url && this.filtreRole) {
      requeteUrl += `?role=${this.filtreRole}`;
    }

    this.http.get(requeteUrl, this.authService['getHeaders']()).subscribe({
      next: (data: any) => {
        // Extraction des données de pagination de Django
        this.utilisateurs = data.results ? data.results : (Array.isArray(data) ? data : []);
        this.urlSuivante = data.next || null;
        this.urlPrecedente = data.previous || null;
        this.totalItems = data.count || this.utilisateurs.length;

        this.chargement = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        this.chargement = false;
        console.error("Erreur serveur détaillée :", err);

        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
        } else {
          this.erreur = "Erreur de connexion au serveur. Vérifiez la console (F12).";
        }
        this.cdr.detectChanges();
      }
    });
  }

  desactiver(user: any) {
    if (!confirm(`Désactiver ${user.email} ?`)) return;
    this.authService.desactiverUtilisateur(user.id).subscribe({
      next: () => { 
        this.chargerUtilisateurs(); 
        this.logService.ajouterLog('Compte désactivé', user.email, 'person-dash', 'warning');
      }
    });
  }

  supprimerUtilisateur(user: any) {
    if (!confirm(`ATTENTION : Voulez-vous vraiment supprimer DÉFINITIVEMENT le compte de ${user.email} ?`)) return;
    
    this.erreur = '';
    this.succes = '';

    this.authService.supprimerUtilisateur(user.id).subscribe({
      next: () => { 
        this.succes = 'Compte supprimé définitivement.'; 
        this.utilisateurs = this.utilisateurs.filter(u => u.id !== user.id);
        
        // Mise à jour du compteur visuel
        this.totalItems = this.totalItems > 0 ? this.totalItems - 1 : 0;

        this.logService.ajouterLog(
          'Suppression compte', 
          user.email, 
          'person-x', 
          'danger'
        );
        
        this.cdr.detectChanges();
      },
      error: (err) => { 
        const errorMsg = err.error ? JSON.stringify(err.error) : 'Erreur inconnue';
        this.erreur = "Erreur lors de la suppression : " + errorMsg; 
        console.error("Détail complet du blocage :", err);
        this.cdr.detectChanges();
      }
    });
  }

  getRoleLabel(role: string): string {
    const map: any = { 'ADMIN_SYS': 'Admin Système', 'ADMIN_METIER': 'Admin Métier', 'ECOLE': 'École Privée', 'MINISTERE': 'Ministère', 'ETUDIANT': 'Parent / Étudiant' };
    return map[role] || role;
  }
}