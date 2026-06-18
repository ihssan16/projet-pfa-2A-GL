import { Component, afterNextRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent {
  
  totalEtablissements: number = 0;
  totalEleves: number = 0;

  stats: any[] = [
    { label: 'Établissements supervisés', value: 0, color: 'primary', icon: 'building'},
    { label: 'Élèves total', value: '0', color: 'success', icon: 'people'},
    { label: 'Taux de conformité', value: '94%', color: 'warning', icon: 'check-circle'}
  ];

  regions: any[] = [];

  toutesDemandes: any[] = [];
  
  ecoleSelectionnee: any = null;
  showEcoleModal = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    afterNextRender(() => {
      this.chargerStatistiques();
      this.chargerToutesLesDemandes();
    });
  }

  private getHeaders(): { headers: HttpHeaders } {
    let headers = new HttpHeaders();
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('access') || localStorage.getItem('access_token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return { headers: headers };
  }

  chargerStatistiques() {
    this.http.get<any>('http://localhost:8000/api/ministere-stats/', this.getHeaders()).subscribe({
      next: (data) => {
        this.totalEtablissements = data.total_etablissements || 0;
        this.totalEleves = data.total_eleves || 0;
        this.stats[0].value = this.totalEtablissements;
        this.stats[1].value = this.totalEleves.toLocaleString('fr-FR'); 
        this.stats[2].value = (data.taux_conformite || 94) + '%';
        if (data.regions) this.regions = data.regions;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 401) this.logout();
      }
    });
  }

  chargerToutesLesDemandes() {
    this.http.get<any[]>('http://localhost:8000/api/demandes/', this.getHeaders()).subscribe({
      next: (data) => {
        const dossiers = data.map(d => ({
          ...d,
          _typeLigne: 'DOSSIER',
          _titre: d.reference,
          _sousTitre: d.etablissement,
          _date: d.date_depot
        }));
        this.integrerDemandes(dossiers, 'DOSSIER');
      }
    });

    this.http.get<any[]>('http://localhost:8000/api/ecoles-inscription/', this.getHeaders()).subscribe({
      next: (data) => {
        const ecoles = data.map(d => ({
          ...d,
          _typeLigne: 'ECOLE',
          _titre: d.nom,
          _sousTitre: d.niveaux,
          _date: d.date_demande || d.date_validation_admin
        }));
        this.integrerDemandes(ecoles, 'ECOLE');
      }
    });
  }

  private integrerDemandes(nouvellesDonnees: any[], type: string) {
    let liste = this.toutesDemandes.filter(d => d._typeLigne !== type);
    liste = [...liste, ...nouvellesDonnees];
    this.toutesDemandes = liste.sort((a, b) => new Date(b._date).getTime() - new Date(a._date).getTime());
    this.cdr.detectChanges();
  }

  validerMinistere(demande: any) {
    if (confirm(`Valider définitivement le dossier ${demande._titre} ?`)) {
      this.http.patch(`http://localhost:8000/api/demandes/${demande.id}/`, { action: 'valider' }, this.getHeaders()).subscribe({
        next: (res: any) => {
          alert(`✅ ${res.message}`);
          const item = this.toutesDemandes.find(d => d.id === demande.id);
          if (item) item.statut = res.statut || 'Validé par Ministère';
        },
        error: (err) => alert('Erreur: ' + (err.error?.error || err.message))
      });
    }
  }

  refuserMinistere(demande: any) {
    const motif = prompt(`Motif du refus pour ${demande._titre} :`);
    if (motif !== null) {
      this.http.patch(`http://localhost:8000/api/demandes/${demande.id}/`, { action: 'refuser', commentaire: motif }, this.getHeaders()).subscribe({
        next: (res: any) => {
          alert(`❌ ${res.message}`);
          const item = this.toutesDemandes.find(d => d.id === demande.id);
          if (item) item.statut = res.statut || 'Refusé';
        },
        error: (err) => alert('Erreur: ' + (err.error?.error || err.message))
      });
    }
  }

  validerEcoleMinistere(demande: any) {
    if (confirm(`Valider définitivement l'école ${demande._titre} ?`)) {
      this.http.patch(`http://localhost:8000/api/ecoles-inscription/${demande.id}/`, { action: 'valider' }, this.getHeaders()).subscribe({
        next: (res: any) => {
          alert(`✅ ${res.message}`);
          const item = this.toutesDemandes.find(d => d.id === demande.id);
          if (item) item.statut = res.statut || 'Validé par Ministère';
          this.fermerEcoleModal();
        },
        error: (err) => alert('Erreur: ' + (err.error?.error || err.message))
      });
    }
  }

  refuserEcoleMinistere(demande: any) {
    if (confirm(`Refuser l'école ${demande._titre} ?`)) {
      this.http.patch(`http://localhost:8000/api/ecoles-inscription/${demande.id}/`, { action: 'refuser' }, this.getHeaders()).subscribe({
        next: (res: any) => {
          alert(`❌ ${res.message}`);
          const item = this.toutesDemandes.find(d => d.id === demande.id);
          if (item) item.statut = res.statut || 'Refusée';
          this.fermerEcoleModal();
        },
        error: (err) => alert('Erreur: ' + (err.error?.error || err.message))
      });
    }
  }

  telechargerDocument(demande: any) {
    if (!demande.nb_fichiers || demande.nb_fichiers === 0) {
      alert('Aucun document disponible pour cette demande');
      return;
    }
    this.http.get(`http://localhost:8000/api/demandes/${demande.id}/documents/`, this.getHeaders()).subscribe({
      next: (res: any) => {
        if (res.documents && res.documents.length > 0) {
          res.documents.forEach((doc: any) => {
            const link = document.createElement('a');
            link.href = `http://localhost:8000/api/demandes/${demande.id}/download/${encodeURIComponent(doc.name)}`;
            link.download = doc.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          });
        } else {
          alert('Aucun document disponible');
        }
      },
      error: () => alert('Erreur lors du téléchargement')
    });
  }

  getStatutBadge(statut: string): string {
    if (!statut) return 'bg-secondary';
    const s = statut.toLowerCase();
    if (s.includes('refus')) return 'bg-danger';
    if (s.includes('attente') || s.includes('admin')) return 'bg-warning text-dark';
    if (s.includes('ministère') || s.includes('active')) return 'bg-success';
    return 'bg-info text-dark';
  }

  getConformiteClass(conformite: number): string {
    if (conformite >= 95) return 'bg-success';
    if (conformite >= 90) return 'bg-warning';
    return 'bg-danger';
  }

  voirDetailsRegion(region: string) { this.router.navigate(['/ministere/region', region]); }
  
  logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/login']);
  }

  voirDetailsEcole(ecole: any) {
    this.ecoleSelectionnee = ecole;
    this.showEcoleModal = true;
  }

  fermerEcoleModal() {
    this.showEcoleModal = false;
    this.ecoleSelectionnee = null;
  }

  getDocumentUrl(chemin: string): string {
    if (!chemin) return '';
    if (chemin.startsWith('http')) return chemin;
    return `http://localhost:8000${chemin}`;
  }
  
  estTraitee(statut: string): boolean {
    const s = statut?.toLowerCase() || '';
    return s.includes('refus') || s.includes('ministère') || s.includes('active');
  }
}