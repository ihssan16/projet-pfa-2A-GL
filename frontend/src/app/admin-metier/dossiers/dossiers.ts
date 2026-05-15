import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-dossiers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dossiers.html',
  styleUrls: ['./dossiers.css']
})
export class DossiersComponent {
  dossierId: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {
    this.dossierId = this.route.snapshot.paramMap.get('id');
  }

  validerDossier() {
    console.log('Dossier validé:', this.dossierId);
    alert(`Dossier ${this.dossierId} validé avec succès !`);
    this.router.navigate(['/admin-metier']);
  }

  refuserDossier() {
    console.log('Dossier refusé:', this.dossierId);
    alert(`Dossier ${this.dossierId} refusé.`);
    this.router.navigate(['/admin-metier']);
  }

  retour() {
    this.router.navigate(['/admin-metier']);
  }
}