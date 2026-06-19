import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Ecole, Enseignant

prenoms_m = ['Ahmed', 'Mohamed', 'Youssef', 'Amine', 'Anass', 'Karim', 'Saïd', 'Rachid', 'Omar', 'Mehdi', 'Hamza', 'Khalid']
prenoms_f = ['Fatima', 'Sanaa', 'Meriem', 'Layla', 'Nadia', 'Khadija', 'Imane', 'Salma', 'Hajar', 'Zineb', 'Asmae', 'Yasmine']
noms_famille = ['Benali', 'Alami', 'Idrissi', 'Tazi', 'Nouri', 'Chraibi', 'El Mansouri', 'Bourkia', 'Jabri', 'Zaidi', 'El Amrani', 'Bennani', 'Rami', 'Filali', 'Berrada', 'Seddiki', 'Tahiri', 'Kabbaj']

matieres = ['Mathématiques', 'Informatique', 'Sciences Physiques', 'Anglais', 'Histoire-Géo', 'Lecture', 'Écriture']

classes_maternelle = ['Petite Section', 'Moyenne Section', 'Grande Section']
classes_primaire = ['1ère AP (CP)', '2ème AP (CE1)', '3ème AP (CE2)', '4ème AP (CM1)', '5ème AP (CM2)', '6ème AP']
classes_college = ['1ère Année Collège', '2ème Année Collège', '3ème Année Collège']
classes_lycee = ['Tronc Commun Sciences', 'Tronc Commun Lettres', '1ère Bac Sciences Exp', '1ère Bac Sc Maths', '1ère Bac Éco', '2ème Bac PC', '2ème Bac SVT', '2ème Bac Sc Maths']

def populer_enseignants():
    print("🧹 Nettoyage UNIQUE de la table des enseignants (Enseignant)...")
    Enseignant.objects.all().delete()
    
    ecoles = Ecole.objects.all()
    print(f"🚀 Début de la génération des enseignants par niveau pour {ecoles.count()} écoles...")

    total_profs = 0

    for ecole in ecoles:
        classes_autorisees = []
        niveau_db = str(ecole.niveaux).lower() if ecole.niveaux else ""

        if 'elementary' in niveau_db: classes_autorisees.extend(classes_maternelle + classes_primaire)
        if 'middle' in niveau_db: classes_autorisees.extend(classes_college)
        if 'high' in niveau_db: classes_autorisees.extend(classes_lycee)
        if not classes_autorisees: classes_autorisees = classes_maternelle + classes_primaire + classes_college + classes_lycee

        for classe in classes_autorisees:
            for matiere in matieres:
                prenom = random.choice(prenoms_m) if random.choice([True, False]) else random.choice(prenoms_f)
                nom = random.choice(noms_famille)
                
                Enseignant.objects.create(
                    nom=nom,
                    prenom=prenom,
                    matiere=matiere,
                    ecole=ecole,
                    niveau=classe
                )
                total_profs += 1

    print("\n==================================================")
    print(f"✅ SUCCÈS : {total_profs} enseignants uniques créés par niveau.")
    print("==================================================")

if __name__ == '__main__':
    populer_enseignants()