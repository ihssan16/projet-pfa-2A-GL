# 📚 Plateforme de Gestion des Établissements Privés - PFA 2A GL

## 🎓 Contexte du Projet

Ce projet est développé dans le cadre du **Projet de Fin d'Année (PFA)** de 2ème année du cycle ingénieur à l'**École Nationale Supérieure d'Informatique et d'Analyse des Systèmes (ENSIAS) - Rabat**.

Face à la croissance du secteur de l'enseignement privé au Maroc et aux difficultés de gestion administrative et pédagogique, cette plateforme propose une solution centralisée sous forme de **SaaS (Software as a Service)**.

## 👥 Équipe

| Élève | Rôle |
|-------|------|
| **Hafsa HOUNAOUI** | Co-chef de projet / Développeuse |
| **Ihssan BEN LABSIR** | Co-chef de projet / Développeuse |

**Encadrant :** Monsieur Ahmed ETTALBI

## 🎯 Objectifs du Projet

- ✅ Digitaliser et centraliser les dossiers des établissements privés
- ✅ Automatiser le workflow de validation des dossiers par le Ministère
- ✅ Fournir des outils d'aide à la décision (statistiques, rapports PDF)
- ✅ Offrir un espace transparent pour les parents et étudiants
- ✅ Assurer une communication fluide entre tous les acteurs

## 👤 Acteurs du Système

| Acteur | Rôle |
|--------|------|
| **Admin Système** | Gestion technique : comptes, rôles, sécurité, logs d'audit |
| **Admin Métier** | Validation des dossiers, suivi fonctionnel, coordination |
| **École Privée** | Saisie des données, upload documents, suivi de dossier |
| **Ministère de Tutelle** | Supervision officielle, validation finale, rapports |
| **Parent / Étudiant** | Consultation : notes, bulletins, absences, calendrier |

## 🛠️ Stack Technologique

| Couche | Technologie | Rôle |
|--------|-------------|------|
| **Frontend** | Angular | SPA responsive, interfaces par rôle, consommation API REST |
| **Backend** | Django REST Framework | API REST, logique métier, authentification JWT, RBAC |
| **Base de données** | PostgreSQL | Persistance des données, 11 tables, contraintes d'intégrité |

## 📦 Modules Fonctionnels

### 1. Gestion des Utilisateurs (RBAC)
- Création et gestion centralisée des comptes
- Authentification sécurisée (JWT)
- Gestion des rôles et permissions
- Journalisation des actions (logs d'audit)

### 2. Données des Établissements
- Fiche complète par établissement
- Gestion des types d'enseignement
- Upload sécurisé de documents officiels
- Historique des modifications

### 3. Administration & Supervision
- Tableaux de bord techniques et fonctionnels
- Statistiques et indicateurs clés
- Génération de rapports exportables (PDF)
- Notifications et alertes

### 4. Workflow & Validation
- Soumission de dossiers par les écoles
- Validation/refus par Admin Métier ou Ministère
- Gestion des statuts (En attente, Validé, Refusé)
- Notifications automatiques

### 5. Espace Parent / Étudiant
- Tableau de bord personnel
- Consultation des notes et bulletins
- Suivi des absences
- Emploi du temps

## 🚀 Installation et Configuration

### Prérequis

```bash
# Vérifier les versions
python --version  # Python 3.8+
node --version    # Node.js 18+
npm --version     # npm 9+
