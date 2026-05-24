import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
    { value: 'PARENT_ETUDIANT', label: 'Parent / Étudiant' },
  ];

  nouveauUser = {
    email: '', first_name: '', last_name: '',
    role: 'ECOLE', password: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() { this.chargerUtilisateurs(); }

  chargerUtilisateurs() {
    this.chargement = true;
    this.authService.listerUtilisateurs(this.filtreRole || undefined).subscribe({
      next: (data) => { this.utilisateurs = data; this.chargement = false; },
      error: (err) => {
        if (err.status === 401 || err.status === 403) this.router.navigate(['/login']);
        this.erreur = 'Erreur de chargement.';
        this.chargement = false;
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
      }
    });
  }

  desactiver(user: any) {
    if (!confirm(`Désactiver le compte de ${user.email} ?`)) return;
    this.authService.desactiverUtilisateur(user.id).subscribe({
      next: () => { this.succes = 'Compte désactivé.'; this.chargerUtilisateurs(); },
      error: () => { this.erreur = 'Erreur lors de la désactivation.'; }
    });
  }

  getRoleLabel(role: string): string {
    const map: any = {
      'ADMIN_SYS':       'Admin Système',
      'ADMIN_METIER':    'Admin Métier',
      'ECOLE':           'École Privée',
      'MINISTERE':       'Ministère',
      'PARENT_ETUDIANT': 'Parent / Étudiant',
    };
    return map[role] || role;
  }

  logout() { this.authService.logout(); this.router.navigate(['/login']); }
}