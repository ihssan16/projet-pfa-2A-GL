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
  jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
  heures = ['08:00 - 10:00', '10:00 - 12:00', '14:00 - 16:00', '16:00 - 18:00'];
  
  planning: any = {};
  chargement = true;
  infosEtudiant = { ecole: '', classe: '' };

  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) {
    // Pré-initialisation de la grille pour éviter les bugs d'affichage
    this.jours.forEach(j => {
      this.planning[j] = {};
      this.heures.forEach(h => this.planning[j][h] = null);
    });
  }

  ngOnInit() {
    this.recupererProfilEtEnseignants();
  }

  recupererProfilEtEnseignants() {
    const token = localStorage.getItem('access') || localStorage.getItem('access_token');
    if (!token) { this.router.navigate(['/login']); return; }
    
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    // 1. Récupération du profil
    this.http.get('http://localhost:8000/api/profil/', { headers }).subscribe({
      next: (data: any) => {
        if (data.profil_etudiant) {
          this.infosEtudiant.ecole = data.profil_etudiant.ecole?.nom || 'École';
          this.infosEtudiant.classe = data.profil_etudiant.niveau || 'Classe';
        }
        
        // 2. Récupération des professeurs de la base de données
        this.http.get<any[]>('http://localhost:8000/api/mes-enseignants/', { headers }).subscribe({
          next: (enseignantsBD) => {
            this.construireEmploiDuTempsHebdomadaire(this.infosEtudiant.ecole, this.infosEtudiant.classe, enseignantsBD);
            this.chargement = false;
            this.cdr.detectChanges();
          },
          error: () => {
             // Sécurité si l'API des enseignants échoue
             this.construireEmploiDuTempsHebdomadaire(this.infosEtudiant.ecole, this.infosEtudiant.classe, []);
             this.chargement = false;
             this.cdr.detectChanges();
          }
        });
      },
      error: () => { this.chargement = false; this.cdr.detectChanges(); }
    });
  }

  construireEmploiDuTempsHebdomadaire(ecole: string, classe: string, enseignantsBD: any[]) {
    let profsParMatiere: any = {};
    
    if (enseignantsBD && enseignantsBD.length > 0) {
      enseignantsBD.forEach(prof => {
        if (!profsParMatiere[prof.matiere]) profsParMatiere[prof.matiere] = [];
        profsParMatiere[prof.matiere].push(prof.nom_complet);
      });
    }

    const fallbackProfs: any = {
      'Mathématiques': ['M. Benali'], 'Informatique': ['M. Nouri'], 
      'Sciences Physiques': ['M. Idrissi'], 'Anglais': ['Mme. Tazi'], 
      'Histoire-Géo': ['M. El Mansouri'], 'Lecture': ['Mme. Alami'], 'Écriture': ['Mme. Alami']
    };

    if (Object.keys(profsParMatiere).length === 0) {
      profsParMatiere = fallbackProfs;
    } else {
      for (const mat of Object.keys(fallbackProfs)) {
        if (!profsParMatiere[mat] || profsParMatiere[mat].length === 0) {
          profsParMatiere[mat] = ['Professeur (Non assigné)'];
        }
      }
    }

    const matieresDispos = Object.keys(profsParMatiere);

    this.jours.forEach((j, jourIdx) => {
      this.planning[j] = {};
      this.heures.forEach((h, heureIdx) => {
        
        const hash = ecole.length * 3 + classe.length * 7 + (jourIdx + 1) * 11 + (heureIdx + 1) * 17;
        
        // --- LOGIQUE SCOLAIRE RÉALISTE ---
        let estLibre = false;
        
        // 1. Le Mercredi après-midi est toujours libre
        if (j === 'Mercredi' && (heureIdx === 2 || heureIdx === 3)) {
          estLibre = true;
        }
        // 2. Le Vendredi de 16h à 18h a de fortes chances d'être libre
        else if (j === 'Vendredi' && heureIdx === 3 && (hash % 2 === 0)) {
          estLibre = true;
        }
        // 3. Les autres jours de 16h à 18h ont une petite chance d'être libres (fini plus tôt)
        else if (heureIdx === 3 && (hash % 4 === 0)) {
          estLibre = true;
        }
        // Les matins (0, 1) et le début d'aprem (2) sont TOUJOURS remplis.

        if (!estLibre) {
          // Pour éviter d'avoir la même matière 4h de suite, on modifie le sel du hash avec l'heure
          const matHash = hash + (heureIdx * 13); 
          const matNom = matieresDispos[matHash % matieresDispos.length];
          const profsDeCetteMatiere = profsParMatiere[matNom];
          const profNom = profsDeCetteMatiere[hash % profsDeCetteMatiere.length];
          
          const salleNum = 10 + (hash % 25);
          let typeSalle = 'Salle';
          let couleurTheme = 'primary';

          if (matNom.toLowerCase().includes('physique') || matNom.toLowerCase().includes('science')) {
            typeSalle = 'Labo'; couleurTheme = 'success';
          } else if (matNom.toLowerCase().includes('informatique')) {
            typeSalle = 'Salle Info'; couleurTheme = 'dark';
          } else if (matNom.toLowerCase().includes('anglais')) {
            couleurTheme = 'warning';
          } else if (matNom.toLowerCase().includes('histoire')) {
            couleurTheme = 'secondary';
          } else if (matNom.toLowerCase().includes('lecture') || matNom.toLowerCase().includes('écriture')) {
            couleurTheme = 'info';
          }

          this.planning[j][h] = {
            matiere: matNom,
            prof: profNom,
            salle: typeSalle === 'Salle' ? `Salle ${salleNum}` : `${typeSalle} ${(salleNum % 3) + 1}`,
            color: couleurTheme
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