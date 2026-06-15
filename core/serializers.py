from rest_framework import serializers
from .models import Utilisateur, Ecole, Etudiant

class UtilisateurSerializer(serializers.ModelSerializer):
    ecole_nom = serializers.SerializerMethodField()

    class Meta:
        model = Utilisateur
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'last_login', 'ecole_nom']

    def get_ecole_nom(self, obj):
        if hasattr(obj, 'profil_ecole') and obj.profil_ecole:
            return obj.profil_ecole.nom
        if hasattr(obj, 'profil_etudiant') and obj.profil_etudiant and obj.profil_etudiant.ecole:
            return obj.profil_etudiant.ecole.nom
        return None


class CreerUtilisateurSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    
    ecole_nom = serializers.CharField(write_only=True, required=False, allow_blank=True)
    ecole_ville = serializers.CharField(write_only=True, required=False, allow_blank=True)
    ecole_niveaux = serializers.CharField(write_only=True, required=False, allow_blank=True)
    ecole_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    etudiant_niveau = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Utilisateur
        fields = ['email', 'first_name', 'last_name', 'role', 'password', 'ecole_nom', 'ecole_ville', 'ecole_niveaux', 'ecole_id', 'etudiant_niveau']

    def create(self, validated_data):
        ecole_nom = validated_data.pop('ecole_nom', None)
        ecole_ville = validated_data.pop('ecole_ville', None)
        ecole_niveaux = validated_data.pop('ecole_niveaux', None)
        ecole_id = validated_data.pop('ecole_id', None)
        
        etudiant_niveau = validated_data.pop('etudiant_niveau', '')
        
        password = validated_data.pop('password')
        validated_data['username'] = validated_data['email']
        
        user = Utilisateur(**validated_data)
        user.set_password(password)
        user.save()

        request = self.context.get('request')

        if user.role == 'ECOLE' and ecole_nom:
            Ecole.objects.create(utilisateur=user, nom=ecole_nom, ville=ecole_ville, niveaux=ecole_niveaux)
            
        elif user.role == 'ETUDIANT':
            if request and hasattr(request.user, 'profil_ecole') and request.user.profil_ecole:
                Etudiant.objects.create(
                    utilisateur=user, 
                    ecole=request.user.profil_ecole, 
                    niveau=etudiant_niveau
                )
            
            elif ecole_id:
                try:
                    ecole = Ecole.objects.get(id=ecole_id)
                    # ⚡ On sauvegarde le niveau ici aussi au cas où
                    Etudiant.objects.create(utilisateur=user, ecole=ecole, niveau=etudiant_niveau)
                except Ecole.DoesNotExist:
                    pass

        return user
    
    
class ProfilSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    ecole_nom = serializers.SerializerMethodField()
    ecole_ville = serializers.SerializerMethodField()
    ecole_niveaux = serializers.SerializerMethodField()
    
    ecole_capacite = serializers.SerializerMethodField()
    nombre_etudiants = serializers.SerializerMethodField()

    profil_etudiant = serializers.SerializerMethodField()

    class Meta:
        model = Utilisateur
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'role_display', 'is_active', 
                  'ecole_nom', 'ecole_ville', 'ecole_niveaux', 'ecole_capacite', 'nombre_etudiants',
                  'profil_etudiant'] 

    def get_ecole_nom(self, obj):
        if hasattr(obj, 'profil_ecole') and obj.profil_ecole: 
            return obj.profil_ecole.nom
        if hasattr(obj, 'profil_etudiant') and obj.profil_etudiant and obj.profil_etudiant.ecole:
            return obj.profil_etudiant.ecole.nom
        return None

    def get_ecole_ville(self, obj):
        if hasattr(obj, 'profil_ecole') and obj.profil_ecole: 
            return obj.profil_ecole.ville
        if hasattr(obj, 'profil_etudiant') and obj.profil_etudiant and obj.profil_etudiant.ecole:
            return obj.profil_etudiant.ecole.ville
        return None

    def get_ecole_niveaux(self, obj):
        if hasattr(obj, 'profil_ecole') and obj.profil_ecole: return obj.profil_ecole.niveaux
        return None

    def get_ecole_capacite(self, obj):
        if hasattr(obj, 'profil_ecole') and obj.profil_ecole:
            return obj.profil_ecole.capacite_eleves
        return 0

    def get_nombre_etudiants(self, obj):
        if hasattr(obj, 'profil_ecole') and obj.profil_ecole:
            return obj.profil_ecole.etudiants.count()
        return 0

    def get_profil_etudiant(self, obj):
        if hasattr(obj, 'profil_etudiant') and obj.profil_etudiant:
            etudiant = obj.profil_etudiant
            
            math20 = (etudiant.note_math or 0) / 5
            lecture20 = (etudiant.note_lecture or 0) / 5
            ecriture20 = (etudiant.note_ecriture or 0) / 5
            moyenne = ((math20 * 4) + (lecture20 * 3) + (ecriture20 * 3)) / 10
            
            rang = 1
            total_eleves = 1
            
            if etudiant.ecole and etudiant.niveau:
                camarades = Etudiant.objects.filter(ecole=etudiant.ecole, niveau=etudiant.niveau)
                total_eleves = camarades.count()
                
                for c in camarades:
                    c_math = (c.note_math or 0) / 5
                    c_lec = (c.note_lecture or 0) / 5
                    c_ecr = (c.note_ecriture or 0) / 5
                    c_moy = ((c_math * 4) + (c_lec * 3) + (c_ecr * 3)) / 10
                    
                    if c_moy > moyenne:
                        rang += 1

            return {
                "ecole": {
                    "nom": etudiant.ecole.nom if etudiant.ecole else None
                },
                "niveau": getattr(etudiant, 'niveau', 'Non assigné'),
                "note_math": etudiant.note_math,
                "note_lecture": etudiant.note_lecture,
                "note_ecriture": etudiant.note_ecriture,
                "moyenne": round(moyenne, 1),
                "rang": rang,
                "total_eleves": total_eleves
            }
        return None

class EcoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ecole
        fields = '__all__'  


class EtudiantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Etudiant
        fields = '__all__'