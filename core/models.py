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
    utilisateur = models.OneToOneField(Utilisateur, on_delete=models.CASCADE, related_name='profil_etudiant', null=True, blank=True)

    ecole = models.ForeignKey(Ecole, on_delete=models.CASCADE, related_name='etudiants', null=True)
    genre = models.CharField(max_length=20, blank=True, null=True)

    education_parent = models.CharField(max_length=100, blank=True, null=True) 
    lunch_plan = models.CharField(max_length=50, blank=True, null=True)
    
    # Notes des examens
    note_math = models.IntegerField(default=0)
    note_lecture = models.IntegerField(default=0)
    note_ecriture = models.IntegerField(default=0)

    def __str__(self):
        return f"Étudiant ({self.genre}) - Math: {self.note_math}"
    
    # Ajouter à la fin de votre models.py

class Demande(models.Model):
    TYPE_CHOICES = (
        ('INSCRIPTION', 'Inscription'),
        ('RENOUVELLEMENT', 'Renouvellement'),
        ('MODIFICATION', 'Modification'),
        ('TRANSFERT', 'Transfert'),
    )
    
    STATUT_CHOICES = (
        ('EN_ATTENTE', 'En attente'),
        ('EN_COURS', 'En cours de traitement'),
        ('VALIDE_ADMIN', 'Validé par Admin Métier'),
        ('VALIDE_MINISTERE', 'Validé par Ministère'),
        ('REFUSE', 'Refusé'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference = models.CharField(max_length=50, unique=True, blank=True)
    
    # Relations
    ecole = models.ForeignKey(Ecole, on_delete=models.CASCADE, related_name='demandes')
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name='demandes')
    
    # Informations
    type_demande = models.CharField(max_length=20, choices=TYPE_CHOICES, default='INSCRIPTION')
    statut = models.CharField(max_length=30, choices=STATUT_CHOICES, default='EN_ATTENTE')
    
    # Dates
    date_depot = models.DateTimeField(auto_now_add=True)
    date_traitement_admin = models.DateTimeField(null=True, blank=True)
    date_traitement_ministere = models.DateTimeField(null=True, blank=True)
    
    # Documents
    documents = models.FileField(upload_to='demandes/', null=True, blank=True)
    nombre_fichiers = models.IntegerField(default=0)
    
    # Commentaires
    commentaire_admin = models.TextField(blank=True, null=True)
    commentaire_ministere = models.TextField(blank=True, null=True)
    
    # Traitement par
    traite_par_admin = models.ForeignKey(Utilisateur, on_delete=models.SET_NULL, null=True, blank=True, related_name='demandes_traitees_admin')
    traite_par_ministere = models.ForeignKey(Utilisateur, on_delete=models.SET_NULL, null=True, blank=True, related_name='demandes_traitees_ministere')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date_depot']
    
    def save(self, *args, **kwargs):
        if not self.reference:
            from datetime import datetime
            annee = datetime.now().year
            count = Demande.objects.filter(date_depot__year=annee).count() + 1
            self.reference = f"DOS-{annee}-{str(count).zfill(4)}"
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.reference} - {self.ecole.nom} - {self.get_statut_display()}"
    