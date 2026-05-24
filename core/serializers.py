from rest_framework import serializers
from .models import Utilisateur

class UtilisateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Utilisateur
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'is_active']

class CreerUtilisateurSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    class Meta:
        model = Utilisateur
        fields = ['email', 'first_name', 'last_name', 'role', 'password']
    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data['username'] = validated_data['email']
        user = Utilisateur(**validated_data)
        user.set_password(password)
        user.save()
        return user

class ProfilSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    class Meta:
        model = Utilisateur
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'role_display', 'is_active']