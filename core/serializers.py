from rest_framework import serializers
from .models import Utilisateur, Ecole, Etudiant

class UtilisateurSerializer(serializers.ModelSerializer):
    ecole_nom = serializers.SerializerMethodField()

    class Meta:
        model = Utilisateur
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'ecole_nom']

    def get_ecole_nom(self, obj):
        if hasattr(obj, 'profil_ecole') and obj.profil_ecole:
            return obj.profil_ecole.nom
        return None

class CreerUtilisateurSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    
    ecole_nom = serializers.CharField(write_only=True, required=False, allow_blank=True)
    ecole_ville = serializers.CharField(write_only=True, required=False, allow_blank=True)
    ecole_niveaux = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = Utilisateur
        fields = ['email', 'first_name', 'last_name', 'role', 'password', 'ecole_nom', 'ecole_ville', 'ecole_niveaux']

    def create(self, validated_data):
        ecole_nom = validated_data.pop('ecole_nom', None)
        ecole_ville = validated_data.pop('ecole_ville', None)
        ecole_niveaux = validated_data.pop('ecole_niveaux', None)
        
        password = validated_data.pop('password')
        validated_data['username'] = validated_data['email']
        
        user = Utilisateur(**validated_data)
        user.set_password(password)
        user.save()

        if user.role == 'ECOLE' and ecole_nom:
            Ecole.objects.create(
                utilisateur=user,
                nom=ecole_nom,
                ville=ecole_ville,
                niveaux=ecole_niveaux,
                capacite_eleves=0 
            )

        return user


class ProfilSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    class Meta:
        model = Utilisateur
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'role_display', 'is_active']


class EcoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ecole
        fields = '__all__'  


class EtudiantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Etudiant
        fields = '__all__'