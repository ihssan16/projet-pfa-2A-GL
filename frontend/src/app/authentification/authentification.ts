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
        if (this.roleActuel === 'parent') {
          this.router.navigate(['/parent']);
        } else if (this.roleActuel === 'ecole') {
          this.router.navigate(['/ecole']); // Redirection vers le dashboard École
        } else {
          this.router.navigate(['/admin-systeme']);
        }
      },
      error: (erreur: any) => {
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