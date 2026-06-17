import os
import django
import random

# Initialisation de l'environnement Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from core.models import Ecole, Etudiant 

User = get_user_model()

# --- DONNÉES DE BASE ---
prenoms_m = ['Youssef', 'Omar', 'Amine', 'Hamza', 'Anas', 'Mehdi', 'Saad', 'Marouane', 'Rayane', 'Sami', 'Ilyas', 'Bilal']
prenoms_f = ['Lina', 'Malak', 'Nour', 'Salma', 'Ghita', 'Hafsa', 'Kenza', 'Rania', 'Yasmin', 'Ines', 'Aya', 'Rim']
noms = ['Alami', 'Bennani', 'El Idrissi', 'Mansouri', 'Tazi', 'Chraïbi', 'Benjelloun', 'Amrani', 'Alaoui', 'Aït Saïd', 'Belkhayat', 'Jouahri', 'Berrada', 'Guessous']

# --- NIVEAUX SCOLAIRES MAROCAINS ---
classes_maternelle = ['Petite Section', 'Moyenne Section', 'Grande Section']
classes_primaire = ['1ère AP (CP)', '2ème AP (CE1)', '3ème AP (CE2)', '4ème AP (CM1)', '5ème AP (CM2)', '6ème AP']
classes_college = ['1ère Année Collège', '2ème Année Collège', '3ème Année Collège']
classes_lycee = ['Tronc Commun Sciences', 'Tronc Commun Lettres', '1ère Bac Sciences Exp', '1ère Bac Sc Maths', '1ère Bac Éco', '2ème Bac PC', '2ème Bac SVT', '2ème Bac Sc Maths']

def populer_base_donnees():
    print("🧹 Nettoyage des anciens élèves de test...")
    User.objects.filter(role='ETUDIANT').delete()
    print("✅ Base de données nettoyée.\n")

    ecoles = Ecole.objects.all()[:10]
    
    if not ecoles.exists():
        print("❌ Aucune école trouvée.")
        return

    print(f"🚀 Début de la population pour {ecoles.count()} école(s)...")
    total_eleves_crees = 0

    for ecole in ecoles:
        classes_autorisees = []
        niveau_db = str(ecole.niveaux).lower() if ecole.niveaux else ""

        if 'elementary' in niveau_db:
            classes_autorisees.extend(classes_maternelle + classes_primaire)
        if 'middle' in niveau_db:
            classes_autorisees.extend(classes_college)
        if 'high' in niveau_db:
            classes_autorisees.extend(classes_lycee)

        if not classes_autorisees:
            classes_autorisees = classes_maternelle + classes_primaire + classes_college + classes_lycee

        print(f"\n🏫 {ecole.nom} ({ecole.niveaux}) :")
        total_ecole = 0

        for classe_actuelle in classes_autorisees:
            nb_eleves_classe = random.randint(10, 15)
            print(f"  ➔ Remplissage de la classe {classe_actuelle} avec {nb_eleves_classe} élèves...")
            
            for _ in range(nb_eleves_classe):
                genre_choisi = random.choice(['M', 'F'])
                prenom = random.choice(prenoms_m) if genre_choisi == 'M' else random.choice(prenoms_f)
                nom = random.choice(noms)
                
                email_base = f"{prenom.lower()}.{nom.lower()}.{random.randint(100, 9999)}@student.ma"
                email = email_base
                compteur = 10000
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
                    niveau=classe_actuelle, 
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
                total_ecole += 1
                total_eleves_crees += 1
        
        ecole.capacite_eleves = total_ecole
        ecole.save()
        print(f"  ✅ {ecole.nom} finalisée (Capacité ajustée à {total_ecole} élèves).")

    print("\n==================================================")
    print(f"✅ SUCCÈS : {total_eleves_crees} élèves créés avec une précision chirurgicale !")
    print("Moyenne garantie : Entre 10 et 15 élèves pour chaque classe.")
    print("🔑 Mot de passe commun : password123")
    print("==================================================")

if __name__ == '__main__':
    populer_base_donnees()