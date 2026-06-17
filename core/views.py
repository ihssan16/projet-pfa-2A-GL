from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth.models import update_last_login
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Utilisateur, Ecole, Etudiant, Demande
from .serializers import UtilisateurSerializer, CreerUtilisateurSerializer, ProfilSerializer, EcoleSerializer, EtudiantSerializer
from rest_framework.permissions import BasePermission
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
import uuid
from django.db.models import Count, Avg
from django.utils import timezone
from django.conf import settings

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
        
        update_last_login(None, user)
        
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
        limit = request.query_params.get('limit', None)
        
        users = Utilisateur.objects.all().order_by('-date_joined', 'last_name')
        
        if role:
            users = users.filter(role=role)
            
        total_count = users.count()
            
        if limit:
            try:
                users = users[:int(limit)]
                serializer = UtilisateurSerializer(users, many=True)
                return Response({
                    'count': total_count,
                    'results': serializer.data
                })
            except ValueError:
                pass

        paginator = PageNumberPagination()
        paginator.page_size = 20
        result_page = paginator.paginate_queryset(users, request)
        serializer = UtilisateurSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = CreerUtilisateurSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.save()
            return Response(UtilisateurSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DetailUtilisateurView(APIView):
    permission_classes = [EstAdminOuEcole]

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


class StatsAdminMetierView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_ecoles = Ecole.objects.count()
        total_etudiants = Etudiant.objects.count()

        par_niveaux = (
            Ecole.objects
            .values('niveaux')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )

        par_ville = (
            Ecole.objects
            .values('ville')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )

        moyennes = Etudiant.objects.aggregate(
            moy_math=Avg('note_math'),
            moy_lecture=Avg('note_lecture'),
            moy_ecriture=Avg('note_ecriture'),
        )

        dernieres_ecoles = Ecole.objects.order_by('-id')[:5].values(
            'id', 'nom', 'ville', 'niveaux', 'capacite_eleves'
        )

        return Response({
            'total_ecoles': total_ecoles,
            'total_etudiants': total_etudiants,
            'par_niveaux': list(par_niveaux),
            'par_ville': list(par_ville),
            'moyennes': {
                'math': round(moyennes['moy_math'] or 0, 1),
                'lecture': round(moyennes['moy_lecture'] or 0, 1),
                'ecriture': round(moyennes['moy_ecriture'] or 0, 1),
            },
            'dernieres_ecoles': list(dernieres_ecoles),
        })


class StatistiquesDemandesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role == 'ADMIN_METIER':
            stats = {
                'en_attente': Demande.objects.filter(statut='EN_ATTENTE').count(),
                'en_cours': Demande.objects.filter(statut='EN_COURS').count(),
                'valides': Demande.objects.filter(statut='VALIDE_ADMIN').count(),
                'refuses': Demande.objects.filter(statut='REFUSE').count(),
            }
        elif request.user.role == 'MINISTERE':
            stats = {
                'en_attente': Demande.objects.filter(statut='VALIDE_ADMIN').count(),
                'valides': Demande.objects.filter(statut='VALIDE_MINISTERE').count(),
                'refuses': Demande.objects.filter(statut='REFUSE').count(),
            }
        else:
            stats = {}
        
        return Response(stats)


class DemandeView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, demande_id=None):
        # Récupérer les documents d'une demande spécifique
        if demande_id and 'documents' in request.path:
            try:
                demande = Demande.objects.get(id=demande_id)
            except Demande.DoesNotExist:
                return Response({'error': 'Demande non trouvée'}, status=404)
            
            # Vérifier l'autorisation
            if request.user.role == 'ECOLE':
                try:
                    ecole = request.user.profil_ecole
                    if demande.ecole != ecole:
                        return Response({'error': 'Accès non autorisé'}, status=403)
                except:
                    return Response({'error': 'Accès non autorisé'}, status=403)
            
            documents = []
            docs_path = os.path.join(settings.MEDIA_ROOT, f'demandes/{demande.id}')
            if os.path.exists(docs_path):
                for doc in os.listdir(docs_path):
                    documents.append({
                        'name': doc,
                        'url': f'/media/demandes/{demande.id}/{doc}'
                    })
            
            return Response({'documents': documents})
        
        # Récupérer la liste des demandes
        if request.user.role == 'ECOLE':
            try:
                ecole = request.user.profil_ecole
                demandes = Demande.objects.filter(ecole=ecole)
            except:
                demandes = Demande.objects.none()
        elif request.user.role == 'ADMIN_METIER':
            demandes = Demande.objects.filter(statut__in=['EN_ATTENTE', 'EN_COURS'])
        elif request.user.role == 'MINISTERE':
            demandes = Demande.objects.filter(statut='VALIDE_ADMIN')
        else:
            demandes = Demande.objects.all()
        
        data = []
        for demande in demandes:
            data.append({
                'id': str(demande.id),
                'reference': demande.reference,
                'etablissement': demande.ecole.nom,
                'ville': demande.ecole.ville or 'Non spécifiée',
                'type': demande.get_type_demande_display(),
                'date_depot': demande.date_depot.strftime('%Y-%m-%d'),
                'nb_fichiers': demande.nombre_fichiers,
                'statut': demande.get_statut_display(),
                'commentaire': demande.commentaire_admin or demande.commentaire_ministere,
            })
        
        return Response(data)
    
    def post(self, request, demande_id=None):
        # Upload de documents pour une demande existante
        if demande_id and 'upload' in request.path:
            try:
                demande = Demande.objects.get(id=demande_id)
            except Demande.DoesNotExist:
                return Response({'error': 'Demande non trouvée'}, status=404)
            
            # Vérifier l'autorisation
            if request.user.role == 'ECOLE':
                try:
                    ecole = request.user.profil_ecole
                    if demande.ecole != ecole:
                        return Response({'error': 'Accès non autorisé'}, status=403)
                except:
                    return Response({'error': 'Accès non autorisé'}, status=403)
            
            compteur = 0
            for key, file in request.FILES.items():
                extension = os.path.splitext(file.name)[1]
                unique_name = f"{uuid.uuid4().hex}{extension}"
                file_path = f'demandes/{demande.id}/{unique_name}'
                default_storage.save(file_path, ContentFile(file.read()))
                compteur += 1
            
            demande.nombre_fichiers += compteur
            demande.save()
            
            return Response({
                'message': f'{compteur} fichier(s) uploadé(s) avec succès',
                'nb_fichiers': demande.nombre_fichiers
            })
        
        # Créer une nouvelle demande
        if request.user.role != 'ECOLE':
            return Response({'error': 'Seules les écoles peuvent créer des demandes'}, status=403)
        
        try:
            ecole = request.user.profil_ecole
        except:
            return Response({'error': 'Aucune école associée'}, status=400)
        
        demande = Demande.objects.create(
            ecole=ecole,
            utilisateur=request.user,
            type_demande=request.data.get('type_demande', 'INSCRIPTION'),
            nombre_fichiers=0,
        )
        
        # Traiter les fichiers joints
        compteur = 0
        for key, file in request.FILES.items():
            if key != 'type_demande' and key != 'nombre_fichiers':
                extension = os.path.splitext(file.name)[1]
                unique_name = f"{uuid.uuid4().hex}{extension}"
                file_path = f'demandes/{demande.id}/{unique_name}'
                default_storage.save(file_path, ContentFile(file.read()))
                compteur += 1
        
        if compteur > 0:
            demande.nombre_fichiers = compteur
            demande.save()
        
        return Response({
            'id': str(demande.id),
            'reference': demande.reference,
            'message': 'Demande créée avec succès',
            'statut': demande.get_statut_display(),
            'nb_fichiers': compteur
        }, status=201)
    
    def patch(self, request, demande_id):
        try:
            demande = Demande.objects.get(id=demande_id)
        except Demande.DoesNotExist:
            return Response({'error': 'Demande non trouvée'}, status=404)
        
        action = request.data.get('action')
        commentaire = request.data.get('commentaire', '')
        
        if request.user.role == 'ADMIN_METIER' and demande.statut == 'EN_ATTENTE':
            if action == 'valider':
                demande.statut = 'VALIDE_ADMIN'
                demande.date_traitement_admin = timezone.now()
                demande.traite_par_admin = request.user
                demande.commentaire_admin = commentaire
                message = 'Dossier validé par Admin Métier, en attente de validation Ministère'
            elif action == 'refuser':
                demande.statut = 'REFUSE'
                demande.date_traitement_admin = timezone.now()
                demande.traite_par_admin = request.user
                demande.commentaire_admin = commentaire
                message = 'Dossier refusé'
            else:
                return Response({'error': 'Action non reconnue'}, status=400)
        
        elif request.user.role == 'MINISTERE' and demande.statut == 'VALIDE_ADMIN':
            if action == 'valider':
                demande.statut = 'VALIDE_MINISTERE'
                demande.date_traitement_ministere = timezone.now()
                demande.traite_par_ministere = request.user
                demande.commentaire_ministere = commentaire
                message = 'Dossier définitivement validé par le Ministère'
            elif action == 'refuser':
                demande.statut = 'REFUSE'
                demande.date_traitement_ministere = timezone.now()
                demande.traite_par_ministere = request.user
                demande.commentaire_ministere = commentaire
                message = 'Dossier refusé par le Ministère'
            else:
                return Response({'error': 'Action non reconnue'}, status=400)
        
        else:
            return Response({'error': 'Action non autorisée pour ce statut ou ce rôle'}, status=403)
        
        demande.save()
        
        return Response({
            'message': message,
            'statut': demande.get_statut_display(),
            'demande_id': str(demande.id),
        })

class EcoleInscriptionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Récupérer les demandes d'inscription selon le rôle"""
        if request.user.role == 'ADMIN_METIER':
            ecoles = Ecole.objects.filter(statut_inscription='EN_ATTENTE_ADMIN',
                                          est_demande_inscription=True
            )        
        elif request.user.role == 'MINISTERE':
            ecoles = Ecole.objects.filter(statut_inscription='VALIDE_ADMIN', est_demande_inscription=True)
        elif request.user.role == 'ADMIN_SYS':
            ecoles = Ecole.objects.filter(statut_inscription='VALIDE_MINISTERE', est_demande_inscription=True)
        else:
            ecoles = Ecole.objects.none()
        
        data = []
        for ecole in ecoles:
            data.append({
                'id': str(ecole.id),
                'nom': ecole.nom,
                'ville': ecole.ville,
                'niveaux': ecole.niveaux,
                'capacite_eleves': ecole.capacite_eleves,
                'statut': ecole.get_statut_inscription_display(),
                'date_demande': ecole.date_demande.strftime('%Y-%m-%d %H:%M') if ecole.date_demande else None,
                'date_validation_admin': ecole.date_validation_admin.strftime('%Y-%m-%d %H:%M') if ecole.date_validation_admin else None,
                'email_contact': ecole.email_contact,
                'telephone': ecole.telephone,
                'site_web': ecole.site_web,
                'document_autorisation': ecole.document_autorisation.url if ecole.document_autorisation else None,
                'document_identite': ecole.document_identite.url if ecole.document_identite else None,
                'document_justificatif': ecole.document_justificatif.url if ecole.document_justificatif else None,
            })
        
        return Response(data)
    
    def post(self, request):
        """Admin Métier crée une demande d'inscription d'école"""
        if request.user.role != 'ADMIN_METIER':
            return Response({'error': 'Seul l\'Admin Métier peut créer une demande d\'inscription'}, status=403)
        
        # Créer l'école avec statut EN_ATTENTE_ADMIN
        ecole = Ecole.objects.create(
            nom=request.data.get('nom'),
            ville=request.data.get('ville'),
            niveaux=request.data.get('niveaux'),
            capacite_eleves=request.data.get('capacite_eleves', 0),
            statut_inscription='EN_ATTENTE_ADMIN',
            date_demande=timezone.now(),
            email_contact=request.data.get('email_contact'),
            telephone=request.data.get('telephone'),
            site_web=request.data.get('site_web'),
            est_demande_inscription=True,
        )
        
        # Traiter les documents
        if 'document_autorisation' in request.FILES:
            ecole.document_autorisation = request.FILES['document_autorisation']
        if 'document_identite' in request.FILES:
            ecole.document_identite = request.FILES['document_identite']
        if 'document_justificatif' in request.FILES:
            ecole.document_justificatif = request.FILES['document_justificatif']
        ecole.save()
        
        return Response({
            'id': str(ecole.id),
            'nom': ecole.nom,
            'statut': ecole.get_statut_inscription_display(),
            'message': 'Demande d\'inscription créée avec succès'
        }, status=201)
    
    def patch(self, request, ecole_id):
        """Valider ou refuser une demande d'inscription"""
        print(f"=== PATCH EcoleInscriptionView ===")
        print(f"ecole_id reçu: {ecole_id}")
        print(f"Type de ecole_id: {type(ecole_id)}")
        
        try:
            # Essayer de trouver l'école avec est_demande_inscription=True
            ecole = Ecole.objects.get(id=ecole_id, est_demande_inscription=True)
            print(f"École trouvée avec UUID: {ecole.id} - {ecole.nom}")
        except Ecole.DoesNotExist:
            # Si pas trouvée, essayer de convertir en entier (pour les anciennes demandes)
            try:
                ecole_id_int = int(ecole_id)
                ecole = Ecole.objects.get(id=ecole_id_int, est_demande_inscription=True)
                print(f"École trouvée avec ID numérique: {ecole.id} - {ecole.nom}")
            except (ValueError, Ecole.DoesNotExist):
                print(f"Demande non trouvée: {ecole_id}")
                return Response({'error': 'Demande d\'inscription non trouvée'}, status=404)
        
        action = request.data.get('action')
        print(f"Action: {action}")
        
        # Admin Métier valide
        if request.user.role == 'ADMIN_METIER' and ecole.statut_inscription == 'EN_ATTENTE_ADMIN':
            if action == 'valider':
                ecole.statut_inscription = 'VALIDE_ADMIN'
                ecole.date_validation_admin = timezone.now()
                message = 'École validée par Admin Métier, en attente de validation Ministère'
            elif action == 'refuser':
                ecole.statut_inscription = 'REFUSEE'
                message = 'Demande d\'inscription refusée'
            else:
                return Response({'error': 'Action non reconnue'}, status=400)
        
        # Ministère valide
        elif request.user.role == 'MINISTERE' and ecole.statut_inscription == 'VALIDE_ADMIN':
            if action == 'valider':
                ecole.statut_inscription = 'VALIDE_MINISTERE'
                ecole.date_validation_ministere = timezone.now()
                message = 'École validée par le Ministère, prête pour création'
            elif action == 'refuser':
                ecole.statut_inscription = 'REFUSEE'
                message = 'Demande d\'inscription refusée par le Ministère'
            else:
                return Response({'error': 'Action non reconnue'}, status=400)
        
        # Admin Système crée l'école
        elif request.user.role == 'ADMIN_SYS' and ecole.statut_inscription == 'VALIDE_MINISTERE':
            if action == 'creer':
                ecole.statut_inscription = 'ACTIVE'
                ecole.date_creation = timezone.now()
                
                # Créer un compte utilisateur pour l'école
                from django.contrib.auth import get_user_model
                User = get_user_model()
                email = request.data.get('email', f"ecole_{str(ecole.id)[:8]}@example.com")
                password = request.data.get('password', 'ecole123456')
                
                user = User.objects.create(
                    email=email,
                    username=f"ecole_{str(ecole.id)[:8]}",
                    first_name=request.data.get('contact_nom', ''),
                    last_name=request.data.get('contact_prenom', ''),
                    role='ECOLE',
                    is_active=True
                )
                user.set_password(password)
                user.save()
                ecole.utilisateur = user
                message = f'École créée avec succès. Login: {email} / Mot de passe: {password}'
            else:
                return Response({'error': 'Action non reconnue'}, status=400)
        else:
            return Response({'error': 'Action non autorisée'}, status=403)
        
        ecole.save()
        print(f"Nouveau statut: {ecole.statut_inscription}")
        
        return Response({
            'message': message,
            'statut': ecole.get_statut_inscription_display(),
            'ecole_id': str(ecole.id)
        })