import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';
import { HttpClient, HttpClientModule } from '@angular/common/http'; 

@Component({
  selector: 'app-gestion-utilisateurs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HttpClientModule],
  templateUrl: './gestion-utilisateurs.html',
  styleUrls: ['./gestion-utilisateurs.css']
})
export class GestionUtilisateursComponent implements OnInit {
  utilisateurs: any[] = [];
  ecolesDisponibles: any[] = []; 
  chargement = false;
  erreur = '';
  succes = '';
  afficherFormulaire = false;
  filtreRole = '';

  roles = [
    { value: 'ADMIN_METIER',    label: 'Admin Métier' },
    { value: 'ECOLE',           label: 'École Privée' },
    { value: 'MINISTERE',       label: 'Ministère' },
    { value: 'ETUDIANT',        label: 'Parent / Étudiant' },
  ];

  // Le modèle contient à la fois les infos pour créer une nouvelle école ET pour lier un élève
  nouveauUser = {
    email: '', first_name: '', last_name: '',
    role: 'ECOLE', password: '', 
    ecole_nom: '', ecole_ville: '', ecole_niveaux: '', ecole_id: '' 
  };

  constructor(
    private authService: AuthService, 
    private router: Router,
    private http: HttpClient, 
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.chargerUtilisateurs();
        this.chargerEcoles(); // Utile pour le menu déroulant des étudiants
      });
    } else {
      this.chargement = false;
    }
  }

  chargerEcoles() {
    this.http.get('http://localhost:8000/api/ecoles/').subscribe({
      next: (data: any) => {
        this.ecolesDisponibles = data;
        this.cdr.detectChanges(); 
      },
      error: (err) => console.error("Échec du chargement des écoles :", err)
    });
  }

  chargerUtilisateurs() {
    this.chargement = true;
    this.erreur = '';
    this.utilisateurs = [];

    this.authService.listerUtilisateurs(this.filtreRole || undefined).subscribe({
      next: (data: any) => {
        if (data && data.results) {
          this.utilisateurs = data.results;
        } else if (Array.isArray(data)) {
          this.utilisateurs = data;
        }
        this.chargement = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        if (err.status === 401 || err.status === 403) this.router.navigate(['/login']);
        else this.erreur = 'Erreur de chargement.';
        this.chargement = false;
        this.cdr.detectChanges();
      }
    });
  }

  creerUtilisateur() {
    this.erreur = ''; this.succes = '';
    this.authService.creerUtilisateur(this.nouveauUser).subscribe({
      next: () => {
        this.succes = `Compte créé avec succès !`;
        this.afficherFormulaire = false;
        // On réinitialise tous les champs
        this.nouveauUser = { email: '', first_name: '', last_name: '', role: 'ECOLE', password: '', ecole_nom: '', ecole_ville: '', ecole_niveaux: '', ecole_id: '' };
        this.chargerUtilisateurs();
        this.chargerEcoles(); // On recharge les écoles car on vient potentiellement d'en créer une nouvelle !
      },
      error: (err) => {
        this.erreur = err.error?.email?.[0] || err.error?.password?.[0] || 'Erreur lors de la création.';
        this.cdr.detectChanges();
      }
    });
  }

  desactiver(user: any) {
    if (!confirm(`Désactiver le compte de ${user.email} ?`)) return;
    this.authService.desactiverUtilisateur(user.id).subscribe({
      next: () => { 
        this.succes = 'Compte désactivé.'; 
        this.chargerUtilisateurs(); 
      },
      error: () => { 
        this.erreur = 'Erreur lors de la désactivation.'; 
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

  logout() { 
    this.authService.logout(); 
    this.router.navigate(['/login']); 
  }
}