import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';

// Admin Système
import { DashboardComponent as AdminSystemeDashboard } from './admin-systeme/dashboard/dashboard';
//import { GestionUtilisateursComponent } from './admin-systeme/gestion-utilisateurs/gestion-utilisateurs';

// Admin Métier
import { DashboardComponent as AdminMetierDashboard } from './admin-metier/dashboard/dashboard';
import { DossiersComponent } from './admin-metier/dossiers/dossiers';

// École
import { DashboardComponent as EcoleDashboard } from './ecole/dashboard/dashboard';
import { DocumentsComponent } from './ecole/documents/documents';

// Ministère
import { DashboardComponent as MinistereDashboard } from './ministere/dashboard/dashboard';
import { RapportsComponent } from './ministere/rapports/rapports';

// Parent
import { DashboardComponent as ParentDashboard } from './parent/dashboard/dashboard';
import { NotesComponent } from './parent/notes/notes';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  
  // Admin Système
  { path: 'admin-systeme', component: AdminSystemeDashboard },
  // { path: 'admin-systeme/utilisateurs', component: GestionUtilisateursComponent },
  
  // Admin Métier
  { path: 'admin-metier', component: AdminMetierDashboard },
  { path: 'admin-metier/dossiers', component: DossiersComponent },
  
  // École
  { path: 'ecole', component: EcoleDashboard },
  { path: 'ecole/documents', component: DocumentsComponent },
  
  // Ministère
  { path: 'ministere', component: MinistereDashboard },
  { path: 'ministere/rapports', component: RapportsComponent },
  
  // Parent
  { path: 'parent', component: ParentDashboard },
  { path: 'parent/notes', component: NotesComponent },

  { path: 'admin-metier/dossiers/:id', component: DossiersComponent },
];
