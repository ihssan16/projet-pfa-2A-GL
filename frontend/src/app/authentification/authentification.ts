import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router'; 
import { AuthService } from '../auth.service'; 

@Component({
  selector: 'app-authentification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './authentification.html',
  styleUrls: ['./authentification.css']
})
export class AuthentificationComponent implements OnInit { 
  email: string = '';
  mot_de_passe: string = '';
  messageErreur: string = '';
  enChargement: boolean = false;

  roleActuel: string = 'admin-systeme';
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute 
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['role']) {
        this.roleActuel = params['role'];
      }
    });
  }

  onSubmit() {
  this.messageErreur = '';
  this.enChargement = true;

  this.authService.login(this.email, this.mot_de_passe).subscribe({
    next: (reponse: any) => {
      this.enChargement = false;

      // Redirection basée sur le rôle retourné par le backend
      const routes: any = {
        'ADMIN_SYS':       '/admin-systeme',
        'ADMIN_METIER':    '/admin-metier',
        'ECOLE':           '/ecole',
        'MINISTERE':       '/ministere',
        'PARENT_ETUDIANT': '/parent',
      };
      const route = routes[reponse.role] || '/login';
      this.router.navigate([route]);
    },
    error: (erreur: any) => {
      this.enChargement = false;
      if (erreur.status === 401) {
        this.messageErreur = 'Email ou mot de passe incorrect.';
      } else if (erreur.status === 403) {
        this.messageErreur = 'Compte désactivé. Contactez l\'administrateur.';
      } else {
        this.messageErreur = 'Erreur de connexion au serveur backend.';
      }
    }
  });
}
}