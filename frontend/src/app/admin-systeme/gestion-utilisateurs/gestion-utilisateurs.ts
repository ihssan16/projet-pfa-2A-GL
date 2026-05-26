import { Component, OnInit, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core'; // 1. Import ajouté ici
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-gestion-utilisateurs',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './gestion-utilisateurs.html',
  styleUrls: ['./gestion-utilisateurs.css']
})
export class GestionUtilisateursComponent implements OnInit {
  utilisateurs: any[] = [];
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

  nouveauUser = {
    email: '', first_name: '', last_name: '',
    role: 'ECOLE', password: ''
  };

  constructor(
    private authService: AuthService, 
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.chargerUtilisateurs();
      });
    } else {
      this.chargement = false;
    }
  }

  chargerUtilisateurs() {
    this.chargement = true;
    this.erreur = '';
    this.utilisateurs = [];

    this.authService.listerUtilisateurs(this.filtreRole || undefined).subscribe({
      next: (data: any) => {
        console.log("🕵️ Données brutes de Django :", data);
        
        if (data && data.results) {
          this.utilisateurs = data.results;
        } else if (Array.isArray(data)) {
          this.utilisateurs = data;
        } else {
          this.utilisateurs = [];
        }
        
        this.chargement = false;
        
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Erreur de requête :', err);
        if (err.status === 401 || err.status === 403) {
          this.router.navigate(['/login']);
        } else {
          this.erreur = 'Erreur de chargement.';
        }
        this.chargement = false;
        this.cdr.detectChanges(); // Forcer aussi l'affichage du message d'erreur
      }
    });
  }

  creerUtilisateur() {
    this.erreur = ''; this.succes = '';
    this.authService.creerUtilisateur(this.nouveauUser).subscribe({
      next: () => {
        this.succes = `Compte créé pour ${this.nouveauUser.email}`;
        this.afficherFormulaire = false;
        this.nouveauUser = { email: '', first_name: '', last_name: '', role: 'ECOLE', password: '' };
        this.chargerUtilisateurs();
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