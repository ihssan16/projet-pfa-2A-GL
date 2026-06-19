import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-emploi-temps',
  standalone: true,
  imports: [CommonModule, RouterLink, HttpClientModule],
  templateUrl: './emploi-temps.html',
  styleUrls: ['./emploi-temps.css']
})
export class EmploiTempsComponent implements OnInit {
  // Déclaration explicite des tableaux pour structurer la grille HTML
  jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  heures = ['08:00 - 10:00', '10:00 - 12:00', '14:00 - 16:00', '16:00 - 18:00'];
  
  planning: any = {};
  nombreProfsEcole: number = 0;
  chargement = true;
  infosEtudiant = { ecole: 'École par défaut', classe: 'Classe par défaut' };

  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) {
    // 1. On pré-construit une grille vide pour éviter que le HTML ne crashe
    this.jours.forEach(j => {
      this.planning[j] = {};
      this.heures.forEach(h => {
        this.planning[j][h] = null;
      });
    });
  }

  ngOnInit() {
    this.recupererProfilEtGenererGrid();
  }

  recupererProfilEtGenererGrid() {
    const token = localStorage.getItem('access') || localStorage.getItem('access_token');
    
    // Si l'utilisateur n'est pas connecté ou bug, on génère un tableau de secours
    if (!token) {
      this.construireEmploiDuTempsHebdomadaire('Demo', 'Demo');
      this.chargement = false;
      return;
    }

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get('http://localhost:8000/api/profil/', { headers }).subscribe({
      next: (data: any) => {
        if (data.profil_etudiant) {
          this.infosEtudiant.ecole = data.profil_etudiant.ecole?.nom || 'Mon École';
          this.infosEtudiant.classe = data.profil_etudiant.niveau || 'Ma Classe';
        }
        // Génération unique basée sur les vraies infos
        this.construireEmploiDuTempsHebdomadaire(this.infosEtudiant.ecole, this.infosEtudiant.classe);
        this.chargement = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur API Emploi du temps:', err);
        // Mode secours en cas d'erreur de la base de données
        this.construireEmploiDuTempsHebdomadaire('Ecole Secours', 'Classe Secours');
        this.chargement = false;
        this.cdr.detectChanges();
      }
    });
  }

  construireEmploiDuTempsHebdomadaire(ecole: string, classe: string) {
    const matieresPool = [
      { nom: 'Mathématiques', profs: ['M. Benali', 'Mme. Jabri', 'M. Zaidi'], color: 'primary' },
      { nom: 'Français', profs: ['Mme. Alami', 'M. Bourkia', 'Mme. El Amrani'], color: 'info' },
      { nom: 'Sciences Physiques', profs: ['M. Idrissi', 'Mme. Seddiki'], color: 'success' },
      { nom: 'Anglais', profs: ['Mme. Tazi', 'M. Walters'], color: 'warning' },
      { nom: 'Informatique', profs: ['M. Nouri', 'Mme. Chami'], color: 'dark' },
      { nom: 'SVT', profs: ['M. Chraibi', 'Mme. Bennani'], color: 'success' },
      { nom: 'Histoire-Géo', profs: ['M. El Mansouri', 'Mme. Rami'], color: 'secondary' }
    ];

    this.nombreProfsEcole = 12 + (ecole.length % 16);

    this.jours.forEach((j, jourIdx) => {
      this.planning[j] = {};
      this.heures.forEach((h, heureIdx) => {
        
        const hash = ecole.length * 3 + classe.length * 7 + (jourIdx + 1) * 11 + (heureIdx + 1) * 17;

        if (hash % 4 !== 0) {
          const matIdx = hash % matieresPool.length;
          const matiere = matieresPool[matIdx];
          
          const profPoolLimit = Math.min(matiere.profs.length, Math.ceil(this.nombreProfsEcole / 3));
          const profNom = matiere.profs[hash % profPoolLimit] || matiere.profs[0];
          
          const salleNum = 10 + (hash % 25);
          let typeSalle = 'Salle';
          if (matiere.nom.includes('Physiques') || matiere.nom.includes('SVT')) typeSalle = 'Labo';
          if (matiere.nom.includes('Informatique')) typeSalle = 'Salle Info';

          this.planning[j][h] = {
            matiere: matiere.nom,
            prof: profNom,
            salle: typeSalle === 'Salle' ? `Salle ${salleNum}` : `${typeSalle} ${(salleNum % 3) + 1}`,
            color: matiere.color
          };
        } else {
          this.planning[j][h] = null;
        }
      });
    });
  }

  getCours(jour: string, heure: string) {
    return this.planning[jour] ? this.planning[jour][heure] : null;
  }
}