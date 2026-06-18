import { HttpClient, HttpHeaders } from '@angular/common/http'; 
import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; 
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], 
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponentEcole implements OnInit {

  constructor(
    private router: Router, 
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object 
  ) {}

  ecole: any = {
    nom: 'Chargement des données...',
    ville: '...',
    niveaux: '...'
  };

  stats = [
    { label: 'Élèves inscrits', value: 0, icon: 'people', color: 'primary', change: '' },
    { label: 'Enseignants', value: 0, icon: 'person-badge', color: 'success', change: '+3' },
    { label: 'Documents', value: 0, icon: 'file-earmark-text', color: 'info', change: '' },
    { label: 'Demandes', value: 0, icon: 'files', color: 'warning', change: '' }
  ];
  
  actionsRapides = [
    { label: 'Mettre à jour les informations', icon: 'pencil-square', route: '/ecole/informations' },
    { label: 'Gérer les élèves', icon: 'people', route: '/ecole/eleves' },
    { label: 'Voir mes documents', icon: 'folder', route: '/ecole/documents' },
    { label: 'Historique des demandes', icon: 'clock-history', route: '/ecole/demandes' }
  ];

  nouvelleDemande = { type: 'INSCRIPTION', typeAutre: '' };
  fichiers: File[] = [];
  chargementSoumission = false;
  messageSoumission = '';
  messageType = '';
  mesDemandes: any[] = [];

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.chargerDonneesCloud();
      this.chargerDemandes();

    }
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

  chargerDonneesCloud() {
    this.http.get('http://localhost:8000/api/profil/', this.getHeaders()).subscribe({
      next: (profil: any) => {
        this.ecole = {
          nom: profil.ecole_nom || profil.last_name || 'École sans nom',
          ville: profil.ecole_ville || 'Ville non renseignée',
          niveaux: profil.ecole_niveaux || 'Niveaux non spécifiés'
        };
        
        this.stats[0].value = profil.nombre_etudiants || 0;

        this.stats[1].value = Math.max(Math.floor(this.stats[0].value / 15), 5);

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("Erreur de connexion au profil", err);
        if (err.status === 401) this.logout();
      }
    });
  }

  logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/login']);
  }

  onFileSelected(event: any) {
    this.fichiers = Array.from(event.target.files);
  }

  soumettreDemande() {
    this.chargementSoumission = true;
    this.messageSoumission = '';
    
    let typeDemande = this.nouvelleDemande.type;
    if (typeDemande === 'AUTRE' && this.nouvelleDemande.typeAutre) {
      typeDemande = this.nouvelleDemande.typeAutre;
    }
    
    const formData = new FormData();
    formData.append('type_demande', typeDemande);
    formData.append('nombre_fichiers', String(this.fichiers.length));
    
    this.fichiers.forEach((file, index) => {
      formData.append(`document_${index}`, file);
    });
    
    this.http.post(
      'http://localhost:8000/api/demandes/',
      formData,
      this.getHeaders()
    ).subscribe({
      next: (response: any) => {
        this.chargementSoumission = false;
        this.messageType = 'success';
        this.messageSoumission = response.message + ` - Réf: ${response.reference}`;
        this.nouvelleDemande = { type: 'INSCRIPTION', typeAutre: '' };
        this.fichiers = [];
        this.chargerDemandes();
        setTimeout(() => this.messageSoumission = '', 5000);
      },
      error: (err) => {
        this.chargementSoumission = false;
        this.messageType = 'danger';
        this.messageSoumission = err.error?.error || 'Erreur lors de la soumission';
        setTimeout(() => this.messageSoumission = '', 5000);
      }
    });
  }

  chargerDemandes() {
    this.http.get<any[]>(
      'http://localhost:8000/api/demandes/',
      this.getHeaders()
    ).subscribe({
      next: (data) => {
        this.mesDemandes = data;
        this.stats[3].value = data.length;
        let totalDocs = 0;
        data.forEach(d => totalDocs += d.nb_fichiers || 0);
        this.stats[2].value = totalDocs;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur chargement demandes:', err)
    });
  }

  voirDocuments(demande: any) {
    if (!demande.nb_fichiers || demande.nb_fichiers === 0) {
      alert('Aucun document disponible pour cette demande');
      return;
    }
    
    this.http.get(
      `http://localhost:8000/api/demandes/${demande.id}/documents/`,
      this.getHeaders()
    ).subscribe({
      next: (response: any) => {
        if (response.documents && response.documents.length > 0) {
          const baseUrl = 'http://localhost:8000';
          window.open(baseUrl + response.documents[0].url, '_blank');
        } else {
          alert('Aucun document disponible pour cette demande');
        }
      },
      error: (err) => {
        console.error('Erreur consultation documents', err);
        alert('Erreur lors de la consultation des documents');
      }
    });
  }
}