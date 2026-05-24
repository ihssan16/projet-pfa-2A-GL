import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent {
  constructor(private router: Router) {}

  // Informations étudiant
  etudiant = {
    nom: 'Youssef Alami',
    classe: '2ème Collège A',
    ecole: 'École Al Andalous'
  };

  // Cartes KPI
  stats = [
    { label: 'Moyenne générale', value: '15.2', suffix: '/20', icon: 'graph-up', color: 'primary' },
    { label: 'Rang en classe', value: '7', suffix: '/34', icon: 'trophy', color: 'success' },
    { label: 'Absences', value: '2', suffix: 'ce mois', icon: 'calendar-x', color: 'warning' },
    { label: 'Devoirs', value: '5', suffix: 'à venir', icon: 'book', color: 'info' }
  ];

  // Dernières notes
  notes = [
    { matiere: 'Mathématiques', coef: 4, note: 16.5, mention: 'Excellent', couleur: 'success' },
    { matiere: 'Français', coef: 3, note: 14, mention: 'Bien', couleur: 'info' },
    { matiere: 'Sciences Physiques', coef: 3, note: 15.5, mention: 'Bien', couleur: 'info' },
    { matiere: 'Anglais', coef: 2, note: 17, mention: 'Excellent', couleur: 'success' },
    { matiere: 'Histoire-Géo', coef: 2, note: 13.5, mention: 'Assez bien', couleur: 'warning' }
  ];

  // Emploi du temps aujourd'hui
  emploiTemps = [
    { heure: '08:00', matiere: 'Mathématiques', salle: 'A12', professeur: 'M. Benali' },
    { heure: '09:00', matiere: 'Français', salle: 'B05', professeur: 'Mme. Alami' },
    { heure: '11:00', matiere: 'Sciences', salle: 'Lab 2', professeur: 'M. Idrissi' }
  ];

  // Bulletins
  bulletins = [
    { trimestre: 'Trimestre 1 - 2024', etoiles: 4, status: 'completed' },
    { trimestre: 'Trimestre 2 - 2025', etoiles: 4, status: 'completed' },
    { trimestre: 'Trimestre 3 en cours', etoiles: 0, status: 'current' }
  ];

  // Absences récentes
  absences = [
    { date: '08/05', matiere: 'Maths', justifiee: true },
    { date: '28/04', matiere: 'Anglais', justifiee: false }
  ];

  progression = '+1.8 points';

  getMentionClass(mention: string): string {
    switch(mention) {
      case 'Excellent': return 'text-success';
      case 'Bien': return 'text-info';
      default: return 'text-warning';
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
    console.log('Voir bulletin:', trimestre);
    alert(`Téléchargement du ${trimestre}`);
  }

  logout() {
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