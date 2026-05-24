import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  constructor(private router: Router) {}
  
  selectProfile(profil: string) {
    if (profil === 'admin-systeme' || profil === 'parent' || profil === 'ecole') {
      // Si on clique sur Admin Système, on va vers le formulaire de login 
      this.router.navigate(['/authentification'], { queryParams: { role: profil } });
    } else {
      // Pour les autres cartes, on garde le comportement par défaut (vers les dashboards)
      this.router.navigate(['/' + profil]);
    }
  }
}