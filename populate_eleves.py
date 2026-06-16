import os
import django
import random

# Initialisation de l'environnement Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from core.models import Ecole, Etudiant 

User = get_user_model()

prenoms_m = ['Youssef', 'Omar', 'Amine', 'Hamza', 'Anas', 'Mehdi', 'Saad', 'Marouane', 'Rayane', 'Sami']
prenoms_f = ['Lina', 'Malak', 'Nour', 'Salma', 'Ghita', 'Hafsa', 'Kenza', 'Rania', 'Yasmin', 'Ines']
noms = ['Alami', 'Bennani', 'El Idrissi', 'Mansouri', 'Tazi', 'Chraïbi', 'Benjelloun', 'Amrani', 'Alaoui', 'Aït Saïd', 'Belkhayat', 'Jouahri']

classes_disponibles = [
    '1ère année Collège A', 
    '1ère année Collège B', 
    '2ème année Collège A', 
    '3ème année Collège B', 
    'Tronc Commun Sciences A', 
    '1ère Bac Sciences Maths', 
    '2ème Bac Sciences Physiques'
]

def populer_base_donnees():
    ecoles = Ecole.objects.all()
    
    if not ecoles.exists():
        print("Aucune école trouvée dans la base de données Neon.")
        return

    print(f"Début de la population pour {ecoles.count()} école(s)...")
    total_eleves_crees = 0

    for ecole in ecoles:
        nombre_eleves = random.randint(15, 25)
        print(f"{ecole.nom} : Création de {nombre_eleves} élèves en cours...")

        for _ in range(nombre_eleves):
            genre_choisi = random.choice(['M', 'F'])
            prenom = random.choice(prenoms_m) if genre_choisi == 'M' else random.choice(prenoms_f)
            nom = random.choice(noms)
            
            email_base = f"{prenom.lower()}.{nom.lower()}.{random.randint(10, 99)}@student.ma"
            email = email_base
            compteur = 100
            while User.objects.filter(email=email).exists():
                email = f"{prenom.lower()}.{nom.lower()}.{compteur}@student.ma"
                compteur += 1

            user = User.objects.create(
                username=email,
                email=email,
                first_name=prenom,
                last_name=nom,
                role='ETUDIANT',
                is_active=True
            )
            user.set_password('password123')
            user.save()

            Etudiant.objects.create(
                utilisateur=user,
                ecole=ecole,
                niveau=random.choice(classes_disponibles),
                genre=genre_choisi,
                lunch_plan=random.choice(['Standard', 'Gratuit/Réduit']),
                education_parent=random.choice(["Baccalauréat", "Licence", "Master", "Doctorat"]),
                note_math=random.randint(40, 100),
                note_lecture=random.randint(40, 100),
                note_ecriture=random.randint(40, 100),
                note_physique=random.randint(40, 100),
                note_anglais=random.randint(40, 100),
                note_histoire=random.randint(40, 100),
                note_informatique=random.randint(40, 100)
            )
            total_eleves_crees += 1

    print("==================================================")
    print(f"SUCCÈS : {total_eleves_crees} élèves ont été créés et envoyés sur Neon !")
    print("Mot de passe commun : password123")
    print("==================================================")

if __name__ == '__main__':
    populer_base_donnees()