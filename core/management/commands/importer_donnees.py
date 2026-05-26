import csv
import os
import random
from django.core.management.base import BaseCommand
from django.db import transaction
from core.models import Ecole, Etudiant, Utilisateur 

class Command(BaseCommand):
    help = 'Importe les données depuis les fichiers CSV Kaggle (Écoles et Étudiants)'

    def handle(self, *args, **kwargs):
        chemin_dossier_data = os.path.join(os.getcwd(), 'data')
        chemin_ecoles = os.path.join(chemin_dossier_data, 'ecoles.csv')
        chemin_etudiants = os.path.join(chemin_dossier_data, 'etudiants.csv')

        self.stdout.write(self.style.WARNING('Démarrage de l\'importation...'))

        # Utilisation de transaction.atomic pour protéger la base de données
        with transaction.atomic():
            # ==============================================================
            # 1. IMPORTATION DES ÉCOLES
            # ==============================================================
            if os.path.exists(chemin_ecoles):
                self.stdout.write('➡️ Lecture du fichier des écoles...')
                with open(chemin_ecoles, newline='', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    ecoles_creees = []
                    
                    for row in reader:
                        nom_ecole = row.get('SCH_NAME', row.get('School Name', 'École Inconnue'))
                        ville = row.get('LCITY', row.get('City', 'Casablanca'))
                        niveau = row.get('SCHOOL_LEV', row.get('School Level', 'Mixte'))

                        ecole = Ecole(
                            nom=nom_ecole,
                            ville=ville,
                            niveaux=niveau,
                            capacite_eleves=random.randint(100, 1000) 
                        )
                        ecoles_creees.append(ecole)
                        
                        # On limite à 50 écoles pour ne pas surcharger notre dashboard de test
                        if len(ecoles_creees) >= 50:
                            break
                    
                    Ecole.objects.bulk_create(ecoles_creees)
                    self.stdout.write(self.style.SUCCESS(f' {len(ecoles_creees)} Écoles importées avec succès !'))
            else:
                self.stdout.write(self.style.ERROR(f' Fichier introuvable : {chemin_ecoles}'))

            # ==============================================================
            # 2. IMPORTATION DES ÉTUDIANTS (Et liaison avec les écoles)
            # ==============================================================
            if os.path.exists(chemin_etudiants):
                self.stdout.write('➡️ Lecture du fichier des étudiants...')
                
                # On récupère toutes les écoles qu'on vient de créer pour leur attribuer des élèves
                toutes_les_ecoles = list(Ecole.objects.all())
                
                if not toutes_les_ecoles:
                    self.stdout.write(self.style.ERROR('❌ Impossible d\'importer les étudiants car aucune école n\'existe.'))
                    return

                with open(chemin_etudiants, newline='', encoding='utf-8') as f:
                    reader = csv.DictReader(f)
                    etudiants_crees = []
                    
                    for row in reader:
                        genre = row.get('gender', 'Inconnu')
                        education = row.get('parental level of education', 'Inconnu')
                        lunch = row.get('lunch', 'standard')
                        
                        math = int(row.get('math score', 0))
                        lecture = int(row.get('reading score', 0))
                        ecriture = int(row.get('writing score', 0))

                        # On choisit une école au hasard pour cet élève
                        ecole_aleatoire = random.choice(toutes_les_ecoles)

                        etudiant = Etudiant(
                            ecole=ecole_aleatoire,
                            genre=genre,
                            education_parent=education,
                            lunch_plan=lunch,
                            note_math=math,
                            note_lecture=lecture,
                            note_ecriture=ecriture
                        )
                        etudiants_crees.append(etudiant)
                    
                    # Insertion massive dans Neon.tech
                    Etudiant.objects.bulk_create(etudiants_crees)
                    self.stdout.write(self.style.SUCCESS(f' {len(etudiants_crees)} Étudiants importés avec succès !'))
            else:
                self.stdout.write(self.style.ERROR(f' Fichier introuvable : {chemin_etudiants}'))

        self.stdout.write(self.style.SUCCESS(' IMPORTATION TERMINÉE ! Vos bases Neon.tech sont remplies !'))