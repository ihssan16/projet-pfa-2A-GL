from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Utilisateur, Ecole, Etudiant
from .serializers import UtilisateurSerializer, CreerUtilisateurSerializer, ProfilSerializer, EcoleSerializer, EtudiantSerializer
from rest_framework.permissions import BasePermission


from django.db.models import Count, Avg

class EstAdminSys(IsAuthenticated):
    def has_permission(self, request, view):
        return super().has_permission(request, view) and request.user.role == 'ADMIN_SYS'
    

class EstAdminOuEcole(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['ADMIN_SYS', 'ECOLE'])


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        password = request.data.get('password', '')
        try:
            user = Utilisateur.objects.get(email=email)
        except Utilisateur.DoesNotExist:
            return Response({'detail': 'Email ou mot de passe incorrect.'}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.check_password(password):
            return Response({'detail': 'Email ou mot de passe incorrect.'}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.is_active:
            return Response({'detail': 'Compte désactivé.'}, status=status.HTTP_403_FORBIDDEN)
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'role': user.role,
            'prenom': user.first_name,
            'nom': user.last_name,
            'email': user.email,
            'id': str(user.id),
        })


class ProfilView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfilSerializer(request.user)
        return Response(serializer.data)


class ListeUtilisateursView(APIView):
    permission_classes = [EstAdminOuEcole]

    def get(self, request):
        role = request.query_params.get('role', None)
        users = Utilisateur.objects.all().order_by('role', 'last_name')
        if role:
            users = users.filter(role=role)
        serializer = UtilisateurSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CreerUtilisateurSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.save()
            return Response(UtilisateurSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DetailUtilisateurView(APIView):
    permission_classes = [EstAdminSys]

    def get_user(self, pk):
        try:
            return Utilisateur.objects.get(pk=pk)
        except Utilisateur.DoesNotExist:
            return None

    def get(self, request, pk):
        user = self.get_user(pk)
        if not user:
            return Response({'detail': 'Introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(UtilisateurSerializer(user).data)

    def patch(self, request, pk):
        user = self.get_user(pk)
        if not user:
            return Response({'detail': 'Introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UtilisateurSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        user = self.get_user(pk)
        if not user:
            return Response({'detail': 'Introuvable.'}, status=status.HTTP_404_NOT_FOUND)
        
        user.delete()
        
        return Response({'detail': 'Compte supprimé définitivement.'}, status=status.HTTP_204_NO_CONTENT)


class EcoleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Ecole.objects.all()
    serializer_class = EcoleSerializer

class EtudiantViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Etudiant.objects.all()
    serializer_class = EtudiantSerializer

class MesElevesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        eleves = Utilisateur.objects.filter(
            role='ETUDIANT',
            profil_etudiant__ecole__utilisateur=request.user
        ).order_by('-date_joined') 
        
        serializer = UtilisateurSerializer(eleves, many=True)
        return Response(serializer.data)

from django.db.models import Count, Avg

class StatsAdminMetierView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_ecoles = Ecole.objects.count()
        total_etudiants = Etudiant.objects.count()

        # Répartition par niveaux
        par_niveaux = (
            Ecole.objects
            .values('niveaux')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )

        # Répartition par ville (top 5)
        par_ville = (
            Ecole.objects
            .values('ville')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )

        # Moyennes des notes
        moyennes = Etudiant.objects.aggregate(
            moy_math=Avg('note_math'),
            moy_lecture=Avg('note_lecture'),
            moy_ecriture=Avg('note_ecriture'),
        )

        # Dernières écoles
        dernieres_ecoles = Ecole.objects.order_by('-id')[:5].values(
            'id', 'nom', 'ville', 'niveaux', 'capacite_eleves'
        )

        return Response({
            'total_ecoles': total_ecoles,
            'total_etudiants': total_etudiants,
            'par_niveaux': list(par_niveaux),
            'par_ville': list(par_ville),
            'moyennes': {
                'math':     round(moyennes['moy_math'] or 0, 1),
                'lecture':  round(moyennes['moy_lecture'] or 0, 1),
                'ecriture': round(moyennes['moy_ecriture'] or 0, 1),
            },
            'dernieres_ecoles': list(dernieres_ecoles),
        })   