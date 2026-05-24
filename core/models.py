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