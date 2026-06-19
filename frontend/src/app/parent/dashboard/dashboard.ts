import { Component, afterNextRender, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule], 
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent {
  
  etudiant = {
    nom: 'Chargement...',
    classe: '...',
    ecole: '...'
  };

  // Le KPI des devoirs a été retiré, il reste 3 compteurs principaux
  stats = [
    { label: 'Moyenne générale', value: '...', suffix: '/20', icon: 'graph-up', color: 'primary' },
    { label: 'Rang en classe', value: '...', suffix: '...', icon: 'trophy', color: 'success' },
    { label: 'Absences', value: '0', suffix: 'ce trimestre', icon: 'calendar-x', color: 'warning' }
  ];

  notes: any[] = [];

  emploiTemps = [
    { heure: '08:00', matiere: 'Mathématiques', salle: 'A12', professeur: 'M. Benali' },
    { heure: '09:00', matiere: 'Français', salle: 'B05', professeur: 'Mme. Alami' },
    { heure: '11:00', matiere: 'Sciences', salle: 'Lab 2', professeur: 'M. Idrissi' }
  ];

  bulletins = [
    { trimestre: 'Trimestre 1 - 2024', etoiles: 4, status: 'completed' },
    { trimestre: 'Trimestre 2 - 2025', etoiles: 4, status: 'completed' },
    { trimestre: 'Trimestre 3 en cours', etoiles: 0, status: 'current' }
  ];

  // Ce tableau est désormais alimenté dynamiquement
  absences: any[] = [];

  progression = '+1.8 points';

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    afterNextRender(() => {
      this.chargerProfil();
    });
  }

  chargerProfil() {
    const token = localStorage.getItem('access') || localStorage.getItem('access_token');
    if (!token) {
      this.router.navigate(['/login']); 
      return;
    }

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    this.http.get('http://localhost:8000/api/profil/', { headers }).subscribe({
      next: (data: any) => {
        this.etudiant.nom = `${data.first_name} ${data.last_name}`;

        if (data.profil_etudiant) {
          this.etudiant.ecole = data.profil_etudiant.ecole?.nom || 'École non renseignée';
          this.etudiant.classe = data.profil_etudiant.niveau || 'Classe non renseignée'; 
          
          // Extraction des nouvelles notes
          const math20 = (data.profil_etudiant.note_math || 0) / 5;
          const lecture20 = (data.profil_etudiant.note_lecture || 0) / 5;
          const ecriture20 = (data.profil_etudiant.note_ecriture || 0) / 5;
          const physique20 = (data.profil_etudiant.note_physique || 0) / 5;
          const anglais20 = (data.profil_etudiant.note_anglais || 0) / 5;
          const histoire20 = (data.profil_etudiant.note_histoire || 0) / 5;
          const info20 = (data.profil_etudiant.note_informatique || 0) / 5;

          this.notes = [
            { matiere: 'Mathématiques', coef: 4, note: math20, mention: this.calculerMention(math20), couleur: this.calculerCouleurTheme(math20) },
            { matiere: 'Informatique', coef: 4, note: info20, mention: this.calculerMention(info20), couleur: this.calculerCouleurTheme(info20) },
            { matiere: 'Sciences Physiques', coef: 4, note: physique20, mention: this.calculerMention(physique20), couleur: this.calculerCouleurTheme(physique20) },
            { matiere: 'Anglais', coef: 2, note: anglais20, mention: this.calculerMention(anglais20), couleur: this.calculerCouleurTheme(anglais20) },
            { matiere: 'Histoire-Géo', coef: 2, note: histoire20, mention: this.calculerMention(histoire20), couleur: this.calculerCouleurTheme(histoire20) },
            { matiere: 'Lecture', coef: 2, note: lecture20, mention: this.calculerMention(lecture20), couleur: this.calculerCouleurTheme(lecture20) },
            { matiere: 'Écriture', coef: 2, note: ecriture20, mention: this.calculerMention(ecriture20), couleur: this.calculerCouleurTheme(ecriture20) }
          ];

          const moyenne = data.profil_etudiant.moyenne || 0;
          const rang = data.profil_etudiant.rang || 1;
          const totalEleves = data.profil_etudiant.total_eleves || 1;

          this.stats[0].value = moyenne.toString();
          this.stats[1].value = rang.toString();
          this.stats[1].suffix = '/' + totalEleves.toString();

          const seed = this.etudiant.nom.length;
          this.absences = [
            { date: '12/05', matiere: 'Mathématiques', justifiee: seed % 2 === 0 },
            { date: '28/04', matiere: 'Anglais', justifiee: true }
          ];

          if (seed % 3 === 0) {
            this.absences.push({ date: '18/05', matiere: 'Informatique', justifiee: false });
          }
          if (seed % 4 === 0) {
            this.absences.push({ date: '02/06', matiere: 'Sciences Physiques', justifiee: true });
          }

          // Mise à jour de la valeur sur le badge KPI correspondant (index 2)
          this.stats[2].value = this.absences.length.toString();
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur lors du chargement du profil :", err);
      }
    });
  }

  calculerMention(noteSur20: number): string {
    if (noteSur20 >= 16) return 'Excellent';
    if (noteSur20 >= 14) return 'Bien';
    if (noteSur20 >= 12) return 'Assez bien';
    if (noteSur20 >= 10) return 'Passable';
    return 'Insuffisant';
  }

  calculerCouleurTheme(noteSur20: number): string {
    if (noteSur20 >= 16) return 'success';
    if (noteSur20 >= 14) return 'info';
    if (noteSur20 >= 12) return 'warning';
    return 'danger';
  }

  getMentionClass(mention: string): string {
    switch(mention) {
      case 'Excellent': return 'text-success';
      case 'Bien': return 'text-info';
      case 'Assez bien': return 'text-warning';
      case 'Passable': return 'text-warning';
      default: return 'text-danger';
    }
  }

  getNoteClass(note: number): string {
    if (note >= 16) return 'text-success';
    if (note >= 14) return 'text-info';
    if (note >= 12) return 'text-warning';
    return 'text-danger';
  }

  voirEmploiTemps() {
    this.router.navigate(['/parent/emploi-temps']);
  }

  voirToutesNotes() {
    this.router.navigate(['/parent/notes']);
  }

  voirBulletin(trimestre: string) {
    alert(`Téléchargement du ${trimestre}`);
  }

  logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    this.router.navigate(['/login']);
  }

  getCurrentDate(): string {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('fr-FR', options);
  }
}