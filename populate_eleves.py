import os
import django
import random
from django.db import transaction

# Initialisation
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from core.models import Ecole, Etudiant 

User = get_user_model()

# --- DONNÉES ---
prenoms_m = ['Youssef', 'Omar', 'Amine', 'Hamza', 'Anas', 'Mehdi', 'Saad', 'Marouane', 'Rayane', 'Sami', 'Ilyas', 'Bilal']
prenoms_f = ['Lina', 'Malak', 'Nour', 'Salma', 'Ghita', 'Hafsa', 'Kenza', 'Rania', 'Yasmin', 'Ines', 'Aya', 'Rim']
noms = ['Alami', 'Bennani', 'El Idrissi', 'Mansouri', 'Tazi', 'Chraïbi', 'Benjelloun', 'Amrani', 'Alaoui', 'Aït Saïd', 'Belkhayat', 'Jouahri', 'Berrada', 'Guessous']

classes_maternelle = ['Petite Section', 'Moyenne Section', 'Grande Section']
classes_primaire = ['1ère AP (CP)', '2ème AP (CE1)', '3ème AP (CE2)', '4ème AP (CM1)', '5ème AP (CM2)', '6ème AP']
classes_college = ['1ère Année Collège', '2ème Année Collège', '3ème Année Collège']
classes_lycee = ['Tronc Commun Sciences', 'Tronc Commun Lettres', '1ère Bac Sciences Exp', '1ère Bac Sc Maths', '1ère Bac Éco', '2ème Bac PC', '2ème Bac SVT', '2ème Bac Sc Maths']

def populer_base_donnees():
    print("🧹 Nettoyage des anciens élèves...")
    User.objects.filter(role='ETUDIANT').delete()
    
    ecoles = Ecole.objects.all() # Traite TOUTES les écoles
    print(f"🚀 Début de la population pour {ecoles.count()} écoles...")

    with transaction.atomic():
        for ecole in ecoles:
            classes_autorisees = []
            niveau_db = str(ecole.niveaux).lower() if ecole.niveaux else ""

            if 'elementary' in niveau_db: classes_autorisees.extend(classes_maternelle + classes_primaire)
            if 'middle' in niveau_db: classes_autorisees.extend(classes_college)
            if 'high' in niveau_db: classes_autorisees.extend(classes_lycee)
            if not classes_autorisees: classes_autorisees = classes_maternelle + classes_primaire + classes_college + classes_lycee

            total_ecole = 0
            for classe_actuelle in classes_autorisees:
                nb_eleves_classe = random.randint(10, 15)
                
                for _ in range(nb_eleves_classe):
                    genre_choisi = random.choice(['M', 'F'])
                    prenom = random.choice(prenoms_m) if genre_choisi == 'M' else random.choice(prenoms_f)
                    nom = random.choice(noms)
                    
                    # Génération email unique
                    email = f"{prenom.lower()}.{nom.lower()}.{random.randint(1000, 99999)}@student.ma"
                    
                    user = User.objects.create_user(
                        username=email, email=email, password='password123', 
                        first_name=prenom, last_name=nom, role='ETUDIANT'
                    )

                    Etudiant.objects.create(
                        utilisateur=user, ecole=ecole, niveau=classe_actuelle, 
                        genre=genre_choisi,
                        lunch_plan=random.choice(['Standard', 'Gratuit/Réduit']),
                        education_parent=random.choice(["Baccalauréat", "Licence", "Master", "Doctorat"]),
                        note_math=random.randint(40, 100), note_lecture=random.randint(40, 100),
                        note_ecriture=random.randint(40, 100), note_physique=random.randint(40, 100),
                        note_anglais=random.randint(40, 100), note_histoire=random.randint(40, 100),
                        note_informatique=random.randint(40, 100)
                    )
                    total_ecole += 1
            
            ecole.capacite_eleves = total_ecole
            ecole.save()
            print(f"✅ {ecole.nom} : {total_ecole} élèves.")

    print("\n==================================================")
    print("✅ SUCCÈS TOTAL : Base de données parfaitement générée.")
    print("==================================================")

if __name__ == '__main__':
    populer_base_donnees()