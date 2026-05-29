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
  ecolesDisponibles: any[] = []; 
  chargement = false;
  erreur = '';
  succes = '';
  afficherFormulaire = false;
  filtreRole = '';

  roles = [
    { value: 'ADMIN_METIER', label: 'Admin Métier' },
    { value: 'ECOLE',        label: 'École Privée' },
    { value: 'MINISTERE',    label: 'Ministère' },
    { value: 'ETUDIANT',     label: 'Parent / Étudiant' },
  ];

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
    private cdr: ChangeDetectorRef,
    private logService: LogService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.chargerUtilisateurs();
      this.chargerEcoles(); 
    }
  }

  chargerEcoles() {
    this.http.get('http://localhost:8000/api/ecoles/').subscribe({
      next: (data: any) => { this.ecolesDisponibles = data; this.cdr.detectChanges(); },
      error: (err) => console.error("Échec chargement écoles :", err)
    });
  }

  chargerUtilisateurs() {
    this.chargement = true;
    this.erreur = ''; 

    this.authService.listerUtilisateurs(this.filtreRole || undefined).subscribe({
      next: (data: any) => {
        // On récupère les données
        this.utilisateurs = data.results || data;
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


  creerUtilisateur() {
    console.log("Bouton cliqué ! Voici les données captées :", this.nouveauUser);

    this.erreur = ''; 
    this.succes = '';

    if (!this.nouveauUser.email || this.nouveauUser.email.trim() === '') {
      this.erreur = "Veuillez taper l'email manuellement.";
      this.cdr.detectChanges();
      return; 
    }
    
    if (!this.nouveauUser.password || this.nouveauUser.password.trim() === '') {
      this.erreur = "Veuillez taper le mot de passe.";
      this.cdr.detectChanges(); 
      return; 
    }

    if (this.nouveauUser.role === 'ECOLE') {
      this.nouveauUser.first_name = 'Direction';
      this.nouveauUser.last_name = this.nouveauUser.ecole_nom || 'École';
    }

    const payload = { ...this.nouveauUser };

    if (!payload.ecole_id || payload.ecole_id === '' || payload.ecole_id === null) {
      delete (payload as any).ecole_id;
    } else {
      const parsedId = parseInt(payload.ecole_id as string, 10);
      if (isNaN(parsedId)) {
        delete (payload as any).ecole_id;
      } else {
        payload.ecole_id = parsedId as any;
      }
    }

    console.log("Données prêtes à être envoyées à Django :", payload);

    this.authService.creerUtilisateur(payload).subscribe({
      next: () => {
        this.succes = `Compte ${payload.email} créé avec succès !`;
        this.afficherFormulaire = false;
        
        this.nouveauUser = { 
            email: '', first_name: '', last_name: '', role: 'ECOLE', 
            password: '', ecole_nom: '', ecole_ville: '', 
            ecole_niveaux: '', ecole_id: '' 
        };
        
        this.chargerUtilisateurs();
        this.logService.ajouterLog('Création compte ' + this.getRoleLabel(payload.role), payload.email, 'person-plus', 'primary');
      },
      error: (err) => {
        const errorMsg = err.error ? JSON.stringify(err.error) : 'Erreur lors de la création.';
        this.erreur = "Erreur Django : " + errorMsg;
        console.error("Détail complet de l'erreur Django :", err.error);
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