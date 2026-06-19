import { Component, afterNextRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; 
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-demandes-inscription',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], 
  templateUrl: './demandes-inscription.html',
  styleUrls: ['./demandes-inscription.css']
})
export class DemandesInscriptionComponent {
  
  demandes: any[] = [];
  chargement = true;

  showCreationModal = false;
  demandeEnCours: any = null;
  formCreation = {
    email: '',
    password: '',
    contact_nom: '',
    contact_prenom: '',
    niveau: '',
    genre: '',
    lunch_plan: ''
  };

  // =========================================
  // --- VARIABLES DE PAGINATION ---
  // =========================================
  pageActuelle: number = 1;
  taillePage: number = 5; // Nombre de demandes par page

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef 
  ) {
    afterNextRender(() => {
      this.chargerDemandes();
    });
  }

  // =========================================
  // --- GETTERS POUR LA PAGINATION ---
  // =========================================
  get demandesPaginees() {
    const debut = (this.pageActuelle - 1) * this.taillePage;
    return this.demandes.slice(debut, debut + this.taillePage);
  }

  get totalPages() {
    return Math.ceil(this.demandes.length / this.taillePage) || 1;
  }

  changerPage(delta: number) {
    this.pageActuelle += delta;
  }

  chargerDemandes() {
    this.chargement = true;
    this.demandes = []; 
    this.pageActuelle = 1; // Réinitialise la page au chargement

    this.http.get<any[]>('http://localhost:8000/api/ecoles-inscription/', this.authService['getHeaders']()).subscribe({
      next: (data) => {
        const ecoles = data.map(d => ({
          ...d,
          _typeLigne: 'ECOLE',
          _titre: d.nom,
          _sousTitre: `Capacité: ${d.capacite_eleves} élèves`,
          _details: d.niveaux,
          _date: d.date_demande || d.date_validation_admin,
          est_cree: d.statut ? d.statut.toLowerCase().includes('activ') : false
        }));
        this.integrerDemandes(ecoles);
      },
      error: (err) => {
        console.error('Erreur chargement écoles', err);
        this.chargement = false;
        this.cdr.detectChanges();
      }
    });

    this.http.get<any[]>('http://localhost:8000/api/demandes/', this.authService['getHeaders']()).subscribe({
      next: (data) => {
        const dossiers = data.map(d => {
          const typeDemande = d.type || 'Inscription'; 
          const typeLigne = typeDemande.toLowerCase() === 'inscription' ? 'DOSSIER_ELEVE' : 'DOSSIER_AUTRE';
          
          return {
            ...d,
            _typeLigne: typeLigne,
            _titre: d.reference,
            _sousTitre: d.etablissement,
            _details: typeDemande,
            _date: d.date_depot,
            est_cree: d.statut ? d.statut.toLowerCase().includes('activ') : false
          };
        });
        this.integrerDemandes(dossiers);
      },
      error: (err) => {
        console.error('Erreur chargement dossiers', err);
        this.chargement = false;
        this.cdr.detectChanges();
      }
    });
  }

  private integrerDemandes(nouvellesDonnees: any[]) {
    this.demandes = [...this.demandes, ...nouvellesDonnees].sort((a, b) => {
      const dateA = a._date ? new Date(a._date).getTime() : 0;
      const dateB = b._date ? new Date(b._date).getTime() : 0;
      return dateB - dateA;
    });
    this.chargement = false;
    this.cdr.detectChanges(); 
  }

  voirDetails(demande: any) {
    if (demande._typeLigne === 'ECOLE') {
      alert(`📋 Détails de l'École\n🏫 Nom: ${demande.nom}\n📍 Ville: ${demande.ville}\n📚 Niveaux: ${demande.niveaux}\n👨‍👩‍👧‍👦 Capacité: ${demande.capacite_eleves} élèves\n📧 Email: ${demande.email_contact || 'Non renseigné'}\n📞 Téléphone: ${demande.telephone || 'Non renseigné'}\n🌐 Site web: ${demande.site_web || 'Non renseigné'}`);
    } else {
      alert(`📋 Détails du Dossier\n📄 Référence: ${demande.reference}\n🏫 Établissement: ${demande.etablissement}\n📍 Ville: ${demande.ville || 'Non spécifiée'}\n📂 Type: ${demande._details}\n📎 Fichiers joints: ${demande.nb_fichiers || 0}`);
    }
  }

  voirDocuments(demande: any) {
    if (demande._typeLigne === 'ECOLE') {
      const docs = [];
      if (demande.document_autorisation) docs.push(demande.document_autorisation);
      if (demande.document_identite) docs.push(demande.document_identite);
      if (demande.document_justificatif) docs.push(demande.document_justificatif);

      if (docs.length === 0) {
        alert("Aucun document n'a été attaché à cette demande d'école.");
        return;
      }
      docs.forEach(docUrl => window.open(docUrl.startsWith('http') ? docUrl : `http://localhost:8000${docUrl}`, '_blank'));
    } else {
      if (!demande.nb_fichiers || demande.nb_fichiers === 0) {
        alert('Aucun document disponible pour ce dossier.');
        return;
      }
      this.http.get<any>(`http://localhost:8000/api/demandes/${demande.id}/documents/`, this.authService['getHeaders']()).subscribe({
        next: (res: any) => {
          if (res.documents && res.documents.length > 0) {
            res.documents.forEach((doc: any) => window.open(`http://localhost:8000${doc.url}`, '_blank'));
          } else {
            alert('Les documents sont introuvables.');
          }
        },
        error: () => alert('Erreur de connexion lors de la récupération des documents.')
      });
    }
  }

  ouvrirModalCreation(demande: any) {
    this.demandeEnCours = demande;
    this.formCreation = {
      email: demande._typeLigne === 'ECOLE' ? (demande.email_contact || '') : '',
      password: this.genererMotDePasse(),
      contact_nom: '',
      contact_prenom: '',
      niveau: '',
      genre: '',
      lunch_plan: ''
    };
    this.showCreationModal = true;
  }

  fermerModalCreation() {
    this.showCreationModal = false;
    this.demandeEnCours = null;
  }

  genererMotDePasse(): string {
    return Math.random().toString(36).slice(-8); 
  }

  soumettreCreation() {
    if (!this.formCreation.email || this.formCreation.password.length < 6) {
      alert("Veuillez remplir un email valide et un mot de passe d'au moins 6 caractères.");
      return;
    }

    let payload: any = { 
      action: 'creer', 
      email: this.formCreation.email, 
      password: this.formCreation.password,
      nom: this.formCreation.contact_nom,
      prenom: this.formCreation.contact_prenom
    };

    if (this.demandeEnCours._typeLigne !== 'ECOLE') {
      if (!this.formCreation.niveau || !this.formCreation.genre || !this.formCreation.lunch_plan) {
        alert("Veuillez remplir tous les champs obligatoires (Niveau, Genre, Lunch Plan).");
        return;
      }
      payload.niveau = this.formCreation.niveau;
      payload.genre = this.formCreation.genre;
      payload.lunch_plan = this.formCreation.lunch_plan;
    }

    const endpoint = this.demandeEnCours._typeLigne === 'ECOLE' 
      ? `http://localhost:8000/api/ecoles-inscription/${this.demandeEnCours.id}/`
      : `http://localhost:8000/api/demandes/${this.demandeEnCours.id}/`;

    this.http.patch(endpoint, payload, this.authService['getHeaders']()).subscribe({
      next: (response: any) => {
        alert(`✅ ${response.message || 'Compte créé avec succès'}`);
        
        if (this.demandeEnCours) {
          this.demandeEnCours.est_cree = true;
          this.demandeEnCours.statut = 'Active';
        }
        
        this.fermerModalCreation();
      },
      error: (err) => {
        console.error('Erreur détaillée création:', err);
        alert(`❌ Erreur: ${err.error?.error || err.message || 'Veuillez réessayer'}`);
      }
    });
  }

  peutCreer(demande: any): boolean {
    const statut = demande.statut?.toLowerCase() || '';
    if (statut.includes('active') || demande.est_cree) {
      return false;
    }
    return demande._typeLigne === 'ECOLE' || demande._typeLigne === 'DOSSIER_ELEVE';
  }
}