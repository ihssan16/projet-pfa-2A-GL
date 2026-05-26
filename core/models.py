import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

class Utilisateur(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN_SYS', 'Admin Système'),
        ('ADMIN_METIER', 'Admin Métier'),
        ('ECOLE', 'École Privée'),
        ('MINISTERE', 'Ministère de Tutelle'),
        ('ETUDIANT', 'Parent / Étudiant'),
    )

    # Remplacement de l'ID classique par un UUID pour plus de sécurité
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Ajout du rôle
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='ETUDIANT')
    
    # Dans une appli SaaS moderne, on se connecte souvent avec l'email, pas avec un pseudo
    email = models.EmailField(unique=True)

    # On indique à Django d'utiliser l'email comme identifiant de connexion principal
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return f"{self.email} - {self.get_role_display()}"
    

class Ecole(models.Model):
    # On relie cette école à un compte utilisateur de type "ECOLE"
    utilisateur = models.OneToOneField(Utilisateur, on_delete=models.CASCADE, related_name='profil_ecole', null=True, blank=True)
    
    # Données venant du dataset Public_School_Characteristics
    nom = models.CharField(max_length=255)
    ville = models.CharField(max_length=100, blank=True, null=True)
    niveaux = models.CharField(max_length=100, blank=True, null=True) 
    
    # On peut garder quelques stats basiques
    capacite_eleves = models.IntegerField(default=0)
    
    def __str__(self):
        return self.nom

class Etudiant(models.Model):
    # On relie l'étudiant à son école
    ecole = models.ForeignKey(Ecole, on_delete=models.CASCADE, related_name='etudiants', null=True)
    
    # Données venant du dataset StudentsPerformance
    genre = models.CharField(max_length=20, blank=True, null=True)
    education_parent = models.CharField(max_length=100, blank=True, null=True) # parental level of education
    lunch_plan = models.CharField(max_length=50, blank=True, null=True)
    
    # Notes des examens
    note_math = models.IntegerField(default=0)
    note_lecture = models.IntegerField(default=0)
    note_ecriture = models.IntegerField(default=0)

    def __str__(self):
        return f"Étudiant ({self.genre}) - Math: {self.note_math}"