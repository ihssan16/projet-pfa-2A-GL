import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';

// Admin Système
import { DashboardComponent as AdminSystemeDashboard } from './admin-systeme/dashboard/dashboard';
import { HistoriqueComponent } from './admin-systeme/dashboard/historique/historique';
import { GestionUtilisateursComponent } from './admin-systeme/gestion-utilisateurs/gestion-utilisateurs';
import { DemandesInscriptionComponent } from './admin-systeme/demandes-inscription/demandes-inscription';

// Admin Métier
import { DashboardComponent as AdminMetierDashboard } from './admin-metier/dashboard/dashboard';
import { DossiersComponent } from './admin-metier/dossiers/dossiers';
import { InscriptionEcoleComponent } from './admin-metier/inscription-ecole/inscription-ecole';

// École
import { DashboardComponentEcole as EcoleDashboard } from './ecole/dashboard/dashboard';
import { DocumentsComponent } from './ecole/documents/documents';
import { GestionElevesComponent } from './ecole/gestion-eleves/gestion-eleves';

// Ministère
import { DashboardComponent as MinistereDashboard } from './ministere/dashboard/dashboard';

// Parent / Étudiant
import { DashboardComponent as ParentDashboard } from './parent/dashboard/dashboard';
import { NotesComponent } from './parent/notes/notes';
import { EmploiTempsComponent } from './parent/emploi-temps/emploi-temps'; // <-- AJOUT DE L'IMPORT

// Authentification
import { AuthentificationComponent } from './authentification/authentification';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'authentification', component: AuthentificationComponent },
  
  // Admin Système
  { path: 'admin-systeme', component: AdminSystemeDashboard },
  { path: 'admin-systeme/utilisateurs', component: GestionUtilisateursComponent },
  { path: 'admin-systeme/historique', component: HistoriqueComponent },
  { path: 'admin-systeme/demandes-inscription', component: DemandesInscriptionComponent },
  
  // Admin Métier
  { path: 'admin-metier', component: AdminMetierDashboard },
  { path: 'admin-metier/dossiers', component: DossiersComponent },
  { path: 'admin-metier/dossiers/:id', component: DossiersComponent },
  { path: 'admin-metier/inscription-ecole', component: InscriptionEcoleComponent },
  
  // École
  { path: 'ecole', component: EcoleDashboard },
  { path: 'ecole/documents', component: DocumentsComponent },
  { path: 'ecole/eleves', component: GestionElevesComponent },
  
  // Ministère
  { path: 'ministere', component: MinistereDashboard },
  
  // Parent / Étudiant
  { path: 'parent', component: ParentDashboard },
  { path: 'parent/notes', component: NotesComponent },
  { path: 'parent/emploi-temps', component: EmploiTempsComponent }, 
];