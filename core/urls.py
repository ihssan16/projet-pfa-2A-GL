from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LoginView, ProfilView, ListeUtilisateursView, DetailUtilisateurView, EcoleViewSet, EtudiantViewSet, MesElevesView

router = DefaultRouter()
router.register(r'ecoles', EcoleViewSet)
router.register(r'etudiants', EtudiantViewSet)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('profil/', ProfilView.as_view(), name='profil'),
    path('utilisateurs/', ListeUtilisateursView.as_view(), name='liste-utilisateurs'),
    path('utilisateurs/<str:pk>/', DetailUtilisateurView.as_view(), name='detail-utilisateur'),
    path('mes-eleves/', MesElevesView.as_view(), name='mes-eleves'),
    path('', include(router.urls)),
]