from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, ProfilView, ListeUtilisateursView, DetailUtilisateurView, EcoleViewSet, EtudiantViewSet, MesElevesView, StatsAdminMetierView, EtablissementsMinistereView
from .views import StatistiquesDemandesView, DemandeView
from .views import EcoleInscriptionView, MinistereStatsAPIView, MesEnseignantsView

router = DefaultRouter()
router.register(r'ecoles', EcoleViewSet)
router.register(r'etudiants', EtudiantViewSet)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('profil/', ProfilView.as_view(), name='profil'),
    path('utilisateurs/', ListeUtilisateursView.as_view(), name='liste-utilisateurs'),
    path('utilisateurs/<str:pk>/', DetailUtilisateurView.as_view(), name='detail-utilisateur'),
    path('mes-eleves/', MesElevesView.as_view(), name='mes-eleves'),
    path('stats-admin-metier/', StatsAdminMetierView.as_view(), name='stats-admin-metier'),
    path('', include(router.urls)),
    path('stats-demandes/', StatistiquesDemandesView.as_view(), name='stats-demandes'),
    path('demandes/', DemandeView.as_view(), name='demandes-list'),
    path('demandes/<uuid:demande_id>/', DemandeView.as_view(), name='demande-detail'),
    path('demandes/<uuid:demande_id>/documents/', DemandeView.as_view(), name='demande-documents'),
    path('demandes/<uuid:demande_id>/upload/', DemandeView.as_view(), name='demande-upload'),
    path('demandes/<uuid:demande_id>/download/<str:filename>/', DemandeView.as_view(), name='demande-download'),
    path('ecoles-inscription/', EcoleInscriptionView.as_view(), name='ecoles-inscription'),
    path('ecoles-inscription/<str:ecole_id>/', EcoleInscriptionView.as_view(), name='ecole-inscription-detail'),
    
    path('ministere-stats/', MinistereStatsAPIView.as_view(), name='ministere-stats'),
    path('etablissements-ministere/', EtablissementsMinistereView.as_view(), name='etablissements-ministere'),
    path('mes-enseignants/', MesEnseignantsView.as_view(), name='mes-enseignants'),
]