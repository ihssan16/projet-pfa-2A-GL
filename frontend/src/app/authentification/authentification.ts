import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.spec';

@Component({
  selector: 'app-authentification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './authentification.html',
  styleUrls: ['./authentification.css']
})
export class AuthentificationComponent {
  email: string = '';
  mot_de_passe: string = '';
  messageErreur: string = '';
  enChargement: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.messageErreur = '';
    this.enChargement = true;

    this.authService.login(this.email, this.mot_de_passe).subscribe({
      next: (reponse) => {
        this.enChargement = false;
        this.router.navigate(['/admin-systeme']); // Redirection vers le dashboard 
      },
      error: (erreur) => {
        this.enChargement = false;
        if (erreur.status === 401) {
          this.messageErreur = 'Email ou mot de passe incorrect.';
        } else {
          this.messageErreur = 'Erreur de connexion au serveur backend.';
        }
      }
    });
  }
}