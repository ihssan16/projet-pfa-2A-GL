import uuid
import random
from django.db import models
from django.contrib.auth.models import AbstractUser

def note_aleatoire():
    return random.randint(40, 100)

class Utilisateur(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN_SYS', 'Admin Système'),
        ('ADMIN_METIER', 'Admin Métier'),
        ('ECOLE', 'École Privée'),
        ('MINISTERE', 'Ministère de Tutelle'),
        ('ETUDIANT', 'Parent / Étudiant'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='ETUDIANT')
    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    def __str__(self):
        return f"{self.email} - {self.get_role_display()}"


class Ecole(models.Model):
    utilisateur = models.OneToOneField(Utilisateur, on_delete=models.CASCADE, related_name='profil_ecole', null=True, blank=True)
    
    nom = models.CharField(max_length=255)
    ville = models.CharField(max_length=100, blank=True, null=True)
    niveaux = models.CharField(max_length=100, blank=True, null=True) 
    capacite_eleves = models.IntegerField(default=0)
    est_demande_inscription = models.BooleanField(default=False)
    
    STATUT_INSCRIPTION_CHOICES = (
        ('EN_ATTENTE_ADMIN', 'En attente Admin Métier'),
        ('VALIDE_ADMIN', 'Validé par Admin Métier'),
        ('VALIDE_MINISTERE', 'Validé par Ministère'),
        ('ACTIVE', 'Active'),
        ('REFUSEE', 'Refusée'),
    )
    
    statut_inscription = models.CharField(max_length=30, choices=STATUT_INSCRIPTION_CHOICES, default='EN_ATTENTE_ADMIN')
    
    date_demande = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    date_validation_admin = models.DateTimeField(null=True, blank=True)
    date_validation_ministere = models.DateTimeField(null=True, blank=True)
    date_creation = models.DateTimeField(null=True, blank=True)
    
    document_autorisation = models.FileField(upload_to='ecoles/documents/', null=True, blank=True)
    document_identite = models.FileField(upload_to='ecoles/documents/', null=True, blank=True)
    document_justificatif = models.FileField(upload_to='ecoles/documents/', null=True, blank=True)
    
    email_contact = models.EmailField(null=True, blank=True)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    site_web = models.URLField(blank=True, null=True)
    
    def __str__(self):
        return self.nom


class Etudiant(models.Model):
    utilisateur = models.OneToOneField(Utilisateur, on_delete=models.CASCADE, related_name='profil_etudiant', null=True, blank=True)
    ecole = models.ForeignKey(Ecole, on_delete=models.CASCADE, related_name='etudiants', null=True)
    
    niveau = models.CharField(max_length=50, blank=True, null=True) 
    genre = models.CharField(max_length=20, blank=True, null=True)
    education_parent = models.CharField(max_length=100, blank=True, null=True) 
    lunch_plan = models.CharField(max_length=50, blank=True, null=True)
    
    note_math = models.IntegerField(default=0)
    note_lecture = models.IntegerField(default=0)
    note_ecriture = models.IntegerField(default=0)
    note_physique = models.IntegerField(default=note_aleatoire)
    note_anglais = models.IntegerField(default=note_aleatoire)
    note_histoire = models.IntegerField(default=note_aleatoire)
    note_informatique = models.IntegerField(default=note_aleatoire)

    def __str__(self):
        return f"Étudiant ({self.niveau}) - Math: {self.note_math}"


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
    
    ecole = models.ForeignKey(Ecole, on_delete=models.CASCADE, related_name='demandes')
    utilisateur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name='demandes')
    
    type_demande = models.CharField(max_length=20, choices=TYPE_CHOICES, default='INSCRIPTION')
    statut = models.CharField(max_length=30, choices=STATUT_CHOICES, default='EN_ATTENTE')
    
    date_depot = models.DateTimeField(auto_now_add=True)
    date_traitement_admin = models.DateTimeField(null=True, blank=True)
    date_traitement_ministere = models.DateTimeField(null=True, blank=True)
    
    nombre_fichiers = models.IntegerField(default=0)
    
    commentaire_admin = models.TextField(blank=True, null=True)
    commentaire_ministere = models.TextField(blank=True, null=True)
    
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


class DocumentDemande(models.Model):
    demande = models.ForeignKey(Demande, on_delete=models.CASCADE, related_name='fichiers_joints')
    fichier = models.FileField(upload_to='demandes/fichiers/')
    date_ajout = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Document pour {self.demande.reference}"